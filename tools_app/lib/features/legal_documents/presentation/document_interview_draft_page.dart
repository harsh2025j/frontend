import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../../core/widgets/status_badge.dart';
import '../data/models/document_chat_model.dart';
import '../data/models/legal_template_model.dart';
import '../data/repositories/documents_repository.dart';

class DocumentInterviewDraftPage extends StatefulWidget {
  final LegalTemplate template;
  final DocumentsRepository repository;

  const DocumentInterviewDraftPage({
    super.key,
    required this.template,
    required this.repository,
  });

  @override
  State<DocumentInterviewDraftPage> createState() => _DocumentInterviewDraftPageState();
}

class _DocumentInterviewDraftPageState extends State<DocumentInterviewDraftPage> {
  final TextEditingController _situationController = TextEditingController();
  final TextEditingController _additionalInputController = TextEditingController();

  DocumentAnalysisResult? _analysis;
  bool _isAnalyzing = false;
  bool _isGenerating = false;
  String? _generatedDraft;
  bool _isSaved = false;

  @override
  void dispose() {
    _situationController.dispose();
    _additionalInputController.dispose();
    super.dispose();
  }

  Future<void> _runInterviewAnalysis() async {
    final situation = _situationController.text.trim();
    if (situation.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe the parties & transaction briefly.')),
      );
      return;
    }

    setState(() => _isAnalyzing = true);

    final res = await widget.repository.analyzeInterviewChat(
      template: widget.template.title,
      category: widget.template.categoryName ?? 'General',
      situation: situation,
    );

