import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../../core/widgets/status_badge.dart';
import '../data/models/health_check_model.dart';
import '../data/repositories/health_check_repository.dart';

class HealthCheckPage extends StatefulWidget {
  final HealthCheckRepository repository;

  const HealthCheckPage({super.key, required this.repository});

  @override
  State<HealthCheckPage> createState() => _HealthCheckPageState();
}

class _HealthCheckPageState extends State<HealthCheckPage> {
  final TextEditingController _textController = TextEditingController();
  File? _selectedFile;
  String? _selectedFileName;
  bool _isAuditing = false;
  HealthCheckReport? _report;

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final files = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
    );

    if (files.isNotEmpty && files.first.path != null) {
      setState(() {
        _selectedFile = File(files.first.path!);
        _selectedFileName = files.first.name;
      });
    }
  }

  Future<void> _runAudit() async {
    if (_textController.text.trim().isEmpty && _selectedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please paste agreement text or upload a document file.')),
      );
      return;
    }

    setState(() {
      _isAuditing = true;
    });

    final res = await widget.repository.checkDocumentHealth(
      text: _textController.text.trim().isEmpty ? null : _textController.text.trim(),
      file: _selectedFile,
    );

    if (mounted) {
      setState(() {
        _isAuditing = false;
        _report = res;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Document Health Check & Risk Audit',
        subtitle: '3-Layer Diagnostic for Contracts & Pleadings',
      ),
      body: _report != null ? _buildReportView() : _buildInputView(),
    );
  }

  Widget _buildInputView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: const Row(
              children: [
                Icon(Icons.security_outlined, size: 20, color: AppColors.toolHealth),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Audits arbitration seat vs venue, uncapped indemnities, unilateral termination, and Indian statutory compliance traps.',
                    style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // File Upload Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Upload Contract / Agreement (PDF, DOCX, TXT)',
                  style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    AppButton(
                      text: _selectedFileName == null ? 'Select File' : 'Change File',
                      size: AppButtonSize.small,
                      variant: AppButtonVariant.outline,
                      icon: Icons.upload_file_rounded,
                      onPressed: _pickFile,
                    ),
                    const SizedBox(width: 10),
                    if (_selectedFileName != null)
                      Expanded(
                        child: Text(
                          _selectedFileName!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.primaryNavy),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          const Center(
            child: Text(
              '— OR PASTE DRAFT TEXT BELOW —',
              style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: AppColors.textMuted),
            ),
          ),

          const SizedBox(height: 14),

          // Paste Text
          AppTextField(
            label: 'Contract Clauses / Pleading Body',
            hintText: 'Paste full draft clauses here to run the 100-point audit...',
            controller: _textController,
            maxLines: 7,
          ),

          const SizedBox(height: 16),

          // Run Audit Button
          AppButton(
            text: 'Run 3-Layer Diagnostic Audit',
            isFullWidth: true,
            size: AppButtonSize.large,
            icon: Icons.fact_check_rounded,
            isLoading: _isAuditing,
            onPressed: _isAuditing ? null : _runAudit,
          ),
        ],
      ),
    );
  }

  Widget _buildReportView() {
    final report = _report!;
    final bool isGood = report.overallScore >= 80;
    final Color scoreColor = isGood ? AppColors.success : (report.overallScore >= 60 ? AppColors.warning : AppColors.danger);

    return Column(
      children: [
        // Top Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          color: AppColors.surfaceWhite,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Audit Diagnostic Summary', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              AppButton(
                text: 'New Audit',
                size: AppButtonSize.small,
                variant: AppButtonVariant.outline,
                onPressed: () {
                  setState(() {
                    _report = null;
                    _textController.clear();
                    _selectedFile = null;
                    _selectedFileName = null;
                  });
                },
              ),
            ],
          ),
        ),

        const Divider(height: 1),

        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(14),
            children: [
              // Score Banner Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: scoreColor.withValues(alpha: 0.12),
                        border: Border.all(color: scoreColor, width: 2),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${report.overallScore}',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: scoreColor),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                report.riskLevel,
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: scoreColor),
                              ),
                              const SizedBox(width: 8),
                              const StatusBadge(label: 'Diagnostic 100-pt', variant: BadgeVariant.neutral),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            report.summary,
                            style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              const Text(
                'Identified Vulnerabilities & Suggested Counsel Clauses',
                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),

              const SizedBox(height: 8),

              ...report.findings.map((finding) {
                final isCritical = finding.severity == 'Critical' || finding.severity == 'High';
                final badgeVariant = isCritical ? BadgeVariant.danger : BadgeVariant.warning;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              finding.title,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                            ),
                          ),
                          StatusBadge(label: finding.severity, variant: badgeVariant),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        finding.description,
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                      ),
                      if (finding.suggestedClause != null) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.scaffoldBg,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppColors.borderLight, width: 0.8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Recommended Replacement Clause:',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      Clipboard.setData(ClipboardData(text: finding.suggestedClause!));
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Clause copied to clipboard')),
                                      );
                                    },
                                    child: const Row(
                                      children: [
                                        Icon(Icons.copy_rounded, size: 12, color: AppColors.primaryNavy),
                                        SizedBox(width: 3),
                                        Text('Copy', style: TextStyle(fontSize: 11, color: AppColors.primaryNavy, fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              SelectableText(
                                finding.suggestedClause!,
                                style: const TextStyle(fontSize: 11.5, height: 1.35, color: AppColors.textPrimary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}
