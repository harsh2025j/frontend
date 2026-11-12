import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/course_model.dart';

class CompactCourseCard extends StatelessWidget {
  final CourseModel course;
  final VoidCallback? onTap;
  final bool isWishlisted;
  final VoidCallback? onWishlistTap;

  const CompactCourseCard({
    super.key,
    required this.course,
    this.onTap,
    this.isWishlisted = false,
    this.onWishlistTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.borderLight, width: 0.8),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Compact Thumbnail (Width 96, Height 74)
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Stack(
                children: [
                  Image.network(
                    course.thumbnailUrl,
                    width: 96,
                    height: 74,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 96,
                        height: 74,
                        color: AppColors.primaryNavy.withOpacity(0.08),
                        child: const Icon(
                          Icons.school_rounded,
                          color: AppColors.primaryNavy,
                          size: 24,
                        ),
                      );
                    },
                  ),
                  Positioned(
                    top: 4,
                    left: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 1.5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: Text(
                        course.level,
                        style: const TextStyle(
                          color: AppColors.textWhite,
                          fontSize: 8.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  if (onWishlistTap != null)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: onWishlistTap,
                        child: Container(
                          padding: const EdgeInsets.all(3.5),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceWhite.withOpacity(0.9),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isWishlisted
                                ? Icons.bookmark_rounded
                                : Icons.bookmark_border_rounded,
                            size: 13,
                            color: isWishlisted
                                ? AppColors.gold
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 10),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Rating
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 5,
                          vertical: 1,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.academyIndigo.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Text(
                          course.category.toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.academyIndigo,
                            fontSize: 8.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            size: 13,
                            color: AppColors.gold,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            course.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),

                  // Title (Max 2 lines, Compact 12.5sp)
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Duration & Price/Progress (10sp)
                  Row(
                    children: [
                      const Icon(
                        Icons.access_time_rounded,
                        size: 11,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        course.duration,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const Spacer(),
                      if (course.isEnrolled)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 5,
                            vertical: 1.5,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.successBg,
                            borderRadius: BorderRadius.circular(3),
                            border: Border.all(
                              color: AppColors.successBorder,
                              width: 0.6,
                            ),
                          ),
                          child: Text(
                            '${(course.progress * 100).toInt()}% Done',
                            style: const TextStyle(
                              color: AppColors.success,
                              fontSize: 9.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        )
                      else
                        Text(
                          course.price > 0 ? '₹${course.price.toInt()}' : 'Free',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: course.price > 0
                                ? AppColors.primaryNavy
                                : AppColors.success,
                          ),
                        ),
                    ],
                  ),

                  // Enrolled Linear Progress Bar (if enrolled)
                  if (course.isEnrolled) ...[
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: course.progress.clamp(0.0, 1.0),
                        backgroundColor: AppColors.borderLight,
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          AppColors.academyIndigo,
                        ),
                        minHeight: 2.5,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
