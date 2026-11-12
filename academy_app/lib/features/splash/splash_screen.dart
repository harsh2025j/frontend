import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../shell/main_shell.dart';

class SplashScreen extends StatefulWidget {
  final ApiClient apiClient;

  const SplashScreen({super.key, required this.apiClient});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToHome();
  }

  Future<void> _navigateToHome() async {
    await Future.delayed(const Duration(milliseconds: 1400));
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => MainShell(apiClient: widget.apiClient),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primaryNavy,
                border: Border.all(color: AppColors.gold, width: 1.5),
              ),
              child: const Icon(
                Icons.school_rounded,
                size: 38,
                color: AppColors.gold,
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'LEGAL ACADEMY',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textWhite,
                letterSpacing: 2.0,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Sajjad Husain Law Associates',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.goldLight.withOpacity(0.9),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 24),
            const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.gold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

