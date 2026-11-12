import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/repositories/academy_repository.dart';

class AccountSettingsPage extends StatefulWidget {
  final AcademyRepository repository;
  const AccountSettingsPage({super.key, required this.repository});

  @override
  State<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends State<AccountSettingsPage> {
  Map<String, dynamic>? _profile;
  bool _loading = true;
  bool _saving = false;
  late TextEditingController _nameCtrl;
  late TextEditingController _phoneCtrl;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController();
    _phoneCtrl = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final profile = await widget.repository.getUserProfile();
    final savedEmail = await widget.repository.apiClient.storageService.getString('user_email');
    final savedName = await widget.repository.apiClient.storageService.getString('user_name');
    if (mounted) {
      setState(() {
        _profile = profile ?? (savedEmail != null ? {'email': savedEmail, 'name': savedName ?? ''} : null);
        _loading = false;
        if (_profile != null) {
          _nameCtrl.text = _profile!['name'] ?? _profile!['firstName'] ?? savedName ?? '';
          _phoneCtrl.text = _profile!['phone'] ?? _profile!['phoneNumber'] ?? '';
        }
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _saving = true);
    final ok = await widget.repository.updateProfile(
      name: _nameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
    );
    if (mounted) {
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            ok ? 'Profile updated successfully!' : 'Failed to update profile.',
            style: const TextStyle(fontSize: 11),
          ),
          backgroundColor: ok ? AppColors.success : AppColors.danger,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: const CompactAppBar(
        title: 'Account Settings',
        subtitle: 'Student Profile & Preferences',
      ),
      body: _loading
          ? const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(14),
              children: [
                Center(
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.primaryNavy.withOpacity(0.08),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primaryNavy.withOpacity(0.2), width: 1.5),
                    ),
                    child: const Icon(Icons.person_rounded, size: 32, color: AppColors.primaryNavy),
                  ),
                ),
                const SizedBox(height: 6),
                if (_profile != null)
                  Center(
                    child: Text(
                      _profile!['email']?.toString() ?? '',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ),
                const SizedBox(height: 18),

                _buildLabel('Full Name'),
                const SizedBox(height: 4),
                _buildTextField(_nameCtrl, 'Enter your name', Icons.person_outline_rounded),
                const SizedBox(height: 12),

                _buildLabel('Phone Number'),
                const SizedBox(height: 4),
                _buildTextField(_phoneCtrl, 'Enter phone number', Icons.phone_outlined, keyboardType: TextInputType.phone),
                const SizedBox(height: 18),

                SizedBox(
                  height: 36,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _saveProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryNavy,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    child: Text(
                      _saving ? 'Saving...' : 'Save Changes',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.borderLight, width: 0.8),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: const Icon(Icons.lock_outline_rounded, size: 18, color: AppColors.textSecondary),
                        title: const Text('Change Password', style: TextStyle(fontSize: 12, color: AppColors.textPrimary)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.textMuted),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Password reset instructions sent to registered email', style: TextStyle(fontSize: 11)),
                            ),
                          );
                        },
                      ),
                      const Divider(height: 1, color: AppColors.borderLight),
                      ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: const Icon(Icons.logout_rounded, size: 18, color: AppColors.danger),
                        title: const Text(
                          'Sign Out',
                          style: TextStyle(fontSize: 12, color: AppColors.danger, fontWeight: FontWeight.w600),
                        ),
                        onTap: () async {
                          await widget.repository.logout();
                          if (context.mounted) {
                            Navigator.of(context).popUntil((route) => route.isFirst);
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
    );
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String hint,
    IconData icon, {
    TextInputType? keyboardType,
  }) {
    return SizedBox(
      height: 38,
      child: TextField(
        controller: ctrl,
        keyboardType: keyboardType,
        style: const TextStyle(fontSize: 12),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          prefixIcon: Icon(icon, size: 16, color: AppColors.textMuted),
          filled: true,
          fillColor: AppColors.surfaceMuted,
          contentPadding: const EdgeInsets.symmetric(horizontal: 10),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderLight, width: 0.8),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderLight, width: 0.8),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.primaryNavy, width: 1),
          ),
        ),
      ),
    );
  }
}

