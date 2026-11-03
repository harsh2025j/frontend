import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum BadgeVariant { primary, gold, success, warning, danger, info, neutral }

class StatusBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final IconData? icon;
  final double fontSize;

  const StatusBadge({
    super.key,
    required this.label,
    this.variant = BadgeVariant.primary,
    this.icon,
    this.fontSize = 11,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color border;

    switch (variant) {
      case BadgeVariant.primary:
        bg = AppColors.primarySurface.withValues(alpha: 0.12);
        fg = AppColors.primaryNavy;
        border = AppColors.primaryNavy.withValues(alpha: 0.25);
        break;
      case BadgeVariant.gold:
        bg = AppColors.goldSurface;
        fg = AppColors.goldDark;
        border = AppColors.goldLight;
        break;
      case BadgeVariant.success:
        bg = AppColors.successBg;
        fg = AppColors.success;
        border = AppColors.successBorder;
        break;
      case BadgeVariant.warning:
        bg = AppColors.warningBg;
        fg = AppColors.warning;
        border = AppColors.warningBorder;
        break;
      case BadgeVariant.danger:
        bg = AppColors.dangerBg;
        fg = AppColors.danger;
        border = AppColors.dangerBorder;
        break;
      case BadgeVariant.info:
        bg = AppColors.infoBg;
        fg = AppColors.info;
        border = AppColors.infoBorder;
        break;
      case BadgeVariant.neutral:
        bg = AppColors.surfaceMuted;
        fg = AppColors.textSecondary;
        border = AppColors.borderLight;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: border, width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 1, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: fg,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}

