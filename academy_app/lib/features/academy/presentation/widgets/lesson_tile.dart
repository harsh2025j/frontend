import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/curriculum_model.dart';

class LessonTile extends StatelessWidget {
  final int index;
  final Lesson lesson;
  final bool isCurrent;
  final bool canPlay;
  final VoidCallback onPlay;
  final VoidCallback onToggleCompleted;

  const LessonTile({
    super.key,
    required this.index,
    required this.lesson,
    this.isCurrent = false,
    this.canPlay = true,
    required this.onPlay,
    required this.onToggleCompleted,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isCurrent
            ? AppColors.academyIndigo.withOpacity(0.06)
            : AppColors.surfaceWhite,
        border: Border(
          bottom: BorderSide(
            color: AppColors.borderLight.withOpacity(0.6),
            width: 0.6,
          ),
        ),
      ),
      child: ListTile(
        dense: true,
        visualDensity: const VisualDensity(horizontal: -3, vertical: -3),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
        onTap: canPlay ? onPlay : null,
        leading: GestureDetector(
          onTap: onToggleCompleted,
          child: Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: lesson.isCompleted
                  ? AppColors.success
                  : (isCurrent
                      ? AppColors.academyIndigo
                      : Colors.transparent),
              border: Border.all(
                color: lesson.isCompleted
                    ? AppColors.success
                    : (isCurrent
                        ? AppColors.academyIndigo
                        : AppColors.borderSubtle),
                width: 1.2,
              ),
            ),
            child: Icon(
              lesson.isCompleted
                  ? Icons.check_rounded
                  : (isCurrent
                      ? Icons.play_arrow_rounded
                      : Icons.play_arrow_outlined),
              size: 13,
              color: (lesson.isCompleted || isCurrent)
                  ? AppColors.textWhite
                  : AppColors.textMuted,
            ),
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                '${index + 1}. ${lesson.title}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight:
                      isCurrent ? FontWeight.w700 : FontWeight.w500,
                  color: isCurrent
                      ? AppColors.academyIndigo
                      : (canPlay
                          ? AppColors.textPrimary
                          : AppColors.textMuted),
                ),
              ),
            ),
            if (lesson.isFreePreview)
              Container(
                margin: const EdgeInsets.only(left: 6),
                padding: const EdgeInsets.symmetric(
                  horizontal: 4,
                  vertical: 1,
                ),
                decoration: BoxDecoration(
                  color: AppColors.academyIndigo.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(3),
                ),
                child: const Text(
                  'PREVIEW',
                  style: TextStyle(
                    color: AppColors.academyIndigo,
                    fontSize: 8.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            if (!canPlay && !lesson.isFreePreview)
              const Padding(
                padding: EdgeInsets.only(left: 6),
                child: Icon(
                  Icons.lock_outline_rounded,
                  size: 13,
                  color: AppColors.textMuted,
                ),
              ),
          ],
        ),
        subtitle: Row(
          children: [
            const Icon(
              Icons.schedule_rounded,
              size: 10,
              color: AppColors.textMuted,
            ),
            const SizedBox(width: 3),
            Text(
              lesson.duration,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
            if (lesson.resources.isNotEmpty) ...[
              const SizedBox(width: 8),
              const Icon(
                Icons.attach_file_rounded,
                size: 10,
                color: AppColors.textMuted,
              ),
              const SizedBox(width: 2),
              Text(
                '${lesson.resources.length} Notes',
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ],
        ),
        trailing: const Icon(
          Icons.chevron_right_rounded,
          size: 15,
          color: AppColors.borderSubtle,
        ),
      ),
    );
  }
}

