

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final interFont = GoogleFonts.inter().fontFamily;

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primaryNavy,
      scaffoldBackgroundColor: Colors.white,
      canvasColor: Colors.white,
      fontFamily: interFont,
      visualDensity: VisualDensity.compact,

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

      // App Bar Theme (Compact 52px)
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: AppColors.textWhite,
        elevation: 0,
        centerTitle: false,
        toolbarHeight: 52,
        titleTextStyle: TextStyle(
          fontSize: 14.5,
          fontWeight: FontWeight.w700,
          color: AppColors.textWhite,
          letterSpacing: 0.1,
        ),
        iconTheme: IconThemeData(color: AppColors.textWhite, size: 19),
      ),

      // Card Theme (Compact 0.8px subtle border)
      cardTheme: CardThemeData(
        color: AppColors.surfaceWhite,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: AppColors.borderLight, width: 0.8),
        ),
      ),

      // Tab Bar Theme (Compact)
      tabBarTheme: const TabBarThemeData(
        labelColor: AppColors.primaryNavy,
        unselectedLabelColor: AppColors.textMuted,
        indicatorColor: AppColors.primaryNavy,
        labelStyle: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
        unselectedLabelStyle: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500),
      ),
    );
  }
}

