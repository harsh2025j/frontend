import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class CompactAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final bool showBackButton;

  const CompactAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.showBackButton = true,
  });

  @override
  Size get preferredSize => const Size.fromHeight(52);

  @override
  Widget build(BuildContext context) {
    final bool canPop = Navigator.canPop(context);
    final bool hasLeading = showBackButton && canPop;

    return AppBar(
      automaticallyImplyLeading: false,
      toolbarHeight: 52,
      backgroundColor: AppColors.primaryDark,
      foregroundColor: AppColors.textWhite,
      elevation: 0,
      titleSpacing: hasLeading ? 4 : 16,
      leading: hasLeading
          ? IconButton(
              icon: const Icon(Icons.arrow_back_rounded, size: 19),
              onPressed: () => Navigator.maybePop(context),
            )
          : null,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textWhite,
            ),
          ),
          if (subtitle != null)
            Text(
              subtitle!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w400,
                color: AppColors.goldLight,
              ),
            ),
        ],
      ),
      actions: actions,
    );
  }
}

