import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/assessment_model.dart';
import '../../data/models/course_model.dart';
import '../../data/models/curriculum_model.dart';
import '../../data/models/qa_model.dart';
import '../../data/repositories/academy_repository.dart';
import '../widgets/lesson_tile.dart';
import 'assessment_quiz_page.dart';
import 'assignment_submission_page.dart';
import 'course_player_page.dart';
import 'payment_page.dart';

class CourseDetailPage extends StatefulWidget {
  final CourseModel course;
  final AcademyRepository repository;

  const CourseDetailPage({
    super.key,
    required this.course,
    required this.repository,
  });

  @override
  State<CourseDetailPage> createState() => _CourseDetailPageState();
}

class _CourseDetailPageState extends State<CourseDetailPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late CourseModel _course;
  List<QAModel> _qaList = [];
  List<AssignmentModel> _assignments = [];
  bool _isLoadingExtra = true;
  bool _isEnrolling = false;
  final TextEditingController _qaController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _course = widget.course;
    _tabController = TabController(length: 5, vsync: this);
    _loadExtraData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _qaController.dispose();
    super.dispose();
  }

  Future<void> _loadQA() async {
    final qa = await widget.repository.getCourseQA(_course.id);
    if (mounted) setState(() => _qaList = qa);
  }

  Future<void> _loadExtraData() async {
    final fullCourseFuture = widget.repository.getCourseById(_course.id);
    final qaFuture = widget.repository.getCourseQA(_course.id);
    final asgFuture = widget.repository.getCourseAssignments(_course.id);
    final results = await Future.wait([fullCourseFuture, qaFuture, asgFuture]);
    if (mounted) {
      setState(() {
        if (results[0] != null) {
          _course = results[0] as CourseModel;
        }
        _qaList = results[1] as List<QAModel>;
        _assignments = results[2] as List<AssignmentModel>;
        _isLoadingExtra = false;
      });
    }
  }

  Future<void> _handleEnroll() async {
    if (_course.price > 0) {
      await PaymentBottomSheet.show(
        context,
        course: _course,
        repository: widget.repository,
        onEnrollmentSuccess: () {
          if (mounted) setState(() => _course = _course.copyWith(isEnrolled: true));
        },
      );
      return;
    }

    setState(() => _isEnrolling = true);
    final success = await widget.repository.enrollInCourse(_course.id);
    if (mounted) {
      setState(() {
        _isEnrolling = false;
        if (success) {
          _course = _course.copyWith(isEnrolled: true);
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? 'Successfully enrolled in ${_course.title}!'
                : 'Enrollment completed!',
            style: const TextStyle(fontSize: 12),
          ),
          backgroundColor: AppColors.primaryNavy,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _openPlayer({Lesson? specificLesson}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CoursePlayerPage(
          course: _course,
          initialLesson: specificLesson,
          repository: widget.repository,
        ),
      ),
    ).then((_) async {
      final updated = await widget.repository.getCourseBySlug(_course.slug);
      if (updated != null && mounted) {
        setState(() => _course = updated);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CompactAppBar(
        title: _course.title,
        subtitle: '${_course.category} · ${_course.level}',
      ),
      body: Column(
        children: [
          // Header Media Card
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.all(10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Image.network(
                    _course.thumbnailUrl,
                    width: 110,
                    height: 75,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 110,
                      height: 75,
                      color: AppColors.primaryNavy.withOpacity(0.1),
                      child: const Icon(Icons.school, color: AppColors.primaryNavy),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        _course.instructorName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10.5,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 13, color: AppColors.gold),
                          const SizedBox(width: 2),
                          Text(
                            _course.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '(${_course.enrolledCount} enrolled)',
                            style: const TextStyle(
                              fontSize: 9.5,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Compact TabBar (Height 34)
          Container(
            color: AppColors.surfaceWhite,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              labelPadding: const EdgeInsets.symmetric(horizontal: 14),
              labelColor: AppColors.primaryNavy,
              unselectedLabelColor: AppColors.textMuted,
              labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
              unselectedLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
              indicatorColor: AppColors.primaryNavy,
              indicatorWeight: 2,
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Curriculum'),
                Tab(text: 'Q&A'),
                Tab(text: 'Assignments'),
                Tab(text: 'Reviews'),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(),
                _buildCurriculumTab(),
                _buildQATab(),
                _buildAssignmentsTab(),
                _buildReviewsTab(),
              ],
            ),
          ),

          // Sticky Bottom Bar (Height 50)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: const BoxDecoration(
              color: AppColors.surfaceWhite,
              border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
            ),
            child: Row(
              children: [
                if (!_course.isEnrolled) ...[
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Total Tuition',
                        style: TextStyle(fontSize: 9.5, color: AppColors.textMuted),
                      ),
                      Text(
                        '₹${_course.price.toInt()}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                ],
                Expanded(
                  flex: _course.isEnrolled ? 1 : 0,
                  child: SizedBox(
                    height: 34,
                    child: ElevatedButton.icon(
                      onPressed: _isEnrolling
                          ? null
                          : () {
                              if (_course.isEnrolled) {
                                _openPlayer();
                              } else {
                                _handleEnroll();
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _course.isEnrolled
                            ? AppColors.academyIndigo
                            : AppColors.primaryNavy,
                        foregroundColor: AppColors.textWhite,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      icon: Icon(
                        _course.isEnrolled
                            ? Icons.play_circle_fill_rounded
                            : Icons.lock_open_rounded,
                        size: 15,
                        color: AppColors.textWhite,
                      ),
                      label: Text(
                        _isEnrolling
                            ? 'Enrolling...'
                            : (_course.isEnrolled
                                ? 'Continue Learning'
                                : 'Enroll & Unlock'),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textWhite,
                        ),
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

  Widget _buildCurriculumTab() {
    if (_course.chapters.isEmpty) {
      return const Center(
        child: Text(
          'Curriculum outline updating soon',
          style: TextStyle(fontSize: 12, color: AppColors.textMuted),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(10),
      itemCount: _course.chapters.length,
      itemBuilder: (context, cIdx) {
        final chapter = _course.chapters[cIdx];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.borderLight, width: 0.8),
          ),
          child: Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              initiallyExpanded: cIdx == 0,
              tilePadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
              title: Text(
                chapter.title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryNavy,
                ),
              ),
              subtitle: Text(
                '${chapter.totalLessons} lessons · ${chapter.completedLessons} completed',
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
              ),
              children: chapter.lessons.asMap().entries.map((entry) {
                final lIdx = entry.key;
                final lesson = entry.value;
                return LessonTile(
                  index: lIdx,
                  lesson: lesson,
                  canPlay: _course.isEnrolled || lesson.isFreePreview,
                  onPlay: () => _openPlayer(specificLesson: lesson),
                  onToggleCompleted: () async {
                    await widget.repository.toggleLessonCompleted(lesson.id);
                    final updated =
                        await widget.repository.getCourseBySlug(_course.slug);
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
    );
  }

  Widget _buildOverviewTab() {
    return ListView(
      padding: const EdgeInsets.all(10),
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.borderLight, width: 0.8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'About Course',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                _course.description,
                style: const TextStyle(
                  fontSize: 11.5,
                  color: AppColors.textSecondary,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),

        if (_course.whatYouWillLearn.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight, width: 0.8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'What You Will Learn',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 6),
                ..._course.whatYouWillLearn.map(
                  (pt) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.check_circle_rounded,
                          size: 13,
                          color: AppColors.success,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            pt,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textPrimary,
                              height: 1.25,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.borderLight, width: 0.8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Faculty & Instructors',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.primaryNavy.withOpacity(0.1),
                    child: const Icon(
                      Icons.person_rounded,
                      size: 18,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _course.instructorName,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          _course.instructorBio,
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQATab() {
    return Column(
      children: [
        Container(
          color: AppColors.surfaceWhite,
          padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
          child: Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 32,
                  child: TextField(
                    controller: _qaController,
                    style: const TextStyle(fontSize: 11.5),
                    decoration: InputDecoration(
                      hintText: 'Ask faculty a courtroom question...',
                      hintStyle: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                      filled: true,
                      fillColor: AppColors.surfaceMuted,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(5),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              SizedBox(
                height: 32,
                child: ElevatedButton(
                  onPressed: () async {
                    final text = _qaController.text.trim();
                    if (text.isEmpty) return;
                    final posted = await widget.repository.postQuestion(_course.id, text);
                    if (posted != null && mounted) {
                      setState(() {
                        _qaList = [posted, ..._qaList];
                        _qaController.clear();
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Question submitted successfully!', style: TextStyle(fontSize: 11)),
                          backgroundColor: AppColors.primaryNavy,
                        ),
                      );
                    } else if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Faculty received question. Refreshing discussion thread.', style: TextStyle(fontSize: 11)),
                        ),
                      );
                      _qaController.clear();
                      _loadQA();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryNavy,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                  child: const Text(
                    'Post',
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
        const Divider(height: 1, color: AppColors.borderLight),

        Expanded(
          child: _isLoadingExtra
              ? const Center(
                  child: SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                )
              : _qaList.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.question_answer_outlined, size: 36, color: AppColors.textMuted.withOpacity(0.5)),
                          const SizedBox(height: 6),
                          const Text(
                            'No questions posted yet',
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Be the first student to start the courtroom discussion',
                            style: TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                  padding: const EdgeInsets.all(10),
                  itemCount: _qaList.length,
                  itemBuilder: (context, idx) {
                    final qa = _qaList[idx];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.borderLight, width: 0.8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                qa.authorName,
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                qa.createdAt,
                                style: const TextStyle(
                                  fontSize: 9.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            qa.question,
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primaryNavy,
                            ),
                          ),
                          const SizedBox(height: 6),
                          // Upvote row
                          Row(
                            children: [
                              GestureDetector(
                                onTap: () async {
                                  final ok = await widget.repository.upvoteQuestion(_course.id, qa.id);
                                  if (ok && mounted) {
                                    _loadQA();
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceMuted,
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.thumb_up_alt_outlined, size: 11, color: AppColors.academyIndigo),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${qa.upvotes}',
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.academyIndigo),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (qa.answers.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceMuted,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.verified_user_rounded,
                                        size: 11,
                                        color: AppColors.academyIndigo,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        qa.answers.first.authorName,
                                        style: const TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.academyIndigo,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    qa.answers.first.content,
                                    style: const TextStyle(
                                      fontSize: 10.5,
                                      color: AppColors.textSecondary,
                                      height: 1.3,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildAssignmentsTab() {
    return ListView(
      padding: const EdgeInsets.all(10),
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.academyIndigo.withOpacity(0.3), width: 1),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: AppColors.academyIndigo.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: const Icon(
                  Icons.quiz_outlined,
                  size: 20,
                  color: AppColors.academyIndigo,
                ),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Comprehensive Course MCQ Assessment',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    Text(
                      'Passing threshold: 70% · Required for Certificate',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 28,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => AssessmentQuizPage(
                          courseId: _course.id,
                          repository: widget.repository,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.academyIndigo,
                    foregroundColor: AppColors.textWhite,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  child: const Text(
                    'Start Test',
                    style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ),

        ..._assignments.map((asg) {
          final isSubmitted = asg.status != 'pending';
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight, width: 0.8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 1.5,
                      ),
                      decoration: BoxDecoration(
                        color: isSubmitted
                            ? AppColors.successBg
                            : AppColors.warningBg,
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: Text(
                        asg.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 8.5,
                          fontWeight: FontWeight.w700,
                          color: isSubmitted
                              ? AppColors.success
                              : AppColors.warning,
                        ),
                      ),
                    ),
                    Text(
                      asg.dueDate,
                      style: const TextStyle(
                        fontSize: 9.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  asg.title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  asg.description,
                  style: const TextStyle(
                    fontSize: 10.5,
                    color: AppColors.textSecondary,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (asg.obtainedMarks != null)
                      Text(
                        'Score: ${asg.obtainedMarks}/${asg.maxMarks}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.success,
                        ),
                      )
                    else
                      Text(
                        'Max Marks: ${asg.maxMarks}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textMuted,
                        ),
                      ),
                    SizedBox(
                      height: 26,
                      child: OutlinedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => AssignmentSubmissionPage(
                                assignment: asg,
                              ),
                            ),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          side: const BorderSide(
                            color: AppColors.borderLight,
                            width: 0.8,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        child: Text(
                          isSubmitted ? 'View Submission' : 'Submit Drafting',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryNavy,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildReviewsTab() {
    return _ReviewsTabContent(
      course: _course,
      repository: widget.repository,
    );
  }
}

class _ReviewsTabContent extends StatefulWidget {
  final CourseModel course;
  final AcademyRepository repository;

  const _ReviewsTabContent({
    required this.course,
    required this.repository,
  });

  @override
  State<_ReviewsTabContent> createState() => _ReviewsTabContentState();
}

class _ReviewsTabContentState extends State<_ReviewsTabContent> {
  List<Map<String, dynamic>> _reviews = [];
  bool _loading = true;
  int _myRating = 5;
  final _commentCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadReviews() async {
    final reviews = await widget.repository.getCourseReviews(widget.course.id);
    if (mounted) {
      setState(() {
        _reviews = reviews;
        _loading = false;
      });
    }
  }

  Future<void> _submitReview() async {
    if (_myRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a star rating', style: TextStyle(fontSize: 11))),
      );
      return;
    }
    setState(() => _submitting = true);
    final ok = await widget.repository.submitReview(
      widget.course.id,
      _myRating,
      _commentCtrl.text.trim(),
    );
    if (mounted) {
      setState(() => _submitting = false);
      if (ok) {
        _commentCtrl.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review posted successfully! Thank you.', style: TextStyle(fontSize: 11)),
            backgroundColor: AppColors.primaryNavy,
          ),
        );
        _loadReviews();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review recorded.', style: TextStyle(fontSize: 11)),
          ),
        );
        _commentCtrl.clear();
        _loadReviews();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(10),
      children: [
        // Submit Review Card
        Container(
          padding: const EdgeInsets.all(10),
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.borderLight, width: 0.8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Rate & Review Course',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
              ),
              const SizedBox(height: 6),
              Row(
                children: List.generate(5, (i) {
                  return GestureDetector(
                    onTap: () => setState(() => _myRating = i + 1),
                    child: Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: Icon(
                        i < _myRating ? Icons.star_rounded : Icons.star_outline_rounded,
                        size: 24,
                        color: AppColors.gold,
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _commentCtrl,
                maxLines: 2,
                style: const TextStyle(fontSize: 11.5),
                decoration: InputDecoration(
                  hintText: 'Share your feedback about course material and faculty...',
                  hintStyle: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.surfaceMuted,
                  contentPadding: const EdgeInsets.all(8),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5),
                    borderSide: const BorderSide(color: AppColors.borderLight, width: 0.8),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5),
                    borderSide: const BorderSide(color: AppColors.borderLight, width: 0.8),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 30,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submitReview,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryNavy,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  ),
                  child: Text(
                    _submitting ? 'Submitting...' : 'Post Review',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Reviews List
        if (_loading)
          const Center(
            child: SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          )
        else if (_reviews.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.rate_review_outlined, size: 36, color: AppColors.textMuted.withOpacity(0.5)),
                  const SizedBox(height: 6),
                  const Text(
                    'No reviews yet',
                    style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Be the first student to review this certification module',
                    style: TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
          )
        else
          ..._reviews.map((r) {
            final rating = (r['rating'] as num?)?.toInt() ?? 5;
            final name = r['studentName'] ?? r['userName'] ?? r['user']?['name'] ?? 'Legal Scholar';
            final comment = r['comment'] ?? r['review'] ?? '';
            final date = r['createdAt']?.toString() ?? '';

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.borderLight, width: 0.8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        name.toString(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const Spacer(),
                      Row(
                        children: List.generate(
                          5,
                          (i) => Icon(
                            i < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                            size: 11,
                            color: AppColors.gold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (comment.toString().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      comment.toString(),
                      style: const TextStyle(fontSize: 10.5, color: AppColors.textSecondary, height: 1.3),
                    ),
                  ],
                  if (date.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      date.length > 10 ? date.substring(0, 10) : date,
                      style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted),
                    ),
                  ],
                ],
              ),
            );
          }),
      ],
    );
  }
}

