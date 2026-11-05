import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../ai_assistant/presentation/ai_assistant_page.dart';
import '../court_drafting/presentation/drafting_page.dart';
import '../legal_documents/data/repositories/documents_repository.dart';
import '../legal_documents/presentation/documents_catalog_page.dart';
import '../precedent_research/presentation/research_search_page.dart';
import '../tools_hub/presentation/tools_hub_page.dart';

class MainShell extends StatefulWidget {
  final ApiClient apiClient;

  const MainShell({super.key, required this.apiClient});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  List<Widget> _buildPages() {
    return [
      ToolsHubPage(apiClient: widget.apiClient),
      AIAssistantPage(apiClient: widget.apiClient),
      const ResearchSearchPage(),
      const DraftingPage(),
      DocumentsCatalogPage(
        repository: DocumentsRepository(apiClient: widget.apiClient),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final pages = _buildPages();

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex.clamp(0, pages.length - 1),
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surfaceWhite,
          border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex.clamp(0, pages.length - 1),
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.surfaceWhite,
          selectedItemColor: AppColors.primaryNavy,
          unselectedItemColor: AppColors.textMuted,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard_rounded),
              label: 'Tools',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_awesome_outlined),
              activeIcon: Icon(Icons.auto_awesome_rounded),
              label: 'AI tools',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_rounded),
              activeIcon: Icon(Icons.manage_search_rounded),
              label: 'Research',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.gavel_outlined),
              activeIcon: Icon(Icons.gavel_rounded),
              label: 'Pleadings',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.library_books_outlined),
              activeIcon: Icon(Icons.library_books_rounded),
              label: 'Documents',
            ),
          ],
        ),
      ),
    );
  }
}
