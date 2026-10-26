import 'package:flutter/material.dart';

/// Centralized Design System Colors for Admin App
/// NEVER hardcode colors in widgets; always reference AppColors or Theme.of(context)
class AppColors {
  AppColors._();

  // Primary Brand Colors (Deep Navy & Rich Gold)
  static const Color primaryDark = Color(0xFF07192F);
  static const Color primaryNavy = Color(0xFF0A2342);
  static const Color primaryLight = Color(0xFF133659);
  static const Color primarySurface = Color(0xFF1E3A5F);

  // Accent & Gold
  static const Color gold = Color(0xFFC5A059);
  static const Color goldLight = Color(0xFFE2C285);
  static const Color goldDark = Color(0xFF9E7C38);
  static const Color goldSurface = Color(0xFFF9F5EC);

  // Background & Surface
  static const Color scaffoldBg = Color(0xFFF8FAFC);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF1F5F9);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color borderSubtle = Color(0xFFCBD5E1);

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textWhite = Color(0xFFFFFFFF);

  // Status & Badge Colors
  static const Color success = Color(0xFF16A34A);
  static const Color successBg = Color(0xFFDCFCE7);
  static const Color successBorder = Color(0xFFBBF7D0);

  static const Color warning = Color(0xFFD97706);
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color warningBorder = Color(0xFFFDE68A);

  static const Color danger = Color(0xFFDC2626);
  static const Color dangerBg = Color(0xFFFEE2E2);
  static const Color dangerBorder = Color(0xFFFECACA);

  static const Color info = Color(0xFF2563EB);
  static const Color infoBg = Color(0xFFDBEAFE);
  static const Color infoBorder = Color(0xFFBFDBFE);

  static const Color purple = Color(0xFF7C3AED);
  static const Color purpleBg = Color(0xFFEDE9FE);
}
