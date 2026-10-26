import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../../core/network/api_client.dart';

class CasesJudgmentsPage extends StatefulWidget {
  const CasesJudgmentsPage({super.key});

  @override
  State<CasesJudgmentsPage> createState() => _CasesJudgmentsPageState();
}

class _CasesJudgmentsPageState extends State<CasesJudgmentsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoadingCases = true;
  bool _isLoadingJudgments = true;
  List<dynamic> _cases = [];
  List<dynamic> _judgments = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchCases();
    _fetchJudgments();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchCases() async {
    setState(() => _isLoadingCases = true);
    try {
      final apiClient = context.read<ApiClient>();
      final res = await apiClient.dio.get('/cases');
      final resData = res.data;

      List<dynamic> list = [];
      if (resData is Map && resData['data'] is List) {
        list = resData['data'];
      } else if (resData is List) {
        list = resData;
      }

      if (mounted) {
        setState(() {
          _cases = list;
          _isLoadingCases = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingCases = false);
    }
  }

  Future<void> _fetchJudgments() async {
    setState(() => _isLoadingJudgments = true);
    try {
      final apiClient = context.read<ApiClient>();
      final res = await apiClient.dio.get('/judgments');
      final resData = res.data;

      List<dynamic> list = [];
      if (resData is Map && resData['data'] is List) {
        list = resData['data'];
      } else if (resData is List) {
        list = resData;
      }

      if (mounted) {
        setState(() {
          _judgments = list;
          _isLoadingJudgments = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingJudgments = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: Navigator.canPop(context)
          ? AppBar(
              backgroundColor: AppColors.primaryDark,
              elevation: 0,
              title: const Text(
                "Legal Cases & Judgments",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textWhite),
              ),
            )
          : null,
      body: Column(
        children: [
          // Tab Header
          Container(
            color: AppColors.surfaceWhite,
            child: TabBar(
              controller: _tabController,
              labelColor: AppColors.primaryNavy,
              unselectedLabelColor: AppColors.textMuted,
              indicatorColor: AppColors.gold,
              indicatorWeight: 2.5,
              labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
              unselectedLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
              tabs: const [
                Tab(text: "Active Court Cases"),
                Tab(text: "Judgments Repository"),
              ],
            ),
          ),
          const Divider(),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: Cases
                _isLoadingCases
                    ? const Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)))
                    : _cases.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.gavel_outlined, size: 40, color: AppColors.textMuted),
                                  SizedBox(height: 8),
                                  Text("No cases found", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            itemCount: _cases.length,
                            separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                            itemBuilder: (ctx, i) {
                              final c = _cases[i];
                              final caseNo = c['caseNo'] ?? c['caseNumber'] ?? "Case";
                              final court = c['court'] ?? "";
                              final parties = c['parties'] ?? c['title'] ?? "";
                              final status = c['status'] ?? "active";

                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              caseNo,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          StatusBadge(status: status),
                                        ],
                                      ),
                                      if (parties.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          parties,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                        ),
                                      ],
                                      if (court.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          court,
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),

                // Tab 2: Judgments
                _isLoadingJudgments
                    ? const Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)))
                    : _judgments.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.balance_outlined, size: 40, color: AppColors.textMuted),
                                  SizedBox(height: 8),
                                  Text("No judgments found", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            itemCount: _judgments.length,
                            separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                            itemBuilder: (ctx, i) {
                              final j = _judgments[i];
                              final citation = j['citation'] ?? "Judgment";
                              final title = j['title'] ?? "";
                              final isLandmark = j['isLandmark'] == true;

                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppColors.primarySurface,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                citation,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                                              ),
                                            ),
                                          ),
                                          if (isLandmark) ...[
                                            const SizedBox(width: 8),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppColors.goldSurface,
                                                borderRadius: BorderRadius.circular(4),
                                                border: Border.all(color: AppColors.gold),
                                              ),
                                              child: const Text(
                                                "★ LANDMARK",
                                                style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.goldDark),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        title,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
