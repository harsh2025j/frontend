import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/compact_app_bar.dart';
import '../../court_drafting/presentation/drafting_page.dart';
import '../../document_health_check/data/repositories/health_check_repository.dart';
import '../../document_health_check/presentation/health_check_page.dart';
import '../../legal_documents/data/repositories/documents_repository.dart';
import '../../legal_documents/presentation/documents_catalog_page.dart';
import '../../precedent_research/presentation/research_search_page.dart';
import '../../dispute_settlement/presentation/settlement_desk_page.dart';
import '../../vernacular_translation/data/repositories/translation_repository.dart';
import '../../vernacular_translation/presentation/translation_page.dart';
import '../data/models/tool_item.dart';
import '../data/tools_registry.dart';
import 'widgets/tool_hub_card.dart';

class ToolsHubPage extends StatefulWidget {
  final ApiClient apiClient;

  const ToolsHubPage({super.key, required this.apiClient});

  @override
  State<ToolsHubPage> createState() => _ToolsHubPageState();
}

class _ToolsHubPageState extends State<ToolsHubPage> {
  String _selectedCategory = 'All Tools';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _navigateToTool(ToolItem tool) {
    Widget targetPage;

    switch (tool.id) {
      case 'research':
        targetPage = const ResearchSearchPage();
        break;
      case 'drafting':
        targetPage = const DraftingPage();
        break;
      case 'documents':
        targetPage = DocumentsCatalogPage(
          repository: DocumentsRepository(apiClient: widget.apiClient),
        );
        break;
      case 'health-check':
        targetPage = HealthCheckPage(
          repository: HealthCheckRepository(apiClient: widget.apiClient),
        );
        break;
      case 'translation':
        targetPage = TranslationPage(
          repository: TranslationRepository(apiClient: widget.apiClient),
        );
        break;
      case 'mediation':
        targetPage = const SettlementDeskPage();
        break;
      default:
        targetPage = const ResearchSearchPage();
    }

    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => targetPage),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredTools = ToolsRegistry.tools.where((t) {
      final matchesCategory = _selectedCategory == 'All Tools' || t.category == _selectedCategory;
      final matchesQuery = _searchQuery.isEmpty ||
          t.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          t.tagline.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          t.shortTitle.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    }).toList();

    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Legal AI & Practice Tools',
        subtitle: 'Bench-Grade Precision for Indian Courts',
        showBackButton: false,
      ),
      body: Column(
        children: [
          // Header Filter Bar
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            color: AppColors.surfaceWhite,
            child: Column(
              children: [
                // Quick Search Bar
                SizedBox(
                  height: 38,
                  child: TextField(
                    controller: _searchController,
                    onChanged: (v) => setState(() => _searchQuery = v.trim()),
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search tools, ratio research, drafter, audit...',
                      prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AppColors.textMuted),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // Category Chips
                SizedBox(
                  height: 28,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: ToolsRegistry.categories.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 6),
                    itemBuilder: (context, index) {
                      final cat = ToolsRegistry.categories[index];
                      final isSelected = _selectedCategory == cat;

                      return GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primaryNavy : AppColors.surfaceMuted,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primaryNavy : AppColors.borderLight,
                            ),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? AppColors.textWhite : AppColors.textSecondary,
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

          const Divider(height: 1),

          // Tools List
          Expanded(
            child: filteredTools.isEmpty
                ? const Center(
                    child: Text(
                      'No tools found matching your search.',
                      style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: filteredTools.length,
                    itemBuilder: (context, index) {
                      final tool = filteredTools[index];
                      return ToolHubCard(
                        tool: tool,
                        onLaunch: () => _navigateToTool(tool),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

