import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/network/api_client.dart';
import 'core/services/storage_service.dart';
import 'core/theme/app_theme.dart';
import 'features/academy/data/repositories/academy_repository.dart';
import 'features/splash/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  final storageService = StorageService();
  final apiClient = ApiClient(storageService: storageService);
  final academyRepository = AcademyRepository(apiClient: apiClient);

  runApp(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: storageService),
        RepositoryProvider.value(value: apiClient),
        RepositoryProvider.value(value: academyRepository),
      ],
      child: AcademyApp(apiClient: apiClient),
    ),
  );
}

class AcademyApp extends StatelessWidget {
  final ApiClient apiClient;

  const AcademyApp({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Legal Academy | Sajjad Husain Law Associates',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: SplashScreen(apiClient: apiClient),
    );
  }
}
