import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../auth/presentation/bloc/auth_bloc.dart';
import 'presentation/dashboard_page.dart';
import '../content/presentation/content_management_page.dart';
import '../academy/presentation/academy_courses_page.dart';
import '../legal/presentation/cases_judgments_page.dart';
import '../users/presentation/users_management_page.dart';
import '../appointments/presentation/appointments_page.dart';
import '../broadcast/presentation/broadcast_notifications_page.dart';
import '../profile/presentation/profile_page.dart';

class MainNavigationShell extends StatefulWidget {
  final String adminName;
  final String adminRole;

  const MainNavigationShell({
    super.key,
    required this.adminName,
    required this.adminRole,
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _selectedIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const DashboardPage(),
      const ContentManagementPage(),
      const AcademyCoursesPage(),
      const CasesJudgmentsPage(),
      ProfilePage(
        adminName: widget.adminName,
        adminRole: widget.adminRole,
        onLogout: _confirmLogout,
      ),
      const UsersManagementPage(),
      const AppointmentsPage(),
      const BroadcastNotificationsPage(),
    ];
  }

  final List<({String title, IconData icon})> _navItems = const [
    (title: "Dashboard", icon: Icons.dashboard_outlined),
    (title: "Content", icon: Icons.article_outlined),
    (title: "Academy", icon: Icons.school_outlined),
    (title: "Legal Data", icon: Icons.gavel_outlined),
    (title: "Profile", icon: Icons.person_outline),
    (title: "Users", icon: Icons.people_outline),
    (title: "Appointments", icon: Icons.calendar_today_outlined),
    (title: "Broadcast", icon: Icons.notifications_none_outlined),
  ];

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceWhite,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        title: const Text("Log Out", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        content: const Text("Are you sure you want to end your admin session?", style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: AppColors.textWhite,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AuthBloc>().add(LogoutRequested());
            },
            child: const Text("Log Out", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.primaryDark,
        elevation: 0,
        title: Text(
          _navItems[_selectedIndex].title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textWhite,
            letterSpacing: 0.3,
          ),
        ),
      ),
      drawer: Drawer(
        backgroundColor: AppColors.primaryDark,
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: AppColors.primaryNavy),
              margin: EdgeInsets.zero,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.gold,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Icon(Icons.gavel, color: AppColors.primaryDark, size: 20),
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Sajjad Husain Law Associates",
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textWhite),
                  ),
                  Text(
                    "Role: ${widget.adminRole.toUpperCase()}",
                    style: const TextStyle(fontSize: 11, color: AppColors.goldLight),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: _navItems.length,
                separatorBuilder: (ctx, i) => const SizedBox(height: 2),
                itemBuilder: (ctx, i) {
                  final isSelected = _selectedIndex == i;
                  final item = _navItems[i];
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primarySurface : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: ListTile(
                      dense: true,
                      visualDensity: VisualDensity.compact,
                      leading: Icon(
                        item.icon,
                        size: 18,
                        color: isSelected ? AppColors.gold : AppColors.textMuted,
                      ),
                      title: Text(
                        item.title,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                          color: isSelected ? AppColors.textWhite : AppColors.textMuted,
                        ),
                      ),
                      onTap: () {
                        setState(() => _selectedIndex = i);
                        Navigator.pop(context);
                      },
                    ),
                  );
                },
              ),
            ),
            const Divider(color: AppColors.primaryLight),
            ListTile(
              dense: true,
              leading: const Icon(Icons.exit_to_app, size: 18, color: AppColors.danger),
              title: const Text("Sign Out", style: TextStyle(fontSize: 13, color: AppColors.danger)),
              onTap: () {
                Navigator.pop(context);
                _confirmLogout();
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        height: 58,
        elevation: 2,
        backgroundColor: AppColors.surfaceWhite,
        indicatorColor: AppColors.goldSurface,
        selectedIndex: _selectedIndex >= 5 ? 4 : _selectedIndex,
        onDestinationSelected: (idx) {
          setState(() => _selectedIndex = idx);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined, size: 20, color: AppColors.textSecondary),
            selectedIcon: Icon(Icons.dashboard, size: 20, color: AppColors.primaryNavy),
            label: "Home",
          ),
          NavigationDestination(
            icon: Icon(Icons.article_outlined, size: 20, color: AppColors.textSecondary),
            selectedIcon: Icon(Icons.article, size: 20, color: AppColors.primaryNavy),
            label: "Content",
          ),
          NavigationDestination(
            icon: Icon(Icons.school_outlined, size: 20, color: AppColors.textSecondary),
            selectedIcon: Icon(Icons.school, size: 20, color: AppColors.primaryNavy),
            label: "Academy",
          ),
          NavigationDestination(
            icon: Icon(Icons.gavel_outlined, size: 20, color: AppColors.textSecondary),
            selectedIcon: Icon(Icons.gavel, size: 20, color: AppColors.primaryNavy),
            label: "Legal",
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline, size: 20, color: AppColors.textSecondary),
            selectedIcon: Icon(Icons.person, size: 20, color: AppColors.primaryNavy),
            label: "Profile",
          ),
        ],
      ),
    );
  }
}
