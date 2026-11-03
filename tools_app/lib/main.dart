import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/network/api_client.dart';
import 'core/services/storage_service.dart';
import 'core/theme/app_theme.dart';
import 'features/court_drafting/data/repositories/drafting_repository.dart';
import 'features/court_drafting/presentation/bloc/drafting_bloc.dart';
import 'features/precedent_research/data/repositories/research_repository.dart';
import 'features/precedent_research/presentation/bloc/research_bloc.dart';
import 'features/shell/main_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set professional status bar overlay
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  final storageService = StorageService();
  final apiClient = ApiClient(storageService: storageService);

  final researchRepository = ResearchRepository(apiClient: apiClient);
  final draftingRepository = DraftingRepository(apiClient: apiClient);

  runApp(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: storageService),
        RepositoryProvider.value(value: apiClient),
        RepositoryProvider.value(value: researchRepository),
        RepositoryProvider.value(value: draftingRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => ResearchBloc(repository: researchRepository),
          ),
          BlocProvider(
            create: (context) => DraftingBloc(repository: draftingRepository),
          ),
        ],
        child: ToolsApp(apiClient: apiClient),
      ),
    ),
  );
}

class ToolsApp extends StatelessWidget {
  final ApiClient apiClient;

  const ToolsApp({super.key, required this.apiClient});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Legal AI Tools',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: MainShell(apiClient: apiClient),
    );
  }
}
