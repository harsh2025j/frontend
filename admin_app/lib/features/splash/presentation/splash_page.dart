import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/presentation/bloc/auth_bloc.dart';
import '../../auth/presentation/login_page.dart';
import '../../dashboard/main_navigation_shell.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  bool _timerDone = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );

    _scaleAnimation = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    _animController.forward();

    // Give 2 seconds of smooth branded presentation
    Timer(const Duration(milliseconds: 2000), () {
      if (mounted) {
        setState(() => _timerDone = true);
        _navigateIfReady();
      }
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _navigateIfReady() {
    if (!_timerDone) return;

    final authState = context.read<AuthBloc>().state;
    if (authState is Authenticated) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => MainNavigationShell(
            adminName: authState.name,
            adminRole: authState.role,
          ),
          transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    } else if (authState is Unauthenticated || authState is AuthFailure) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const LoginPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (_timerDone) {
          _navigateIfReady();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.primaryDark,
        body: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              center: Alignment(0, -0.2),
              radius: 1.1,
              colors: [
                Color(0xFF133659),
                AppColors.primaryNavy,
                AppColors.primaryDark,
              ],
              stops: [0.0, 0.45, 1.0],
            ),
          ),
          child: SafeArea(
            child: Column(
              children: [
                const Spacer(flex: 2),

                // Center Branded Emblem & Typography
                ScaleTransition(
                  scale: _scaleAnimation,
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Judicial Gold Emblem with Subtle Outer Ring
                        Container(
                          width: 82,
                          height: 82,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFE2C285), AppColors.gold, Color(0xFF8C6924)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.gold.withValues(alpha: 0.25),
                                blurRadius: 24,
                                spreadRadius: 4,
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(2.5),
                            child: Container(
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.primaryDark,
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.balance,
                                  size: 42,
                                  color: AppColors.goldLight,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 22),

                        // Legal Brand Name
                        const Text(
                          "SAJJAD HUSAIN",
                          style: TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2.2,
                            color: AppColors.textWhite,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "LAW ASSOCIATES",
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 3.5,
                            color: AppColors.goldLight,
                          ),
                        ),
                        const SizedBox(height: 18),

                        // Admin Badge Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primarySurface.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.gold.withValues(alpha: 0.4), width: 1),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.shield_outlined, size: 12, color: AppColors.gold),
                              SizedBox(width: 5),
                              Text(
                                "ADMINISTRATION PORTAL",
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.0,
                                  color: AppColors.goldLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const Spacer(flex: 2),

                // Bottom Minimal Loader & Security Info
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Column(
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.gold.withValues(alpha: 0.8)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        "Secure Judicial Infrastructure • v1.0",
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.5,
                          color: AppColors.textMuted.withValues(alpha: 0.7),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
