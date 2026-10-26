import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/services/storage_service.dart';

// Events
abstract class AuthEvent {}

class CheckAuthStatus extends AuthEvent {}

class LoginSubmitted extends AuthEvent {
  final String email;
  final String password;
  LoginSubmitted({required this.email, required this.password});
}

class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState {}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class Authenticated extends AuthState {
  final String role;
  final String name;
  final String email;
  Authenticated({required this.role, required this.name, required this.email});
}
class Unauthenticated extends AuthState {}
class AuthFailure extends AuthState {
  final String error;
  AuthFailure({required this.error});
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiClient apiClient;
  final StorageService storageService;

  AuthBloc({required this.apiClient, required this.storageService}) : super(AuthInitial()) {
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LoginSubmitted>(_onLoginSubmitted);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckAuthStatus(CheckAuthStatus event, Emitter<AuthState> emit) async {
    final token = await storageService.getToken();
    if (token != null && token.isNotEmpty) {
      final role = await storageService.getUserRole() ?? 'admin';
      final name = await storageService.getUserName() ?? 'Administrator';
      final email = await storageService.getUserEmail() ?? '';
      emit(Authenticated(role: role, name: name, email: email));
    } else {
      emit(Unauthenticated());
    }
  }

  Future<void> _onLoginSubmitted(LoginSubmitted event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final response = await apiClient.dio.post(
        ApiEndpoints.login,
        data: {
          'email': event.email.trim(),
          'password': event.password,
        },
      );

      final data = response.data;
      if (response.statusCode == 200 || response.statusCode == 201) {
        final resData = (data is Map<String, dynamic> && data['data'] is Map<String, dynamic>)
            ? data['data'] as Map<String, dynamic>
            : (data is Map<String, dynamic> ? data : <String, dynamic>{});

        final token = resData['accessToken'] ?? resData['token'] ?? data['token'];
        final refreshToken = resData['refreshToken'] ?? data['refreshToken'];
        final user = (resData['user'] is Map<String, dynamic>)
            ? resData['user'] as Map<String, dynamic>
            : ((data['user'] is Map<String, dynamic>) ? data['user'] as Map<String, dynamic> : <String, dynamic>{});

        // Parse role: handles strings, or list of objects e.g. [{"name": "admin", "slug": "admin"}]
        String role = 'user';
        final rawRoles = user['roles'] ?? user['role'];
        if (rawRoles is List && rawRoles.isNotEmpty) {
          final first = rawRoles.first;
          if (first is Map) {
            role = (first['slug'] ?? first['name'] ?? 'user').toString().toLowerCase();
          } else {
            role = first.toString().toLowerCase();
          }
        } else if (rawRoles is String) {
          role = rawRoles.toLowerCase();
        }

        // Security check: Must have admin or editor privileges
        final allowedRoles = ['admin', 'super-admin', 'super admin', 'editor', 'staff'];
        final hasAdminRole = allowedRoles.any((r) => role.contains(r));

        if (!hasAdminRole) {
          emit(AuthFailure(error: "Access denied. Only administrators and staff can log in."));
          return;
        }

        final name = (user['name'] ?? "${user['firstName'] ?? ''} ${user['lastName'] ?? ''}").toString().trim();
        final email = (user['email'] ?? event.email).toString();

        if (token != null) {
          await storageService.saveToken(token.toString());
        }
        if (refreshToken != null) {
          await storageService.saveRefreshToken(refreshToken.toString());
        }

        await storageService.saveUserProfile(
          name: name.isEmpty ? "Administrator" : name,
          email: email,
          role: role,
        );

        emit(Authenticated(
          role: role,
          name: name.isEmpty ? "Administrator" : name,
          email: email,
        ));
      } else {
        emit(AuthFailure(error: data['message'] ?? "Invalid login credentials."));
      }
    } catch (e) {
      emit(AuthFailure(error: "Failed to connect to server. Check credentials or network."));
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    await storageService.clearAll();
    emit(Unauthenticated());
  }
}