    if (mounted) {
      setState(() {
        _isAnalyzing = false;
        _analysis = res;
      });
    }
  }

  Future<void> _generateDraft() async {
    setState(() => _isGenerating = true);

    String situation = _situationController.text.trim();
    if (_additionalInputController.text.trim().isNotEmpty) {
      situation += '\nAdditional details: ${_additionalInputController.text.trim()}';
    }

    final draft = await widget.repository.generateTemplateDraft(
      templateTitle: widget.template.title,
      category: widget.template.categoryName ?? 'General',
      situation: situation,
    );

    if (mounted) {
      setState(() {
        _isGenerating = false;
        _generatedDraft = draft;
      });
    }
  }

  Future<void> _saveDraft() async {
    if (_generatedDraft == null) return;
    final ok = await widget.repository.saveLegalDocument(
      title: widget.template.title,
      category: widget.template.categoryName ?? 'General',
      content: _generatedDraft!,
    );
    if (mounted) {
      setState(() => _isSaved = ok);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ok ? 'Document deed saved to history' : 'Saved locally'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: CompactAppBar(
        title: widget.template.title,
        subtitle: widget.template.categoryName ?? 'Legal Deed Drafter',
      ),
      body: _generatedDraft != null ? _buildResultView() : _buildInterviewFormView(),
    );
  }

  Widget _buildInterviewFormView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Badge
          Row(
            children: [
              StatusBadge(
                label: widget.template.categoryName ?? 'Legal Deed',
                variant: BadgeVariant.gold,
              ),
              const Spacer(),
              const StatusBadge(label: 'AI Legal Copilot', variant: BadgeVariant.primary),
            ],
          ),
          const SizedBox(height: 12),

          // Initial Situation Box
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Step 1: Transaction Summary & Parties',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Describe the agreement purpose, names of parties, amounts, and dates:',
                  style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                AppTextField(
                  controller: _situationController,
                  hintText: 'e.g. Agreement between ABC Ltd and John Doe for software consulting at ₹75,000/month starting 1st Nov 2026...',
                  maxLines: 4,
                ),
                const SizedBox(height: 10),
                AppButton(
                  text: 'Analyze & Check Required Details',
                  size: AppButtonSize.medium,
                  isFullWidth: true,
                  icon: Icons.psychology_outlined,
                  isLoading: _isAnalyzing,
                  onPressed: _isAnalyzing ? null : _runInterviewAnalysis,
                ),
              ],
            ),
          ),

          // Analysis Output (What I Have vs Still Needed)
          if (_analysis != null) ...[
            const SizedBox(height: 14),

            // Assistant Message
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryNavy.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.primaryNavy.withValues(alpha: 0.15)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.smart_toy_outlined, size: 18, color: AppColors.primaryNavy),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _analysis!.assistantMessage,
                      style: const TextStyle(fontSize: 12, height: 1.35, color: AppColors.primaryNavy),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // What I Have (Extracted)
            if (_analysis!.whatIHave.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.successBg.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.successBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.check_circle_outline_rounded, size: 14, color: AppColors.success),
                        SizedBox(width: 6),
                        Text('What I Have (Extracted Information)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.success)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ..._analysis!.whatIHave.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 3),
                          child: Text('• $item', style: const TextStyle(fontSize: 11.5, color: AppColors.textPrimary)),
                        )),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Still Needed
            if (_analysis!.stillNeeded.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warningBg.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.warningBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.pending_actions_rounded, size: 14, color: AppColors.warning),
                        SizedBox(width: 6),
                        Text('Still Needed (To Finalize Binding Draft)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.warning)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ..._analysis!.stillNeeded.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 3),
                          child: Text('• $item', style: const TextStyle(fontSize: 11.5, color: AppColors.textPrimary)),
                        )),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Step 2: Extra inputs & Final Generation
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Step 2: Add Missing Details (Optional)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                  const SizedBox(height: 6),
                  AppTextField(
                    controller: _additionalInputController,
                    hintText: 'Provide missing party names, addresses, or specific covenants...',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 12),
                  AppButton(
                    text: 'Generate Binding Legal Deed',
                    size: AppButtonSize.large,
                    isFullWidth: true,
                    icon: Icons.auto_awesome_rounded,
                    isLoading: _isGenerating,
                    onPressed: _isGenerating ? null : _generateDraft,
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildResultView() {
    return Column(
      children: [
        // Action toolbar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          color: AppColors.surfaceWhite,
          child: Row(
            children: [
              Expanded(
                child: Text(
                  widget.template.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 8),
              AppButton(
                text: 'New Interview',
                size: AppButtonSize.small,
                variant: AppButtonVariant.outline,
                onPressed: () {
                  setState(() {
                    _generatedDraft = null;
                    _analysis = null;
                    _isSaved = false;
                  });
                },
              ),
            ],
          ),
        ),

        const Divider(height: 1),

        // Generated Text Viewer
        Expanded(
          child: Container(
            color: AppColors.scaffoldBg,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(14),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: SelectableText(
                  _generatedDraft!,
                  style: const TextStyle(
                    fontFamily: 'Courier',
                    fontSize: 12.5,
                    height: 1.5,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),
          ),
        ),

        const Divider(height: 1),

        // Bottom Actions
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          color: AppColors.surfaceWhite,
          child: Row(
            children: [
              Expanded(
                child: AppButton(
                  text: 'Copy Deed',
                  size: AppButtonSize.medium,
                  variant: AppButtonVariant.outline,
                  icon: Icons.copy_rounded,
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: _generatedDraft!));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deed copied to clipboard')));
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  text: 'Share',
                  size: AppButtonSize.medium,
                  variant: AppButtonVariant.outline,
                  icon: Icons.share_rounded,
                  onPressed: () {
                    SharePlus.instance.share(ShareParams(text: _generatedDraft!, subject: widget.template.title));
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  text: _isSaved ? 'Saved' : 'Save',
                  size: AppButtonSize.medium,
                  variant: _isSaved ? AppButtonVariant.outline : AppButtonVariant.primary,
                  icon: _isSaved ? Icons.check_circle_outline : Icons.bookmark_add_outlined,
                  onPressed: _isSaved ? null : _saveDraft,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

