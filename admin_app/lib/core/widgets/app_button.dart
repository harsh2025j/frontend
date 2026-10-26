import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum AppButtonVariant { primary, secondary, outline, danger, ghost }
enum AppButtonSize { small, medium, large }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final IconData? icon;
  final bool isLoading;
  final bool isFullWidth;

  const AppButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    // Sizing
    final double height = switch (size) {
      AppButtonSize.small => 32,
      AppButtonSize.medium => 38,
      AppButtonSize.large => 44,
    };

    final double fontSize = switch (size) {
      AppButtonSize.small => 12,
      AppButtonSize.medium => 13,
      AppButtonSize.large => 14,
    };

    final EdgeInsets padding = switch (size) {
      AppButtonSize.small => const EdgeInsets.symmetric(horizontal: 10),
      AppButtonSize.medium => const EdgeInsets.symmetric(horizontal: 14),
      AppButtonSize.large => const EdgeInsets.symmetric(horizontal: 18),
    };

    // Styling based on variant
    Color bgColor;
    Color fgColor;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case AppButtonVariant.primary:
        bgColor = AppColors.primaryNavy;
        fgColor = AppColors.textWhite;
        break;
      case AppButtonVariant.secondary:
        bgColor = AppColors.gold;
        fgColor = AppColors.primaryDark;
        break;
      case AppButtonVariant.outline:
        bgColor = Colors.transparent;
        fgColor = AppColors.primaryNavy;
        borderSide = const BorderSide(color: AppColors.borderLight, width: 1);
        break;
      case AppButtonVariant.danger:
        bgColor = AppColors.danger;
        fgColor = AppColors.textWhite;
        break;
      case AppButtonVariant.ghost:
        bgColor = Colors.transparent;
        fgColor = AppColors.textSecondary;
        break;
    }

    final bool isDisabled = onPressed == null || isLoading;

    Widget buttonContent = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: fontSize + 2,
            height: fontSize + 2,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(fgColor),
            ),
          ),
          const SizedBox(width: 8),
        ] else if (icon != null) ...[
          Icon(icon, size: fontSize + 2, color: fgColor),
          const SizedBox(width: 6),
        ],
        Text(
          text,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            color: fgColor,
            letterSpacing: 0.1,
          ),
        ),
      ],
    );

    return SizedBox(
      height: height,
      width: isFullWidth ? double.infinity : null,
      child: Material(
        color: isDisabled ? AppColors.surfaceMuted : bgColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(6),
          side: borderSide,
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: isDisabled ? null : onPressed,
          child: Padding(
            padding: padding,
            child: buttonContent,
          ),
        ),
      ),
    );
  }
}
