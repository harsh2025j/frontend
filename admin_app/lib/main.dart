import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/services/storage_service.dart';
import 'core/network/api_client.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/content/presentation/bloc/content_bloc.dart';
import 'features/splash/presentation/splash_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = StorageService();
  final apiClient = ApiClient(storageService: storageService);

  runApp(
    RepositoryProvider<ApiClient>.value(
      value: apiClient,
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              apiClient: apiClient,
              storageService: storageService,
            )..add(CheckAuthStatus()),
          ),
          BlocProvider<ContentBloc>(
            create: (context) => ContentBloc(apiClient: apiClient),
          ),
        ],
        child: const AdminApp(),
      ),
    ),
  );
}

class AdminApp extends StatelessWidget {
  const AdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sajjad Husain Admin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const SplashScreen(),
    );
  }
}
