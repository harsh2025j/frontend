import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../shell/main_shell.dart';

class SplashScreen extends StatefulWidget {
  final ApiClient apiClient;

  const SplashScreen({super.key, required this.apiClient});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    );

    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack,
      ),
    );

    _controller.forward();

    // Navigate to MainShell after 2.2 seconds
    Timer(const Duration(milliseconds: 2300), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (_, _, _) => MainShell(apiClient: widget.apiClient),
            transitionDuration: const Duration(milliseconds: 400),
            transitionsBuilder: (_, animation, _, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryDark,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Gradient & Glow
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(0, -0.2),
                radius: 1.1,
                colors: [
                  Color(0xFF133659),
                  Color(0xFF0A2342),
                  Color(0xFF07192F),
                ],
              ),
            ),
          ),

          // Central Logo & Branding
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Emblem Container with Soft Gold Glow
                    Container(
                      width: 110,
                      height: 110,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primaryNavy,
                        border: Border.all(color: AppColors.gold.withValues(alpha: 0.6), width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.gold.withValues(alpha: 0.25),
                            blurRadius: 24,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/data/Sajaadlaw AI Tools Emblem.png',
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) => const Icon(
                            Icons.gavel_rounded,
                            size: 48,
                            color: AppColors.gold,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 22),

                    // App Title
                    const Text(
                      'SAJJADLAW AI TOOLS',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2.2,
                        color: AppColors.textWhite,
                      ),
                    ),

                    const SizedBox(height: 6),

                    // Subtitle / Tagline
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(width: 18, height: 1, color: AppColors.goldLight),
                        const SizedBox(width: 8),
                        const Text(
                          'BENCH-GRADE PRECISION FOR ADVOCATES',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1.4,
                            color: AppColors.goldLight,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(width: 18, height: 1, color: AppColors.goldLight),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Loading & Authority text
          Positioned(
            bottom: 36,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                children: [
                  SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.gold.withValues(alpha: 0.8)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Sajjad Husain Law Associates',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 0.6,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
