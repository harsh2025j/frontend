import 'dart:io';
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../constants/api_endpoints.dart';
import '../services/storage_service.dart';

class ApiClient {
  late final Dio dio;
  final StorageService storageService;

  ApiClient({required this.storageService}) {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 40),
        receiveTimeout: const Duration(seconds: 90), // AI tools might take longer
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Auth & Error Interceptors
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            await storageService.clearAll();
          }
          return handler.next(error);
        },
      ),
    );

    // Pretty Logger
    dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: false,
        responseHeader: false,
        error: true,
        compact: true,
        maxWidth: 90,
      ),
    );
  }

  /// Direct S3 File Upload using Presigned URL
  Future<String> uploadFileToS3(File file, {String? customFileName}) async {
    try {
      final String originalName = customFileName ?? file.path.split(Platform.pathSeparator).last;
      final String sanitizedName = originalName.replaceAll(RegExp(r'[^a-zA-Z0-9.-]'), '_');
      final String filename = "${DateTime.now().millisecondsSinceEpoch}-$sanitizedName";

      String contentType = "application/octet-stream";
      final ext = filename.split('.').last.toLowerCase();
      if (['jpg', 'jpeg'].contains(ext)) {
        contentType = 'image/jpeg';
      } else if (ext == 'png') {
        contentType = 'image/png';
      } else if (ext == 'pdf') {
        contentType = 'application/pdf';
      } else if (['doc', 'docx'].contains(ext)) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      final presignedResponse = await dio.post(
        ApiEndpoints.s3PresignedUrl,
        data: {
          'filename': filename,
          'contentType': contentType,
        },
      );

      final dynamic responseData = presignedResponse.data;
      String? uploadUrl;

      if (responseData is Map<String, dynamic>) {
        uploadUrl = responseData['data']?['url'] ?? responseData['url'];
      }

      if (uploadUrl == null || uploadUrl.isEmpty) {
        throw Exception("Failed to get presigned URL from backend.");
      }

      final fileBytes = await file.readAsBytes();
      final s3Dio = Dio();

      await s3Dio.put(
        uploadUrl,
        data: fileBytes,
        options: Options(
          headers: {
            'Content-Type': contentType,
            'Content-Length': fileBytes.length,
          },
        ),
      );

      final cleanUrl = uploadUrl.split('?').first;
      return cleanUrl;
    } catch (e) {
      rethrow;
    }
  }
}

