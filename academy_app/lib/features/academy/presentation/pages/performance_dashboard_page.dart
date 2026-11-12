import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/repositories/academy_repository.dart';

class PerformanceDashboardPage extends StatefulWidget {
  final AcademyRepository repository;
  const PerformanceDashboardPage({super.key, required this.repository});

  @override
  State<PerformanceDashboardPage> createState() => _PerformanceDashboardPageState();
}

class _PerformanceDashboardPageState extends State<PerformanceDashboardPage> {
  Map<String, dynamic>? _performance;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final perf = await widget.repository.getStudentPerformance();
    if (mounted) {
      setState(() {
        _performance = perf;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: const CompactAppBar(
        title: 'Performance & Analytics',
        subtitle: 'Course Progress & Assessment Metrics',
      ),
      body: _loading
          ? const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : _performance == null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.analytics_outlined, size: 44, color: AppColors.textMuted.withOpacity(0.5)),
                      const SizedBox(height: 8),
                      const Text(
                        'No performance record yet',
                        style: TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'Complete course modules and tests to generate metrics',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(10),
                  children: [
                    Row(
                      children: [
                        _statCard(
                          'Enrolled',
                          '${_performance!['totalEnrolled'] ?? _performance!['enrolled'] ?? 0}',
                          Icons.school_rounded,
                          AppColors.primaryNavy,
                        ),
                        const SizedBox(width: 8),
                        _statCard(
                          'Completed',
                          '${_performance!['totalCompleted'] ?? _performance!['completed'] ?? 0}',
                          Icons.check_circle_rounded,
                          AppColors.success,
                        ),
                        const SizedBox(width: 8),
                        _statCard(
                          'In Progress',
                          '${_performance!['inProgress'] ?? 0}',
                          Icons.trending_up_rounded,
                          AppColors.academyIndigo,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.gold.withOpacity(0.3), width: 1),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.goldSurface,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(Icons.workspace_premium_rounded, size: 24, color: AppColors.gold),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Certificates Issued',
                                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                              ),
                              Text(
                                '${_performance!['certificatesEarned'] ?? _performance!['certificates'] ?? 0}',
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.goldDark),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    if (_performance!['courses'] is List) ...[
                      const Text(
                        'Course Completion Status',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                      ),
                      const SizedBox(height: 6),
                      ...(_performance!['courses'] as List).map((c) {
                        final title = c['title'] ?? c['courseName'] ?? 'Course';
                        final progress = (c['progress'] as num?)?.toDouble() ?? 0.0;
                        final progressPct = progress > 1 ? progress / 100 : progress;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceWhite,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.borderLight, width: 0.8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title.toString(),
                                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primaryNavy),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(3),
                                      child: LinearProgressIndicator(
                                        value: progressPct.clamp(0.0, 1.0),
                                        backgroundColor: AppColors.borderLight,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          progressPct >= 1.0 ? AppColors.success : AppColors.academyIndigo,
                                        ),
                                        minHeight: 5,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${(progressPct * 100).toStringAsFixed(0)}%',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      }),
                    ],

                    if (_performance!['quizScores'] is List) ...[
                      const SizedBox(height: 10),
                      const Text(
                        'Assessment Scores',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                      ),
                      const SizedBox(height: 6),
                      ...(_performance!['quizScores'] as List).map((q) {
                        final title = q['quizTitle'] ?? q['title'] ?? 'Assessment Test';
                        final score = (q['score'] as num?)?.toInt() ?? 0;
                        final total = (q['totalMarks'] ?? q['total'] as num?)?.toInt() ?? 100;
                        final pct = total > 0 ? score / total : 0.0;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceWhite,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.borderLight, width: 0.8),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.quiz_outlined,
                                size: 16,
                                color: pct >= 0.7 ? AppColors.success : AppColors.warning,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  title.toString(),
                                  style: const TextStyle(fontSize: 11, color: AppColors.textPrimary),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: pct >= 0.7 ? AppColors.successBg : AppColors.warningBg,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  '$score/$total',
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: pct >= 0.7 ? AppColors.success : AppColors.warning,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ],
                ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.borderLight, width: 0.8),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
            Text(label, style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}

