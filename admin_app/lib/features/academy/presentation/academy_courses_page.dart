import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../../core/network/api_client.dart';
import 'create_course_page.dart';
import 'curriculum_builder_page.dart';

class AcademyCoursesPage extends StatefulWidget {
  const AcademyCoursesPage({super.key});

  @override
  State<AcademyCoursesPage> createState() => _AcademyCoursesPageState();
}

class _AcademyCoursesPageState extends State<AcademyCoursesPage> {
  bool _isLoading = true;
  List<dynamic> _courses = [];
  String _errorMessage = "";

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() {
      _isLoading = true;
      _errorMessage = "";
    });

    try {
      final apiClient = context.read<ApiClient>();
      final res = await apiClient.dio.get('/academy/courses');
      final resData = res.data;

      List<dynamic> list = [];
      if (resData is Map && resData['data'] is List) {
        list = resData['data'];
      } else if (resData is Map && resData['data'] is Map && resData['data']['courses'] is List) {
        list = resData['data']['courses'];
      } else if (resData is List) {
        list = resData;
      }

      if (mounted) {
        setState(() {
          _courses = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: Column(
        children: [
          // Academy Stats & Add Course Strip
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        "Academy & LMS Courses",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                      Text(
                        "Curriculum management & training programs",
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                AppButton(
                  text: "New Course",
                  icon: Icons.add,
                  size: AppButtonSize.small,
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (ctx) => const CreateCoursePage()),
                    ).then((_) => _fetchCourses());
                  },
                ),
              ],
            ),
          ),
          const Divider(),

          // Courses List
          Expanded(
            child: _isLoading
                ? const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.school_outlined, size: 36, color: AppColors.textMuted),
                              const SizedBox(height: 8),
                              Text("Error loading courses: $_errorMessage", textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 12),
                              AppButton(text: "Retry", size: AppButtonSize.small, onPressed: _fetchCourses),
                            ],
                          ),
                        ),
                      )
                    : _courses.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.school_outlined, size: 40, color: AppColors.textMuted),
                                  const SizedBox(height: 8),
                                  const Text("No courses yet", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                  const SizedBox(height: 12),
                                  AppButton(
                                    text: "Create First Course",
                                    icon: Icons.add,
                                    size: AppButtonSize.small,
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (ctx) => const CreateCoursePage()),
                                      ).then((_) => _fetchCourses());
                                    },
                                  ),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            itemCount: _courses.length,
                            separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                            itemBuilder: (ctx, i) {
                              final course = _courses[i];
                              final title = course['title'] ?? course['name'] ?? "Untitled Course";
                              final status = course['status'] ?? "draft";
                              final level = course['level'] ?? "All Levels";
                              final price = course['price'] != null ? "₹${course['price']}" : "Free";
                              final modulesCount = (course['modules'] is List) ? (course['modules'] as List).length : (course['modulesCount'] ?? 0);

                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                       Row(
                                        children: [
                                          StatusBadge(status: status),
                                          const SizedBox(width: 8),
                                          Flexible(
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppColors.surfaceMuted,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                level,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Flexible(
                                            child: Text(
                                              price,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              textAlign: TextAlign.end,
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        title,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          const Icon(Icons.folder_outlined, size: 14, color: AppColors.textMuted),
                                          const SizedBox(width: 4),
                                          Text("$modulesCount Modules", style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      const Divider(),
                                      const SizedBox(height: 6),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          AppButton(
                                            text: "Curriculum Builder",
                                            icon: Icons.account_tree_outlined,
                                            size: AppButtonSize.small,
                                            variant: AppButtonVariant.secondary,
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (ctx) => CurriculumBuilderPage(
                                                    courseTitle: title,
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
