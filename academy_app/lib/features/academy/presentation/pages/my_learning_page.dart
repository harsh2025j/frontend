import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../auth/login_dialog.dart';
import '../../data/models/course_model.dart';
import '../../data/repositories/academy_repository.dart';
import '../widgets/compact_course_card.dart';
import 'account_settings_page.dart';
import 'course_detail_page.dart';
import 'performance_dashboard_page.dart';

class MyLearningPage extends StatefulWidget {
  final AcademyRepository repository;

  const MyLearningPage({super.key, required this.repository});

  @override
  State<MyLearningPage> createState() => _MyLearningPageState();
}

class _MyLearningPageState extends State<MyLearningPage> {
  List<CourseModel> _enrolledCourses = [];
  bool _isLoading = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
    _loadEnrolledCourses();
  }

  Future<void> _checkAuth() async {
    final isAuth = await widget.repository.isAuthenticated();
    if (mounted) setState(() => _isLoggedIn = isAuth);
  }

  Future<void> _loadEnrolledCourses() async {
    final list = await widget.repository.getMyEnrolledCourses();
    if (mounted) {
      setState(() {
        _enrolledCourses = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CompactAppBar(
        title: 'My Learning & Enrollments',
        subtitle: _isLoggedIn
            ? 'Account Connected · Real-Time Sync'
            : 'Personal Legal Practice Tracker',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.analytics_outlined, size: 19, color: AppColors.textWhite),
            tooltip: 'Performance Analytics',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PerformanceDashboardPage(repository: widget.repository),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 19, color: AppColors.textWhite),
            tooltip: 'Account Settings',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => AccountSettingsPage(repository: widget.repository),
                ),
              ).then((_) {
                _checkAuth();
                _loadEnrolledCourses();
              });
            },
          ),
          IconButton(
            icon: Icon(
              _isLoggedIn ? Icons.logout_rounded : Icons.login_rounded,
              size: 19,
              color: _isLoggedIn ? AppColors.goldLight : AppColors.textWhite,
            ),
            tooltip: _isLoggedIn ? 'Sign Out' : 'Sign In',
            onPressed: () async {
              if (_isLoggedIn) {
                await widget.repository.logout();
                _checkAuth();
                _loadEnrolledCourses();
              } else {
                LoginDialog.show(
                  context,
                  repository: widget.repository,
                  onLoginSuccess: () {
                    _checkAuth();
                    _loadEnrolledCourses();
                  },
                );
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Stat Counter Bar (Height 42)
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatPill('Enrolled', '${_enrolledCourses.length}', AppColors.primaryNavy),
                _buildStatPill(
                  'In Progress',
                  '${_enrolledCourses.where((c) => c.progress > 0 && c.progress < 1.0).length}',
                  AppColors.warning,
                ),
                _buildStatPill(
                  'Completed',
                  '${_enrolledCourses.where((c) => c.progress >= 1.0).length}',
                  AppColors.success,
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // Course List
          Expanded(
            child: _isLoading
                ? const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : !_isLoggedIn
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.lock_outline_rounded,
                              size: 36,
                              color: AppColors.primaryNavy,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Sign in to view your enrolled courses',
                              style: TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              height: 32,
                              child: ElevatedButton(
                                onPressed: () {
                                  LoginDialog.show(
                                    context,
                                    repository: widget.repository,
                                    onLoginSuccess: () {
                                      _checkAuth();
                                      _loadEnrolledCourses();
                                    },
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primaryNavy,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                ),
                                child: const Text(
                                  'Sign In',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : _enrolledCourses.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.school_outlined,
                              size: 32,
                              color: AppColors.textMuted,
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'You have not enrolled in any courses yet.',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(10),
                        itemCount: _enrolledCourses.length,
                        itemBuilder: (context, idx) {
                          final course = _enrolledCourses[idx];
                          return CompactCourseCard(
                            course: course,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => CourseDetailPage(
                                    course: course,
                                    repository: widget.repository,
                                  ),
                                ),
                              ).then((_) => _loadEnrolledCourses());
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatPill(String title, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        Text(
          title,
          style: const TextStyle(
            fontSize: 9.5,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}

