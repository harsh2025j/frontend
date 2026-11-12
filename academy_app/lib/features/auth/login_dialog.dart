import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../academy/data/repositories/academy_repository.dart';

class LoginDialog extends StatefulWidget {
  final AcademyRepository repository;
  final VoidCallback onLoginSuccess;

  const LoginDialog({
    super.key,
    required this.repository,
    required this.onLoginSuccess,
  });

  static Future<void> show(
    BuildContext context, {
    required AcademyRepository repository,
    required VoidCallback onLoginSuccess,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => LoginDialog(
        repository: repository,
        onLoginSuccess: onLoginSuccess,
      ),
    );
  }

  @override
  State<LoginDialog> createState() => _LoginDialogState();
}

class _LoginDialogState extends State<LoginDialog> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter email and password');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success = await widget.repository.login(email, password);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        Navigator.pop(context);
        widget.onLoginSuccess();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Login successful! Synced enrolled courses.',
              style: TextStyle(fontSize: 12),
            ),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        setState(() {
          _errorMessage = 'Invalid credentials or connection error. Try again.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: const EdgeInsets.all(16),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryNavy.withOpacity(0.08),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.lock_outline_rounded,
                    size: 18,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(width: 8),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Account Login',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    Text(
                      'Sign in to access your enrolled courses',
                      style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(fontSize: 10.5, color: AppColors.danger),
                ),
              ),
              const SizedBox(height: 10),
            ],

            const Text(
              'Email Address',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            SizedBox(
              height: 36,
              child: TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'advocate@example.com',
                  hintStyle: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.surfaceMuted,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            const Text(
              'Password',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            SizedBox(
              height: 36,
              child: TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: '••••••••',
                  hintStyle: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.surfaceMuted,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (_) => _handleLogin(),
              ),
            ),
            const SizedBox(height: 14),

            SizedBox(
              width: double.infinity,
              height: 34,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryNavy,
                  foregroundColor: AppColors.textWhite,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.textWhite,
                        ),
                      )
                    : const Text(
                        'Sign In',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

