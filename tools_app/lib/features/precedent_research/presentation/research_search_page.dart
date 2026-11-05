import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../../core/widgets/status_badge.dart';
import '../data/models/precedent_model.dart';
import '../data/repositories/research_repository.dart';
import 'bloc/research_bloc.dart';
import 'judgment_detail_page.dart';

class ResearchSearchPage extends StatefulWidget {
  const ResearchSearchPage({super.key});

  @override
  State<ResearchSearchPage> createState() => _ResearchSearchPageState();
}

class _ResearchSearchPageState extends State<ResearchSearchPage> {
  final TextEditingController _queryController = TextEditingController();
  String _selectedCourt = '';
  String _selectedYear = '';

  static const List<String> exampleQueries = [
    'Basic structure doctrine',
    'Anticipatory bail PMLA',
    'Section 11 Arbitration Act',
    'Article 21 Right to Privacy',
  ];

  static const List<String> availableYears = [
    'All Years',
    '2026',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
    '2015',
  ];

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  void _executeSearch(String query) {
    if (query.trim().isEmpty) return;
    context.read<ResearchBloc>().add(
          SearchPrecedentsEvent(
            query: query.trim(),
            court: _selectedCourt.isEmpty ? null : _selectedCourt,
            year: (_selectedYear.isEmpty || _selectedYear == 'All Years') ? null : _selectedYear,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Precedents & Ratio Research',
        subtitle: 'Supreme Court & High Court Judgments',
      ),
      body: Column(
        children: [
          // Search & Filter Header Container
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            color: AppColors.surfaceWhite,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Input Box
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 38,
                        child: TextField(
                          controller: _queryController,
                          onSubmitted: _executeSearch,
                          style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                          decoration: InputDecoration(
                            hintText: 'Search legal ratio, doctrine or section...',
                            prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AppColors.textMuted),
                            suffixIcon: _queryController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.close_rounded, size: 16),
                                    onPressed: () {
                                      _queryController.clear();
                                      setState(() {});
                                    },
                                  )
                                : null,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: 'Search',
                      size: AppButtonSize.medium,
                      onPressed: () => _executeSearch(_queryController.text),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // Court & Year Filter Row
                Row(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildFilterChip('All Courts', ''),
                            const SizedBox(width: 6),
                            _buildFilterChip('Supreme Court', 'Supreme Court of India'),
                            const SizedBox(width: 6),
                            _buildFilterChip('High Courts', 'High Court'),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Year Dropdown Filter
                    Container(
                      height: 28,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedYear.isEmpty ? 'All Years' : _selectedYear,
                          icon: const Icon(Icons.arrow_drop_down, size: 16, color: AppColors.textSecondary),
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          items: availableYears.map((y) {
                            return DropdownMenuItem(value: y, child: Text(y));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() => _selectedYear = val);
                              if (_queryController.text.isNotEmpty) {
                                _executeSearch(_queryController.text);
                              }
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Main Body: Examples or Results
          Expanded(
            child: BlocBuilder<ResearchBloc, ResearchState>(
              builder: (context, state) {
                if (state is ResearchLoading) {
                  return const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 28,
                          height: 28,
                          child: CircularProgressIndicator(strokeWidth: 2.5),
                        ),
                        SizedBox(height: 12),
                        Text(
                          'Scanning 50,000+ judgments & SCR ratios...',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  );
                }

                if (state is ResearchError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline_rounded, size: 36, color: AppColors.danger),
                          const SizedBox(height: 10),
                          Text(
                            state.message,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 14),
                          AppButton(
                            text: 'Retry Search',
                            size: AppButtonSize.small,
                            onPressed: () => _executeSearch(_queryController.text),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                if (state is ResearchLoaded) {
                  if (state.precedents.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.find_in_page_outlined, size: 40, color: AppColors.textMuted),
                            const SizedBox(height: 10),
                            const Text(
                              'No matching precedents found',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Try broadening your query or selecting "All Courts".',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: state.precedents.length,
                    itemBuilder: (context, index) {
                      final item = state.precedents[index];
                      return _buildPrecedentCard(item);
                    },
                  );
                }

                // Initial State: Suggested Prompts & Overview
                return ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    const Text(
                      'Suggested Precedent Searches',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: exampleQueries.map((query) {
                        return ActionChip(
                          avatar: const Icon(Icons.search_rounded, size: 14, color: AppColors.primaryNavy),
                          label: Text(
                            query,
                            style: const TextStyle(fontSize: 12, color: AppColors.primaryNavy, fontWeight: FontWeight.w500),
                          ),
                          backgroundColor: AppColors.surfaceWhite,
                          side: const BorderSide(color: AppColors.borderLight),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          onPressed: () {
                            _queryController.text = query;
                            _executeSearch(query);
                          },
                        );
                      }).toList(),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final bool isSelected = _selectedCourt == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCourt = value;
        });
        if (_queryController.text.isNotEmpty) {
          _executeSearch(_queryController.text);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryNavy : AppColors.surfaceMuted,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primaryNavy : AppColors.borderLight,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: isSelected ? AppColors.textWhite : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildPrecedentCard(Precedent item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderLight, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title + Citation Badge
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryNavy,
                    height: 1.25,
                  ),
                ),
              ),
              StatusBadge(
                label: item.citation,
                variant: BadgeVariant.gold,
                fontSize: 10,
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Court + Date + Bench info
          Row(
            children: [
              const Icon(Icons.account_balance_outlined, size: 12, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(
                item.court,
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
              ),
              if (item.judgmentDate != null) ...[
                const Text(' • ', style: TextStyle(color: AppColors.textMuted)),
                Text(
                  item.judgmentDate!,
                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
              ],
            ],
          ),

          if (item.bench != null && item.bench!.isNotEmpty) ...[
            const SizedBox(height: 3),
            Row(
              children: [
                const Icon(Icons.gavel_rounded, size: 12, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    'Coram: ${item.bench}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 8),

          // Ratio Decidendi Box
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.scaffoldBg,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight, width: 0.8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.format_quote_rounded, size: 14, color: AppColors.gold),
                    SizedBox(width: 4),
                    Text(
                      'Ratio Decidendi',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.goldDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.ratioDecidendi.isNotEmpty ? item.ratioDecidendi : 'Binding ratio summary recorded in official judgment record.',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textPrimary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),

          // Footer actions: Copy Citation + Read Details
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              AppButton(
                text: 'Copy Citation',
                size: AppButtonSize.small,
                variant: AppButtonVariant.outline,
                icon: Icons.copy_rounded,
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: '${item.title} (${item.citation})'));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Citation copied to clipboard'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
              ),
              const SizedBox(width: 8),
              AppButton(
                text: 'View Judgment',
                size: AppButtonSize.small,
                variant: AppButtonVariant.primary,
                icon: Icons.menu_book_rounded,
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => JudgmentDetailPage(
                        judgmentId: item.id,
                        initialTitle: item.title,
                        repository: context.read<ResearchRepository>(),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}

