import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final baseText = GoogleFonts.interTextTheme();

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primaryNavy,
      scaffoldBackgroundColor: AppColors.scaffoldBg,
      
      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryNavy,
        onPrimary: AppColors.textWhite,
        secondary: AppColors.gold,
        onSecondary: AppColors.primaryDark,
        surface: AppColors.surfaceWhite,
        onSurface: AppColors.textPrimary,
        error: AppColors.danger,
        onError: AppColors.textWhite,
      ),

      // App Bar Theme (Compact & Professional)
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: AppColors.textWhite,
        elevation: 0,
        centerTitle: false,
        toolbarHeight: 52,
        titleTextStyle: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textWhite,
          letterSpacing: 0.2,
        ),
        iconTheme: IconThemeData(color: AppColors.textWhite, size: 20),
      ),

      // Card Theme (Compact, Subtle Border)
      cardTheme: CardThemeData(
        color: AppColors.surfaceWhite,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: AppColors.borderLight, width: 1),
        ),
      ),

      // Input Decoration Theme (High-Density & Clean)
      inputDecorationTheme: InputDecorationTheme(
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        filled: true,
        fillColor: AppColors.surfaceWhite,
        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
        labelStyle: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.primaryNavy, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
      ),

      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
        space: 1,
      ),

      // Text Theme with Controlled Compact Sizing
      textTheme: baseText.copyWith(
        headlineMedium: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        headlineSmall: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        titleLarge: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        titleMedium: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        titleSmall: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        bodyLarge: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
        bodyMedium: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        bodySmall: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        labelLarge: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textWhite),
      ),
    );
  }
}
