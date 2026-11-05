import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/judgment_details_model.dart';
import '../models/precedent_model.dart';

class ResearchRepository {
  final ApiClient apiClient;

  ResearchRepository({required this.apiClient});

  Future<List<Precedent>> searchPrecedents({
    required String query,
    String? court,
    String? year,
  }) async {
    try {
      final response = await apiClient.dio.post(
        ApiEndpoints.precedentResearch,
        data: {
          'query': query,
          if (court != null && court.isNotEmpty) 'court': court,
          if (year != null && year.isNotEmpty) 'year': year,
        },
      );

      final dynamic data = response.data;
      List<dynamic> items = [];

      if (data is Map<String, dynamic>) {
        if (data['data'] != null) {
          final payload = data['data'];
          if (payload is Map<String, dynamic> && payload['precedents'] is List) {
            items = payload['precedents'];
          } else if (payload is List) {
            items = payload;
          }
        } else if (data['precedents'] is List) {
          items = data['precedents'];
        }
      } else if (data is List) {
        items = data;
      }

      return items.map((e) => Precedent.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw Exception(
        e.response?.data?['message'] ?? 'Failed to search precedents. Please check connection.',
      );
    }
  }

  Future<JudgmentDetailsModel?> getJudgmentDetails(String identifier) async {
    try {
      final endpoint = ApiEndpoints.judgmentDetails.replaceFirst(':id', Uri.encodeComponent(identifier));
      final response = await apiClient.dio.get(endpoint);
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final payload = data['data']?['judgment'] ?? data['data'] ?? data['judgment'];
        if (payload is Map<String, dynamic>) {
          return JudgmentDetailsModel.fromJson(payload);
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  String getJudgmentPdfUrl(String identifier) {
    return '${ApiEndpoints.baseUrl}tools/judgment/${Uri.encodeComponent(identifier)}/pdf';
  }
}

