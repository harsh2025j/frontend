import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/network/api_client.dart';
import '../../content/presentation/create_article_page.dart';
import '../../broadcast/presentation/broadcast_notifications_page.dart';
import '../../academy/presentation/create_course_page.dart';
import '../../content/presentation/content_management_page.dart';
import '../../users/presentation/users_management_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _isLoading = true;
  String _totalArticles = "0";
  String _publishedArticles = "0";
  String _pendingArticles = "0";
  String _totalUsers = "0";

  List<dynamic> _pendingList = [];

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() => _isLoading = true);
    final apiClient = context.read<ApiClient>();

    try {
      // 1. Fetch live dashboard stats
      final statsRes = await apiClient.dio.get('/users/dashboard-stats');
      final data = statsRes.data['data'] ?? statsRes.data;

      if (data != null && mounted) {
        setState(() {
          _totalArticles = data['totalArticles']?['value']?.toString() ?? "0";
          _publishedArticles = data['publishedArticles']?['value']?.toString() ?? "0";
          _pendingArticles = data['pendingArticles']?['value']?.toString() ?? "0";
          _totalUsers = data['totalUsers']?['value']?.toString() ?? "0";
        });
      }
    } catch (_) {
      // Keep defaults
    }

    try {
      // 2. Fetch live pending articles
      final articlesRes = await apiClient.dio.get('/articles', queryParameters: {
        'type': 'my-content',
        'status': 'pending',
        'limit': 5,
      });
      final resData = articlesRes.data;
      List<dynamic> list = [];
      if (resData is Map && resData['data'] is List) {
        list = resData['data'];
      } else if (resData is List) {
        list = resData;
      }

      if (mounted) {
        final pendingOnly = list.where((item) => (item['status'] ?? '').toString().toLowerCase() == 'pending').toList();
        setState(() {
          _pendingList = pendingOnly;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _approveArticle(String id) async {
    final apiClient = context.read<ApiClient>();
    try {
      await apiClient.dio.patch('/articles/$id/approve');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Article Approved Successfully")),
        );
        _fetchDashboardData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to approve article: $e")),
        );
      }
    }
  }

  void _showArticlePreview(dynamic item) {
    final title = item['title'] ?? item['headline'] ?? "Untitled Article";
    final sub = item['subHeadline'] ?? item['subtitle'] ?? "";
    final author = item['author']?['name'] ?? item['authorName'] ?? "Editorial Desk";
    final category = item['category']?['name'] ?? item['categoryName'] ?? "General Law";
    final id = item['_id'] ?? item['id'] ?? "";

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.goldSurface,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      category,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Text("Status: Pending", style: TextStyle(fontSize: 11, color: AppColors.warning, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            if (sub.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                sub,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
            const SizedBox(height: 8),
            Text(
              "Author: $author",
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: "Close",
                    variant: AppButtonVariant.outline,
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ),
                const SizedBox(width: 10),
                if (id.isNotEmpty)
                  Expanded(
                    child: AppButton(
                      text: "Approve Article",
                      icon: Icons.check,
                      onPressed: () {
                        Navigator.pop(ctx);
                        _approveArticle(id);
                      },
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: RefreshIndicator(
        onRefresh: _fetchDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Welcome Banner (Compact)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryDark, AppColors.primaryNavy],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            "Operations Overview",
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textWhite,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            "Live metrics & pending approvals",
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.goldLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primarySurface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.fiber_manual_record, size: 8, color: AppColors.success),
                          SizedBox(width: 4),
                          Text("Live", style: TextStyle(fontSize: 11, color: AppColors.textWhite)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Live Metric Grid (2x2 Interactive Cards)
              Row(
                children: [
                  Expanded(
                    child: _MetricCard(
                      title: "Pending Approvals",
                      value: _pendingArticles,
                      subtitle: "Articles awaiting review",
                      icon: Icons.pending_actions_outlined,
                      iconColor: AppColors.warning,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => const ContentManagementPage(
                              initialStatus: "pending",
                              pageTitle: "Pending Approvals",
                            ),
                          ),
                        ).then((_) => _fetchDashboardData());
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _MetricCard(
                      title: "Total Articles",
                      value: _totalArticles,
                      subtitle: "All articles count",
                      icon: Icons.article_outlined,
                      iconColor: AppColors.info,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => const ContentManagementPage(
                              initialStatus: "all",
                              pageTitle: "Total Articles",
                            ),
                          ),
                        ).then((_) => _fetchDashboardData());
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _MetricCard(
                      title: "Published Articles",
                      value: _publishedArticles,
                      subtitle: "Live published posts",
                      icon: Icons.check_circle_outline,
                      iconColor: AppColors.success,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => const ContentManagementPage(
                              initialStatus: "published",
                              pageTitle: "Published Articles",
                            ),
                          ),
                        ).then((_) => _fetchDashboardData());
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _MetricCard(
                      title: "Total Users",
                      value: _totalUsers,
                      subtitle: "Registered accounts",
                      icon: Icons.people_outline,
                      iconColor: AppColors.gold,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => const UsersManagementPage(),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Quick Actions Strip
              const Text(
                "QUICK ACTIONS",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    AppButton(
                      text: "New Article",
                      icon: Icons.add,
                      size: AppButtonSize.small,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (ctx) => const CreateArticlePage()),
                        ).then((_) => _fetchDashboardData());
                      },
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: "New Course",
                      icon: Icons.school,
                      variant: AppButtonVariant.secondary,
                      size: AppButtonSize.small,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (ctx) => const CreateCoursePage()),
                        );
                      },
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: "Send Broadcast",
                      icon: Icons.campaign_outlined,
                      variant: AppButtonVariant.outline,
                      size: AppButtonSize.small,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (ctx) => const BroadcastNotificationsPage()),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Pending Approvals Queue
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "PENDING EDITORIAL APPROVALS",
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => const ContentManagementPage(
                            initialStatus: "pending",
                            pageTitle: "Pending Approvals",
                          ),
                        ),
                      ).then((_) => _fetchDashboardData());
                    },
                    style: TextButton.styleFrom(
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                    ),
                    child: const Text(
                      "View All",
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.primaryNavy,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              Card(
                child: _isLoading
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                      )
                    : _pendingList.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                            child: Center(
                              child: Column(
                                children: const [
                                  Icon(Icons.task_alt, size: 28, color: AppColors.success),
                                  SizedBox(height: 6),
                                  Text(
                                    "No pending approvals",
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    "All submitted articles have been reviewed",
                                    style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _pendingList.length,
                            separatorBuilder: (ctx, i) => const Divider(),
                            itemBuilder: (ctx, i) {
                              final item = _pendingList[i];
                              final title = item['title'] ?? item['headline'] ?? "Untitled Article";
                              final author = item['author']?['name'] ?? item['authorName'] ?? "Editorial";
                              final id = item['_id'] ?? item['id'] ?? "";

                              return ListTile(
                                dense: true,
                                onTap: () => _showArticlePreview(item),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                                title: Text(
                                  title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                subtitle: Text(
                                  "By $author",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                ),
                                trailing: id.isNotEmpty
                                    ? AppButton(
                                        text: "Approve",
                                        size: AppButtonSize.small,
                                        onPressed: () => _approveArticle(id),
                                      )
                                    : null,
                              );
                            },
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final VoidCallback? onTap;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(icon, size: 16, color: iconColor),
                  const Icon(Icons.arrow_forward_ios, size: 10, color: AppColors.textMuted),
                ],
              ),
              const SizedBox(height: 5),
              Text(
                value,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 1),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
              ),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
