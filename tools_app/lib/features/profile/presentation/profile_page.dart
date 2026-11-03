import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/storage_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final storage = context.read<StorageService>();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(52),
        child: AppBar(
          backgroundColor: AppColors.primaryNavy,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Profile & Settings',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textWhite),
              ),
              Text(
                'Account & App Preferences',
                style: TextStyle(fontSize: 10.5, color: AppColors.goldLight),
              ),
            ],
          ),
        ),
      ),
      body: FutureBuilder<Map<String, String?>>(
        future: _loadProfile(storage),
        builder: (context, snapshot) {
          final name = snapshot.data?['name'] ?? 'Legal Professional';
          final email = snapshot.data?['email'] ?? '';

          return ListView(
            padding: const EdgeInsets.all(14),
            children: [
              // Avatar Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.primaryNavy,
                        borderRadius: BorderRadius.circular(26),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        name.isNotEmpty ? name[0].toUpperCase() : 'L',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textWhite,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (email.isNotEmpty)
                            Text(
                              email,
                              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // App Info Section
              _SectionHeader(title: 'Application'),
              _InfoRow(icon: Icons.gavel_rounded, label: 'Legal AI Tools', value: 'v1.0.0'),
              _InfoRow(icon: Icons.account_balance_outlined, label: 'Platform', value: 'Sajjad Husain Law Associates'),
              _InfoRow(icon: Icons.security_outlined, label: 'API Base', value: 'api.sajjadhusainlawassociates.com'),

              const SizedBox(height: 16),

              // Tools Available
              _SectionHeader(title: 'Tools Available'),
              _ToolInfoRow(icon: Icons.search_rounded, color: AppColors.toolResearch, label: 'Precedent & Ratio Research'),
              _ToolInfoRow(icon: Icons.edit_document, color: AppColors.toolDrafting, label: 'Court Pleadings Drafter'),
              _ToolInfoRow(icon: Icons.library_books_rounded, color: AppColors.toolDocuments, label: 'Contracts & Deeds Library'),
              _ToolInfoRow(icon: Icons.fact_check_rounded, color: AppColors.toolHealth, label: 'Document Health Check'),
              _ToolInfoRow(icon: Icons.g_translate_rounded, color: AppColors.toolTranslation, label: 'Vernacular Translation'),
              _ToolInfoRow(icon: Icons.handshake_outlined, color: AppColors.toolSettlement, label: 'Mediation & Settlement Desk'),

              const SizedBox(height: 16),

              // Actions
              _SectionHeader(title: 'Actions'),
              _ActionTile(
                icon: Icons.logout_rounded,
                label: 'Sign Out',
                color: AppColors.danger,
                onTap: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Sign Out', style: TextStyle(fontSize: 15)),
                      content: const Text('Are you sure you want to sign out?', style: TextStyle(fontSize: 13)),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text('Sign Out', style: TextStyle(color: AppColors.danger)),
                        ),
                      ],
                    ),
                  );
                  if (confirmed == true) {
                    await storage.clearAll();
                    // App will rebuild and redirect to login if you have auth guard
                  }
                },
              ),

              const SizedBox(height: 20),
              const Center(
                child: Text(
                  'Legal AI Tools • Powered by Sajjad Husain Law Associates',
                  style: TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
            ],
          );
        },
      ),
    );
  }

  Future<Map<String, String?>> _loadProfile(StorageService storage) async {
    final name = await storage.getUserName();
    final email = await storage.getUserEmail();
    return {'name': name, 'email': email};
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          color: AppColors.textMuted,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primaryNavy),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}

class _ToolInfoRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  const _ToolInfoRow({required this.icon, required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 5),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Icon(icon, size: 15, color: color),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.textPrimary)),
          const Spacer(),
          const Icon(Icons.check_circle_outline_rounded, size: 15, color: AppColors.success),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionTile({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 10),
            Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color)),
          ],
        ),
      ),
    );
  }
}

