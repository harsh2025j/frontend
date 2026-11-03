import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/draft_request_model.dart';

class DraftingRepository {
  final ApiClient apiClient;

  DraftingRepository({required this.apiClient});

  Future<DraftResponse> generateLegalDraft(DraftRequest request) async {
    try {
      final response = await apiClient.dio.post(
        ApiEndpoints.courtDrafting,
        data: request.toJson(),
        options: Options(
          sendTimeout: const Duration(seconds: 40),
          receiveTimeout: const Duration(seconds: 90),
        ),
      );

      final dynamic data = response.data;
      if (data is Map<String, dynamic>) {
        final payload = data['data']?['draft'] ?? data['data'] ?? data['draft'] ?? data;
        if (payload is Map<String, dynamic>) {
          return DraftResponse.fromJson(payload);
        } else if (payload is String) {
          return DraftResponse(title: request.petitionType, content: payload);
        }
      }
      return DraftResponse(title: request.petitionType, content: data.toString());
    } on DioException catch (e) {
      throw Exception(
        e.response?.data?['message'] ?? 'Drafting service failed. Please try again.',
      );
    }
  }

  Future<bool> saveDraft({required String title, required String content}) async {
    try {
      await apiClient.dio.post(
        ApiEndpoints.draftSave,
        data: {'title': title, 'content': content},
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<List<Map<String, String>>> fetchDraftHistory() async {
    try {
      final response = await apiClient.dio.get(ApiEndpoints.draftHistory);
      final dynamic raw = response.data;
      final List<dynamic> items = raw is Map ? (raw['data'] ?? raw['drafts'] ?? []) : (raw is List ? raw : []);
      return items.map<Map<String, String>>((e) {
        return {
          'title': (e['title'] ?? 'Untitled Draft').toString(),
          'date': (e['createdAt'] ?? e['date'] ?? '').toString(),
          'content': (e['content'] ?? '').toString(),
        };
      }).toList();
    } catch (_) {
      return [];
    }
  }
}

