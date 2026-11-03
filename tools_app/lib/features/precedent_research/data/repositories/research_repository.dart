import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
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

  Future<Precedent?> getJudgmentDetails(String id) async {
    try {
      final endpoint = ApiEndpoints.judgmentDetails.replaceFirst(':id', id);
      final response = await apiClient.dio.get(endpoint);
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final payload = data['data']?['judgment'] ?? data['data'] ?? data['judgment'];
        if (payload is Map<String, dynamic>) {
          return Precedent.fromJson(payload);
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}

