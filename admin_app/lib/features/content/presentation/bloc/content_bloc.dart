import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../data/article_model.dart';

// Events
abstract class ContentEvent {}

class FetchArticles extends ContentEvent {
  final String status;
  final String query;
  FetchArticles({this.status = "all", this.query = ""});
}

class ApproveArticleEvent extends ContentEvent {
  final String id;
  ApproveArticleEvent({required this.id});
}

class RejectArticleEvent extends ContentEvent {
  final String id;
  final String reason;
  RejectArticleEvent({required this.id, required this.reason});
}

class DeleteArticleEvent extends ContentEvent {
  final String id;
  DeleteArticleEvent({required this.id});
}

// States
abstract class ContentState {}

class ContentInitial extends ContentState {}
class ContentLoading extends ContentState {}
class ContentLoaded extends ContentState {
  final List<AdminArticleModel> articles;
  final String currentStatus;
  final String query;

  ContentLoaded({
    required this.articles,
    required this.currentStatus,
    required this.query,
  });
}
class ContentError extends ContentState {
  final String message;
  ContentError({required this.message});
}

// BLoC
class ContentBloc extends Bloc<ContentEvent, ContentState> {
  final ApiClient apiClient;

  ContentBloc({required this.apiClient}) : super(ContentInitial()) {
    on<FetchArticles>(_onFetchArticles);
    on<ApproveArticleEvent>(_onApproveArticle);
    on<RejectArticleEvent>(_onRejectArticle);
    on<DeleteArticleEvent>(_onDeleteArticle);
  }

  Future<void> _onFetchArticles(FetchArticles event, Emitter<ContentState> emit) async {
    emit(ContentLoading());
    try {
      final queryParams = <String, dynamic>{
        'type': 'my-content',
        if (event.status != "all") 'status': event.status,
        if (event.query.isNotEmpty) ...{
          'q': event.query,
          'search': event.query,
        },
        'limit': 20,
      };

      final response = await apiClient.dio.get(
        ApiEndpoints.articles,
        queryParameters: queryParams,
      );

      final data = response.data;
      List rawList = [];
      if (data is List) {
        rawList = data;
      } else if (data is Map) {
        if (data['data'] is List) {
          rawList = data['data'];
        } else if (data['data'] is Map && data['data']['data'] is List) {
          rawList = data['data']['data'];
        } else if (data['data'] is Map && data['data']['articles'] is List) {
          rawList = data['data']['articles'];
        } else if (data['articles'] is List) {
          rawList = data['articles'];
        } else if (data['results'] is List) {
          rawList = data['results'];
        }
      }

      List<AdminArticleModel> articles = rawList.map((e) {
        if (e is Map<String, dynamic>) {
          return AdminArticleModel.fromJson(e);
        } else if (e is Map) {
          return AdminArticleModel.fromJson(Map<String, dynamic>.from(e));
        }
        return AdminArticleModel.fromJson({});
      }).toList();

      // Client-side verification to guarantee tab isolation
      if (event.status != "all") {
        articles = articles
            .where((a) => a.status.toLowerCase().trim() == event.status.toLowerCase().trim())
            .toList();
      }

      emit(ContentLoaded(
        articles: articles,
        currentStatus: event.status,
        query: event.query,
      ));
    } catch (e) {
      String message = e.toString();
      if (e is DioException && e.response?.data is Map) {
        message = e.response?.data['message']?.toString() ?? e.message ?? "Failed to fetch articles";
      }
      emit(ContentError(message: message));
    }
  }

  Future<void> _onApproveArticle(ApproveArticleEvent event, Emitter<ContentState> emit) async {
    try {
      await apiClient.dio.patch(
        ApiEndpoints.articleApprove.replaceAll(":id", event.id),
      );
      if (state is ContentLoaded) {
        final current = state as ContentLoaded;
        add(FetchArticles(status: current.currentStatus, query: current.query));
      }
    } catch (e) {
      if (state is ContentLoaded) {
        final current = state as ContentLoaded;
        add(FetchArticles(status: current.currentStatus, query: current.query));
      }
    }
  }

  Future<void> _onRejectArticle(RejectArticleEvent event, Emitter<ContentState> emit) async {
    try {
      await apiClient.dio.patch(
        ApiEndpoints.articleReject.replaceAll(":id", event.id),
        data: {'rejectionReason': event.reason},
      );
      if (state is ContentLoaded) {
        final current = state as ContentLoaded;
        add(FetchArticles(status: current.currentStatus, query: current.query));
      }
    } catch (e) {
      if (state is ContentLoaded) {
        final current = state as ContentLoaded;
        add(FetchArticles(status: current.currentStatus, query: current.query));
      }
    }
  }

  Future<void> _onDeleteArticle(DeleteArticleEvent event, Emitter<ContentState> emit) async {
    try {
      await apiClient.dio.delete("${ApiEndpoints.articles}/${event.id}");
      if (state is ContentLoaded) {
        final current = state as ContentLoaded;
        add(FetchArticles(status: current.currentStatus, query: current.query));
      }
    } catch (e) {
      // Refresh
    }
  }
}
