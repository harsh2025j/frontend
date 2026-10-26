import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final String? customLabel;

  const StatusBadge({
    super.key,
    required this.status,
    this.customLabel,
  });

  @override
  Widget build(BuildContext context) {
    final s = status.toLowerCase().trim();

    Color bg;
    Color fg;
    Color border;

    switch (s) {
      case 'published':
      case 'active':
      case 'approved':
      case 'confirmed':
        bg = AppColors.successBg;
        fg = AppColors.success;
        border = AppColors.successBorder;
        break;
      case 'pending':
      case 'waiting':
      case 'in_progress':
        bg = AppColors.warningBg;
        fg = AppColors.warning;
        border = AppColors.warningBorder;
        break;
      case 'rejected':
      case 'cancelled':
      case 'failed':
      case 'inactive':
        bg = AppColors.dangerBg;
        fg = AppColors.danger;
        border = AppColors.dangerBorder;
        break;
      case 'draft':
      default:
        bg = AppColors.surfaceMuted;
        fg = AppColors.textSecondary;
        border = AppColors.borderLight;
        break;
    }

    final String label = customLabel ?? (status.isEmpty ? 'N/A' : '${status[0].toUpperCase()}${status.substring(1)}');

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: border, width: 0.8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: fg,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
