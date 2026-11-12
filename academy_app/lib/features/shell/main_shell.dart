import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../academy/data/repositories/academy_repository.dart';
import '../academy/presentation/pages/academy_home_page.dart';
import '../academy/presentation/pages/certificates_page.dart';
import '../academy/presentation/pages/live_sessions_page.dart';
import '../academy/presentation/pages/my_learning_page.dart';

class MainShell extends StatefulWidget {
  final ApiClient apiClient;

  const MainShell({super.key, required this.apiClient});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  late final AcademyRepository _repository;

  @override
  void initState() {
    super.initState();
    _repository = AcademyRepository(apiClient: widget.apiClient);
  }

  List<Widget> _buildPages() {
    return [
      AcademyHomePage(apiClient: widget.apiClient),
      MyLearningPage(repository: _repository),
      LiveSessionsPage(repository: _repository),
      CertificatesPage(repository: _repository),
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
          selectedFontSize: 10.5,
          unselectedFontSize: 10.5,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined, size: 20),
              activeIcon: Icon(Icons.explore_rounded, size: 20),
              label: 'Explore',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.school_outlined, size: 20),
              activeIcon: Icon(Icons.school_rounded, size: 20),
              label: 'My Courses',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.videocam_outlined, size: 20),
              activeIcon: Icon(Icons.videocam_rounded, size: 20),
              label: 'Live Classes',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.verified_outlined, size: 20),
              activeIcon: Icon(Icons.verified_rounded, size: 20),
              label: 'Certificates',
            ),
          ],
        ),
      ),
    );
  }
}

