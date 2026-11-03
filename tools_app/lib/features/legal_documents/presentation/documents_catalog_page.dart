import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../../core/widgets/status_badge.dart';
import '../data/models/legal_template_model.dart';
import '../data/repositories/documents_repository.dart';

class DocumentsCatalogPage extends StatefulWidget {
  final DocumentsRepository repository;

  const DocumentsCatalogPage({super.key, required this.repository});

  @override
  State<DocumentsCatalogPage> createState() => _DocumentsCatalogPageState();
}

class _DocumentsCatalogPageState extends State<DocumentsCatalogPage> {
  final TextEditingController _searchController = TextEditingController();
  List<LegalCategory> _categories = [];
  List<LegalTemplate> _filteredTemplates = [];
  String _selectedCategorySlug = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCatalogData();
  }

  Future<void> _loadCatalogData() async {
    final list = await widget.repository.loadCatalog();
    if (mounted) {
      setState(() {
        _categories = list;
        _isLoading = false;
        _applyFilters();
      });
    }
  }

  void _applyFilters() {
    final query = _searchController.text.trim().toLowerCase();
    final List<LegalTemplate> results = [];

    for (final cat in _categories) {
      if (_selectedCategorySlug.isNotEmpty && cat.slug != _selectedCategorySlug) {
        continue;
      }
      for (final tmpl in cat.templates) {
        if (query.isEmpty || tmpl.title.toLowerCase().contains(query)) {
          results.add(tmpl);
          if (results.length >= 60) break;
        }
      }
      if (results.length >= 60) break;
    }

    setState(() {
      _filteredTemplates = results;
    });
  }

  void _openDraftingSheet(LegalTemplate template) {
    final situationController = TextEditingController();
    bool isGenerating = false;
    String? generatedDraft;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 16,
                right: 16,
                top: 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          template.title,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  StatusBadge(label: template.categoryName ?? 'Legal Deed', variant: BadgeVariant.gold),

                  const SizedBox(height: 12),

                  if (generatedDraft == null) ...[
                    const Text(
                      'Briefly describe parties & matter details:',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),
                    AppTextField(
                      controller: situationController,
                      hintText: 'e.g. Agreement between ABC Ltd and John Doe for 12 months consulting at ₹50,000/mo...',
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),
                    AppButton(
                      text: 'Generate Structured Deed',
                      isFullWidth: true,
                      size: AppButtonSize.medium,
                      isLoading: isGenerating,
                      onPressed: isGenerating
                          ? null
                          : () async {
                              setSheetState(() => isGenerating = true);
                              final res = await widget.repository.generateTemplateDraft(
                                templateTitle: template.title,
                                category: template.categoryName ?? 'General',
                                situation: situationController.text.trim(),
                              );
                              setSheetState(() {
                                isGenerating = false;
                                generatedDraft = res;
                              });
                            },
                    ),
                  ] else ...[
                    Container(
                      height: 220,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.scaffoldBg,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: SingleChildScrollView(
                        child: SelectableText(
                          generatedDraft!,
                          style: const TextStyle(fontSize: 11.5, fontFamily: 'Courier', height: 1.4),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: AppButton(
                            text: 'Copy Text',
                            variant: AppButtonVariant.outline,
                            size: AppButtonSize.small,
                            icon: Icons.copy_rounded,
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: generatedDraft!));
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Deed copied to clipboard')),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: AppButton(
                            text: 'Share',
                            size: AppButtonSize.small,
                            icon: Icons.share_rounded,
                            onPressed: () {
                              SharePlus.instance.share(
                                ShareParams(
                                  text: generatedDraft!,
                                  subject: template.title,
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 16),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Contracts & Legal Deeds Library',
        subtitle: '2,176+ Indian Templates Across 58 Categories',
        showBackButton: false,
      ),
      body: Column(
        children: [
          // Search & Category Filters
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            color: AppColors.surfaceWhite,
            child: Column(
              children: [
                SizedBox(
                  height: 38,
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => _applyFilters(),
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search 2,176+ contracts, deeds & affidavits...',
                      prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AppColors.textMuted),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // Category Pills — wrapped scrollable rows
                if (_categories.isNotEmpty)
                  SizedBox(
                    height: 64,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          // "All" chip
                          GestureDetector(
                            onTap: () {
                              setState(() => _selectedCategorySlug = '');
                              _applyFilters();
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _selectedCategorySlug.isEmpty
                                    ? AppColors.primaryNavy
                                    : AppColors.surfaceMuted,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                'All (2,176)',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: _selectedCategorySlug.isEmpty
                                      ? AppColors.textWhite
                                      : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                          ..._categories.map((cat) {
                            final isSelected = _selectedCategorySlug == cat.slug;
                            final displayName = cat.name.isNotEmpty ? cat.name : cat.slug.replaceAll('-', ' ');
                            return GestureDetector(
                              onTap: () {
                                setState(() => _selectedCategorySlug = cat.slug);
                                _applyFilters();
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.primaryNavy : AppColors.surfaceMuted,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Text(
                                  '$displayName (${cat.count})',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected ? AppColors.textWhite : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Templates List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(strokeWidth: 2.5))
                : _filteredTemplates.isEmpty
                    ? const Center(
                        child: Text(
                          'No templates found matching your query.',
                          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _filteredTemplates.length,
                        itemBuilder: (context, index) {
                          final tmpl = _filteredTemplates[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceWhite,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.description_outlined, size: 20, color: AppColors.gold),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tmpl.title,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        tmpl.categoryName ?? 'Legal Template',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                      ),
                                    ],
                                  ),
                                ),
                                AppButton(
                                  text: 'Draft',
                                  size: AppButtonSize.small,
                                  variant: AppButtonVariant.primary,
                                  onPressed: () => _openDraftingSheet(tmpl),
                                ),
                              ],
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

