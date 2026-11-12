import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../auth/login_dialog.dart';
import '../../data/models/course_model.dart';
import '../../data/repositories/academy_repository.dart';
import '../widgets/compact_course_card.dart';
import 'account_settings_page.dart';
import 'course_detail_page.dart';
import 'notifications_page.dart';
import 'wishlist_page.dart';

class AcademyHomePage extends StatefulWidget {
  final ApiClient apiClient;

  const AcademyHomePage({super.key, required this.apiClient});

  @override
  State<AcademyHomePage> createState() => _AcademyHomePageState();
}

class _AcademyHomePageState extends State<AcademyHomePage> {
  late final AcademyRepository _repository;
  List<CourseModel> _courses = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  List<String> _searchSuggestions = [];
  bool _showSuggestions = false;
  Set<String> _wishlistIds = {};
  bool _isLoggedIn = false;

  final List<String> _categories = [
    'All',
    'Corporate Law',
    'Litigation & Advocacy',
    'Constitutional Law',
    'Contract Drafting',
  ];

  @override
  void initState() {
    super.initState();
    _repository = AcademyRepository(apiClient: widget.apiClient);
    _checkAuth();
    _loadCourses();

    _searchFocusNode.addListener(() {
      if (!_searchFocusNode.hasFocus && mounted) {
        setState(() => _showSuggestions = false);
      }
    });
  }

  Future<void> _checkAuth() async {
    final isAuth = await _repository.isAuthenticated();
    if (mounted) setState(() => _isLoggedIn = isAuth);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadCourses() async {
    _checkAuth();
    setState(() => _isLoading = true);
    final dataFuture = _repository.getCourses(
      category: _selectedCategory,
      query: _searchQuery,
    );
    final wishFuture = widget.apiClient.storageService.getWishlist();
    final results = await Future.wait([dataFuture, wishFuture]);

    if (mounted) {
      setState(() {
        _courses = results[0] as List<CourseModel>;
        _wishlistIds = (results[1] as List<String>).toSet();
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleWishlist(String courseId) async {
    if (_wishlistIds.contains(courseId)) {
      await widget.apiClient.storageService.removeFromWishlist(courseId);
      setState(() => _wishlistIds.remove(courseId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Removed from wishlist', style: TextStyle(fontSize: 11)), duration: Duration(seconds: 1)),
        );
      }
    } else {
      await widget.apiClient.storageService.addToWishlist(courseId);
      setState(() => _wishlistIds.add(courseId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Saved to wishlist!', style: TextStyle(fontSize: 11)), duration: Duration(seconds: 1)),
        );
      }
    }
  }

  void _onCategorySelected(String cat) {
    if (_selectedCategory == cat) return;
    setState(() => _selectedCategory = cat);
    _loadCourses();
  }

  void _onSearchChanged(String val) async {
    setState(() => _searchQuery = val);
    if (val.trim().length >= 2) {
      final suggestions = await _repository.getSearchSuggestions(val.trim());
      if (mounted) {
        setState(() {
          _searchSuggestions = suggestions;
          _showSuggestions = suggestions.isNotEmpty;
        });
      }
    } else {
      if (mounted) {
        setState(() {
          _searchSuggestions = [];
          _showSuggestions = false;
        });
      }
    }
    _loadCourses();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CompactAppBar(
        title: 'Legal Academy & Courses',
        subtitle: 'Bench-Grade Certification for Lawyers & Scholars',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_border_rounded, size: 20),
            tooltip: 'Saved Courses',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => WishlistPage(
                    repository: _repository,
                    storageService: widget.apiClient.storageService,
                  ),
                ),
              ).then((_) => _loadCourses());
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, size: 20),
            tooltip: 'Alerts',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => NotificationsPage(repository: _repository),
                ),
              );
            },
          ),
          IconButton(
            icon: Icon(
              _isLoggedIn ? Icons.account_circle : Icons.account_circle_outlined,
              size: 20,
              color: _isLoggedIn ? AppColors.goldLight : AppColors.textWhite,
            ),
            tooltip: _isLoggedIn ? 'Account Profile' : 'Account Login',
            onPressed: () async {
              final isAuth = await _repository.isAuthenticated();
              if (!mounted) return;
              if (isAuth) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AccountSettingsPage(repository: _repository),
                  ),
                ).then((_) {
                  _checkAuth();
                  _loadCourses();
                });
              } else {
                LoginDialog.show(
                  context,
                  repository: _repository,
                  onLoginSuccess: () {
                    _checkAuth();
                    _loadCourses();
                  },
                );
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Box & Category Filter
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
            child: Column(
              children: [
                SizedBox(
                  height: 34,
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    onChanged: _onSearchChanged,
                    onSubmitted: (_) {
                      setState(() => _showSuggestions = false);
                      _searchFocusNode.unfocus();
                    },
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Search courses by title, topic or statute...',
                      hintStyle: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textMuted,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        size: 16,
                        color: AppColors.textMuted,
                      ),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 14),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {
                                  _showSuggestions = false;
                                });
                                _onSearchChanged('');
                              },
                            )
                          : null,
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 0,
                        horizontal: 8,
                      ),
                      filled: true,
                      fillColor: AppColors.surfaceMuted,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),

                // Search Autocomplete Suggestions Dropdown
                if (_showSuggestions && _searchSuggestions.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.borderLight, width: 0.8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      children: _searchSuggestions.map((s) {
                        return InkWell(
                          onTap: () {
                            _searchController.text = s;
                            setState(() => _showSuggestions = false);
                            _searchFocusNode.unfocus();
                            _onSearchChanged(s);
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            child: Row(
                              children: [
                                const Icon(Icons.search_rounded, size: 13, color: AppColors.textMuted),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    s,
                                    style: const TextStyle(fontSize: 11.5, color: AppColors.textPrimary),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                const SizedBox(height: 7),

                SizedBox(
                  height: 26,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (context, index) => const SizedBox(width: 5),
                    itemBuilder: (context, idx) {
                      final cat = _categories[idx];
                      final isSelected = _selectedCategory == cat;
                      return InkWell(
                        onTap: () => _onCategorySelected(cat),
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primaryNavy
                                : AppColors.surfaceMuted,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primaryNavy
                                  : AppColors.borderLight,
                              width: 0.7,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              cat,
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: isSelected
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                color: isSelected
                                    ? AppColors.textWhite
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Course Listing Body
          Expanded(
            child: _isLoading
                ? const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                  )
                : _courses.isEmpty
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
                              'No courses found matching criteria',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadCourses,
                        color: AppColors.primaryNavy,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(10),
                          itemCount: _courses.length,
                          itemBuilder: (context, idx) {
                            final course = _courses[idx];
                            return CompactCourseCard(
                              course: course,
                              isWishlisted: _wishlistIds.contains(course.id),
                              onWishlistTap: () => _toggleWishlist(course.id),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => CourseDetailPage(
                                      course: course,
                                      repository: _repository,
                                    ),
                                  ),
                                ).then((_) => _loadCourses());
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
