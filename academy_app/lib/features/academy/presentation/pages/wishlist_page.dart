import 'package:flutter/material.dart';
import '../../../../core/services/storage_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/course_model.dart';
import '../../data/repositories/academy_repository.dart';
import '../widgets/compact_course_card.dart';
import 'course_detail_page.dart';

class WishlistPage extends StatefulWidget {
  final AcademyRepository repository;
  final StorageService storageService;

  const WishlistPage({
    super.key,
    required this.repository,
    required this.storageService,
  });

  @override
  State<WishlistPage> createState() => _WishlistPageState();
}

class _WishlistPageState extends State<WishlistPage> {
  List<CourseModel> _wishedCourses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadWishlist();
  }

  Future<void> _loadWishlist() async {
    final ids = await widget.storageService.getWishlist();
    if (ids.isEmpty) {
      if (mounted) setState(() { _wishedCourses = []; _loading = false; });
      return;
    }
    final allCourses = await widget.repository.getCourses();
    final filtered = allCourses.where((c) => ids.contains(c.id)).toList();
    if (mounted) {
      setState(() {
        _wishedCourses = filtered;
        _loading = false;
      });
    }
  }

  Future<void> _removeFromWishlist(String courseId) async {
    await widget.storageService.removeFromWishlist(courseId);
    if (mounted) {
      setState(() {
        _wishedCourses.removeWhere((c) => c.id == courseId);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Course removed from wishlist', style: TextStyle(fontSize: 11)),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: CompactAppBar(
        title: 'Saved Courses',
        subtitle: '${_wishedCourses.length} courses in your list',
      ),
      body: _loading
          ? const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : _wishedCourses.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.bookmark_border_rounded,
                        size: 44,
                        color: AppColors.textMuted.withOpacity(0.5),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'No saved courses yet',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'Tap the bookmark icon on any course to save it here',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(10),
                  itemCount: _wishedCourses.length,
                  itemBuilder: (context, i) {
                    final course = _wishedCourses[i];
                    return Stack(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CourseDetailPage(
                                course: course,
                                repository: widget.repository,
                              ),
                            ),
                          ).then((_) => _loadWishlist()),
                          child: CompactCourseCard(
                            course: course,
                            isWishlisted: true,
                            onWishlistTap: () => _removeFromWishlist(course.id),
                          ),
                        ),
                      ],
                    );
                  },
                ),
    );
  }
}

