import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../users/presentation/users_management_page.dart';
import '../../appointments/presentation/appointments_page.dart';
import '../../broadcast/presentation/broadcast_notifications_page.dart';
import '../../legal/presentation/cases_judgments_page.dart';

class ProfilePage extends StatelessWidget {
  final String adminName;
  final String adminRole;
  final VoidCallback onLogout;

  const ProfilePage({
    super.key,
    required this.adminName,
    required this.adminRole,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final String initial = adminName.isNotEmpty
        ? adminName[0].toUpperCase()
        : 'A';

    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Admin Profile Header Card (Compact & Elegant)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primaryNavy,
                        border: Border.all(color: AppColors.gold, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          initial,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AppColors.goldLight,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            adminName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "Role: ${adminRole.toUpperCase()}",
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.goldDark,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // More Modules Section
            const Text(
              "ADMIN MANAGEMENT MODULES",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),

            Card(
              child: Column(
                children: [
                  ListTile(
                    dense: true,
                    leading: const Icon(
                      Icons.people_outline,
                      size: 20,
                      color: AppColors.primaryNavy,
                    ),
                    title: const Text(
                      "Users & Access Control",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      "Manage team members, roles & permissions",
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => const UsersManagementPage(),
                        ),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    dense: true,
                    leading: const Icon(
                      Icons.calendar_today_outlined,
                      size: 20,
                      color: AppColors.goldDark,
                    ),
                    title: const Text(
                      "Consultation Appointments",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      "Review pending client bookings & schedule",
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => const AppointmentsPage(),
                        ),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    dense: true,
                    leading: const Icon(
                      Icons.campaign_outlined,
                      size: 20,
                      color: AppColors.info,
                    ),
                    title: const Text(
                      "Broadcast Notifications",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      "Send instant push alerts to mobile users",
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => const BroadcastNotificationsPage(),
                        ),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    dense: true,
                    leading: const Icon(
                      Icons.gavel_outlined,
                      size: 20,
                      color: AppColors.purple,
                    ),
                    title: const Text(
                      "Legal Cases & Judgments",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    subtitle: const Text(
                      "Court hearing tracker & ratio decidendi",
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => const CasesJudgmentsPage(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // System Security & Session Card
            const SizedBox(height: 8),
            AppButton(
              text: "Sign Out",
              icon: Icons.logout,
              variant: AppButtonVariant.danger,
              isFullWidth: true,
              onPressed: onLogout,
            ),
          ],
        ),
      ),
    );
  }
}
