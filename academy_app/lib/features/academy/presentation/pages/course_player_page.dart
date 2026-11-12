import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/course_model.dart';
import '../../data/models/curriculum_model.dart';
import '../../data/repositories/academy_repository.dart';
import '../widgets/compact_video_player.dart';
import '../widgets/lesson_tile.dart';

class CoursePlayerPage extends StatefulWidget {
  final CourseModel course;
  final Lesson? initialLesson;
  final AcademyRepository repository;

  const CoursePlayerPage({
    super.key,
    required this.course,
    this.initialLesson,
    required this.repository,
  });

  @override
  State<CoursePlayerPage> createState() => _CoursePlayerPageState();
}

class _CoursePlayerPageState extends State<CoursePlayerPage> {
  late CourseModel _course;
  late Lesson _currentLesson;
  bool _isMarking = false;

  @override
  void initState() {
    super.initState();
    _course = widget.course;
    if (widget.initialLesson != null) {
      _currentLesson = widget.initialLesson!;
    } else {
      _currentLesson = _findFirstPlayableLesson();
    }
  }

  Lesson _findFirstPlayableLesson() {
    for (final chap in _course.chapters) {
      for (final les in chap.lessons) {
        if (!les.isCompleted) return les;
      }
    }
    if (_course.chapters.isNotEmpty && _course.chapters.first.lessons.isNotEmpty) {
      return _course.chapters.first.lessons.first;
    }
    return const Lesson(
      id: '',
      title: 'No lessons uploaded',
      duration: '',
      videoUrl: '',
    );
  }

  void _selectLesson(Lesson lesson) {
    setState(() => _currentLesson = lesson);
  }

  Future<void> _toggleLessonCompletion() async {
    setState(() => _isMarking = true);
    final targetState = !_currentLesson.isCompleted;
    await widget.repository.toggleLessonCompleted(_currentLesson.id);
    // Sync completion status with backend API
    await widget.repository.syncLessonProgress(
      _course.id,
      _currentLesson.id,
      targetState,
    );
    final updated = await widget.repository.getCourseBySlug(_course.slug);
    if (updated != null && mounted) {
      setState(() {
        _course = updated;
        for (final c in _course.chapters) {
          for (final l in c.lessons) {
            if (l.id == _currentLesson.id) {
              _currentLesson = l;
              break;
            }
          }
        }
        _isMarking = false;
      });
    } else if (mounted) {
      setState(() => _isMarking = false);
    }
  }

  void _goToNextLesson() {
    bool foundCurrent = false;
    for (final chap in _course.chapters) {
      for (final les in chap.lessons) {
        if (foundCurrent) {
          _selectLesson(les);
          return;
        }
        if (les.id == _currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'You have reached the final lesson of this module!',
          style: TextStyle(fontSize: 11),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_course.chapters.isEmpty || _currentLesson.id.isEmpty) {
      return Scaffold(
        appBar: CompactAppBar(
          title: _course.title,
          subtitle: 'Course Player',
        ),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.video_library_outlined,
                  size: 36, color: AppColors.textMuted),
              const SizedBox(height: 8),
              const Text(
                'No curriculum lessons uploaded for this course yet.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryNavy,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Back to Course Overview',
                    style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: CompactAppBar(
        title: _currentLesson.title,
        subtitle: _course.title,
      ),
      body: Column(
        children: [
          // 16:9 Compact Video Player
          CompactVideoPlayer(
            title: _currentLesson.title,
            videoUrl: _currentLesson.videoUrl,
            onNextLesson: _goToNextLesson,
          ),

          // Lesson Details & Complete Action
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _currentLesson.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        '${_currentLesson.duration} · High Court Practice Module',
                        style: const TextStyle(
                          fontSize: 9.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 28,
                  child: OutlinedButton.icon(
                    onPressed: _isMarking ? null : _toggleLessonCompletion,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      side: BorderSide(
                        color: _currentLesson.isCompleted
                            ? AppColors.success
                            : AppColors.borderLight,
                        width: 0.8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    icon: Icon(
                      _currentLesson.isCompleted
                          ? Icons.check_circle_rounded
                          : Icons.radio_button_unchecked_rounded,
                      size: 13,
                      color: _currentLesson.isCompleted
                          ? AppColors.success
                          : AppColors.textMuted,
                    ),
                    label: Text(
                      _currentLesson.isCompleted ? 'Completed' : 'Mark Done',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: _currentLesson.isCompleted
                            ? AppColors.success
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Course Progress Strip
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            child: Row(
              children: [
                Text(
                  'Course Progress: ${(_course.progress * 100).toInt()}%',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.academyIndigo,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: _course.progress.clamp(0.0, 1.0),
                      backgroundColor: AppColors.borderLight,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.academyIndigo,
                      ),
                      minHeight: 3,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${_course.completedLessons}/${_course.totalLessons} Lessons',
                  style: const TextStyle(
                    fontSize: 9.5,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Chapters & Lessons Accordion List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _course.chapters.length,
              itemBuilder: (context, cIdx) {
                final chapter = _course.chapters[cIdx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: AppColors.borderLight,
                      width: 0.8,
                    ),
                  ),
                  child: Theme(
                    data: Theme.of(context)
                        .copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      initiallyExpanded: true,
                      tilePadding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 0,
                      ),
                      visualDensity: const VisualDensity(
                        horizontal: -2,
                        vertical: -3,
                      ),
                      title: Text(
                        chapter.title,
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      subtitle: Text(
                        '${chapter.totalLessons} lessons',
                        style: const TextStyle(
                          fontSize: 9.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                      children: chapter.lessons.asMap().entries.map((entry) {
                        final lIdx = entry.key;
                        final lesson = entry.value;
                        final isCurrent = lesson.id == _currentLesson.id;
                        return LessonTile(
                          index: lIdx,
                          lesson: lesson,
                          isCurrent: isCurrent,
                          canPlay: true,
                          onPlay: () => _selectLesson(lesson),
                          onToggleCompleted: () async {
                            await widget.repository
                                .toggleLessonCompleted(lesson.id);
                            final updated = await widget.repository
                                .getCourseBySlug(_course.slug);
                            if (updated != null && mounted) {
                              setState(() => _course = updated);
                            }
                          },
                        );
                      }).toList(),
                    ),
                  ),
                );
              },
            ),
          ),

          // Bottom Bar for Next Lesson
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: const BoxDecoration(
              color: AppColors.surfaceWhite,
              border: Border(
                top: BorderSide(color: AppColors.borderLight, width: 1),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton.icon(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                  ),
                  icon: const Icon(
                    Icons.arrow_back_rounded,
                    size: 13,
                    color: AppColors.textSecondary,
                  ),
                  label: const Text(
                    'Back to Overview',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                SizedBox(
                  height: 30,
                  child: ElevatedButton.icon(
                    onPressed: _goToNextLesson,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.academyIndigo,
                      foregroundColor: AppColors.textWhite,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    icon: const Icon(
                      Icons.skip_next_rounded,
                      size: 14,
                      color: AppColors.textWhite,
                    ),
                    label: const Text(
                      'Next Lesson',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

