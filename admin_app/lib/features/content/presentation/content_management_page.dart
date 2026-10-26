import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/status_badge.dart';
import 'bloc/content_bloc.dart';
import '../data/article_model.dart';
import 'create_article_page.dart';

class ContentManagementPage extends StatefulWidget {
  final String initialStatus;
  final String? pageTitle;

  const ContentManagementPage({
    super.key,
    this.initialStatus = "all",
    this.pageTitle,
  });

  @override
  State<ContentManagementPage> createState() => _ContentManagementPageState();
}

class _ContentManagementPageState extends State<ContentManagementPage> {
  late String _selectedStatus;
  final TextEditingController _searchController = TextEditingController();

  final List<({String label, String value})> _tabs = const [
    (label: "All", value: "all"),
    (label: "Pending", value: "pending"),
    (label: "Published", value: "published"),
    (label: "Draft", value: "draft"),
    (label: "Rejected", value: "rejected"),
  ];

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.initialStatus;
    context.read<ContentBloc>().add(FetchArticles(status: _selectedStatus));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onStatusChanged(String status) {
    setState(() => _selectedStatus = status);
    context.read<ContentBloc>().add(FetchArticles(status: status, query: _searchController.text));
  }

  void _showRejectDialog(BuildContext context, String articleId) {
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceWhite,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        title: const Text("Reject Article", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Please provide a reason for the author to make necessary amendments:",
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(fontSize: 13),
              decoration: const InputDecoration(
                hintText: "e.g., Incomplete citations, ambiguous ratio decidendi...",
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: AppColors.textSecondary)),
          ),
          AppButton(
            text: "Reject Post",
            variant: AppButtonVariant.danger,
            size: AppButtonSize.small,
            onPressed: () {
              final reason = reasonController.text.trim();
              if (reason.isNotEmpty) {
                Navigator.pop(ctx);
                context.read<ContentBloc>().add(RejectArticleEvent(id: articleId, reason: reason));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Article marked as Rejected")),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: Navigator.canPop(context)
          ? AppBar(
              backgroundColor: AppColors.primaryDark,
              elevation: 0,
              title: Text(
                widget.pageTitle ?? "Content Management",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textWhite,
                ),
              ),
            )
          : null,
      body: Column(
        children: [
          // Filter & Search Header Strip
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 38,
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(fontSize: 13),
                          decoration: InputDecoration(
                            hintText: "Search articles by title, author, keyword...",
                            prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textMuted),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 16),
                                    onPressed: () {
                                      _searchController.clear();
                                      context.read<ContentBloc>().add(FetchArticles(status: _selectedStatus));
                                    },
                                  )
                                : null,
                          ),
                          onSubmitted: (query) {
                            context.read<ContentBloc>().add(FetchArticles(status: _selectedStatus, query: query));
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: "New Post",
                      icon: Icons.add,
                      size: AppButtonSize.medium,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (ctx) => const CreateArticlePage()),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Horizontal Status Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _tabs.map((tab) {
                      final isSelected = _selectedStatus == tab.value;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: InkWell(
                          onTap: () => _onStatusChanged(tab.value),
                          borderRadius: BorderRadius.circular(4),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primaryNavy : AppColors.surfaceMuted,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: isSelected ? AppColors.primaryNavy : AppColors.borderLight,
                              ),
                            ),
                            child: Text(
                              tab.label,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                color: isSelected ? AppColors.textWhite : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          const Divider(),

          // Articles List
          Expanded(
            child: BlocBuilder<ContentBloc, ContentState>(
              builder: (context, state) {
                if (state is ContentLoading) {
                  return const Center(child: CircularProgressIndicator(color: AppColors.primaryNavy));
                }

                if (state is ContentLoaded) {
                  final articles = state.articles;

                  if (articles.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.inbox_outlined, size: 40, color: AppColors.textMuted),
                          const SizedBox(height: 8),
                          Text(
                            "No articles found in '${_selectedStatus.toUpperCase()}' tab",
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    itemCount: articles.length,
                    separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                    itemBuilder: (ctx, i) {
                      return _ArticleCard(
                        article: articles[i],
                        onApprove: () {
                          context.read<ContentBloc>().add(ApproveArticleEvent(id: articles[i].id));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Article Approved Successfully!")),
                          );
                        },
                        onReject: () => _showRejectDialog(context, articles[i].id),
                        onDelete: () {
                          context.read<ContentBloc>().add(DeleteArticleEvent(id: articles[i].id));
                        },
                      );
                    },
                  );
                }

                if (state is ContentError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 36, color: AppColors.danger),
                          const SizedBox(height: 8),
                          Text(
                            state.message,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 12),
                          AppButton(
                            text: "Retry",
                            size: AppButtonSize.small,
                            onPressed: () {
                              context.read<ContentBloc>().add(FetchArticles(status: _selectedStatus));
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return const Center(child: CircularProgressIndicator(color: AppColors.primaryNavy));
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ArticleCard extends StatelessWidget {
  final AdminArticleModel article;
  final VoidCallback onApprove;
  final VoidCallback onReject;
  final VoidCallback onDelete;

  const _ArticleCard({
    required this.article,
    required this.onApprove,
    required this.onReject,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Meta Row
            Row(
              children: [
                StatusBadge(status: article.status),
                if (article.categoryName != null && article.categoryName!.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  Flexible(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.goldSurface,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        article.categoryName!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.goldDark),
                      ),
                    ),
                  ),
                ],
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    "By ${article.authorName ?? 'Admin'}",
                    textAlign: TextAlign.end,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Title
            Text(
              article.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            if (article.subHeadline != null && article.subHeadline!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                article.subHeadline!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],

            // Rejection reason banner if rejected
            if (article.status == 'rejected' && article.rejectionReason != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  "Reason: ${article.rejectionReason!}",
                  style: const TextStyle(fontSize: 11, color: AppColors.danger),
                ),
              ),
            ],

            const SizedBox(height: 10),
            const Divider(),
            const SizedBox(height: 6),

            // Action Buttons Strip (Compact)
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (article.status == 'pending') ...[
                  AppButton(
                    text: "Reject",
                    variant: AppButtonVariant.danger,
                    size: AppButtonSize.small,
                    onPressed: onReject,
                  ),
                  const SizedBox(width: 8),
                  AppButton(
                    text: "Approve",
                    variant: AppButtonVariant.primary,
                    size: AppButtonSize.small,
                    icon: Icons.check,
                    onPressed: onApprove,
                  ),
                ] else if (article.status == 'published') ...[
                  AppButton(
                    text: "Unpublish",
                    variant: AppButtonVariant.outline,
                    size: AppButtonSize.small,
                    onPressed: onReject,
                  ),
                ] else ...[
                  AppButton(
                    text: "Publish",
                    variant: AppButtonVariant.primary,
                    size: AppButtonSize.small,
                    icon: Icons.publish,
                    onPressed: onApprove,
                  ),
                ],
                const SizedBox(width: 6),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.textMuted),
                  visualDensity: VisualDensity.compact,
                  onPressed: onDelete,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
