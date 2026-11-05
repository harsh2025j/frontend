import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../../../core/widgets/status_badge.dart';
import '../data/models/judgment_details_model.dart';
import '../data/repositories/research_repository.dart';

class JudgmentDetailPage extends StatefulWidget {
  final String judgmentId;
  final String? initialTitle;
  final ResearchRepository repository;

  const JudgmentDetailPage({
    super.key,
    required this.judgmentId,
    this.initialTitle,
    required this.repository,
  });

  @override
  State<JudgmentDetailPage> createState() => _JudgmentDetailPageState();
}

class _JudgmentDetailPageState extends State<JudgmentDetailPage> {
  JudgmentDetailsModel? _judgment;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadJudgment();
  }

  Future<void> _loadJudgment() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final details = await widget.repository.getJudgmentDetails(widget.judgmentId);

    if (mounted) {
      if (details != null) {
        setState(() {
          _judgment = details;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Unable to fetch official judgment record.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: CompactAppBar(
        title: _judgment?.title ?? widget.initialTitle ?? 'Judgment Details',
        subtitle: _judgment?.court ?? 'Supreme Court / High Court',
        actions: [
          if (_judgment != null)
            IconButton(
              icon: const Icon(Icons.share_rounded, size: 18),
              onPressed: () {
                final text = '${_judgment!.title}\nCitation: ${_judgment!.neutralCitation ?? _judgment!.scrCitation ?? "N/A"}\nCourt: ${_judgment!.court}';
                SharePlus.instance.share(ShareParams(text: text, subject: _judgment!.title));
              },
            ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 2.5)),
                  SizedBox(height: 12),
                  Text('Loading official judgment record...', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            )
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 36, color: AppColors.danger),
                        const SizedBox(height: 10),
                        Text(_errorMessage!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        AppButton(text: 'Retry', size: AppButtonSize.small, onPressed: _loadJudgment),
                      ],
                    ),
                  ),
                )
              : _buildJudgmentContent(),
    );
  }

  Widget _buildJudgmentContent() {
    final j = _judgment!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
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
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        j.title,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                      ),
                    ),
                    if (j.neutralCitation != null || j.scrCitation != null)
                      StatusBadge(
                        label: j.neutralCitation ?? j.scrCitation!,
                        variant: BadgeVariant.gold,
                        fontSize: 10.5,
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                const Divider(height: 1),
                const SizedBox(height: 10),

                // Court & Date
                _buildInfoLine(Icons.account_balance_outlined, 'Court', j.court),
                if (j.judgmentDate != null || j.judgmentYear != null)
                  _buildInfoLine(Icons.calendar_today_outlined, 'Date', j.judgmentDate ?? 'Year ${j.judgmentYear}'),
                if (j.bench != null && j.bench!.isNotEmpty)
                  _buildInfoLine(Icons.gavel_rounded, 'Coram / Bench', j.bench!),
                if (j.caseNumber != null)
                  _buildInfoLine(Icons.tag_rounded, 'Case No.', j.caseNumber!),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Core Ratio Decidendi Box
          if (j.ratio.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.goldLight, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.format_quote_rounded, size: 16, color: AppColors.gold),
                          SizedBox(width: 6),
                          Text('Ratio Decidendi (Binding Legal Finding)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                        ],
                      ),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: j.ratio));
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ratio copied to clipboard')));
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.copy_rounded, size: 12, color: AppColors.primaryNavy),
                            SizedBox(width: 4),
                            Text('Copy', style: TextStyle(fontSize: 11, color: AppColors.primaryNavy, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    j.ratio,
                    style: const TextStyle(fontSize: 12.5, height: 1.45, color: AppColors.textPrimary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Statutory Provisions
          if (j.provisions.isNotEmpty) ...[
            const Text('Statutory Provisions & Acts Considered', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: j.provisions.map((p) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryNavy.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Text(p, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryNavy)),
                );
              }).toList(),
            ),
            const SizedBox(height: 14),
          ],

          // Headnotes / Holdings
          if (j.holdings.isNotEmpty || j.headnotes.isNotEmpty) ...[
            const Text('Official Headnotes & Judicial Holdings', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            ...j.holdings.map((h) => _buildBulletItem(h)),
            ...j.headnotes.map((hn) => _buildBulletItem(hn)),
            const SizedBox(height: 14),
          ],

          // PDF / Download Action
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                const Icon(Icons.picture_as_pdf_rounded, size: 28, color: AppColors.danger),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Official Judgment Document', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      Text(
                        j.officialUrl != null ? 'Official High Court / Supreme Court Portal' : 'Certified Bench Copy Available',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                AppButton(
                  text: 'Copy PDF Link',
                  size: AppButtonSize.small,
                  variant: AppButtonVariant.outline,
                  icon: Icons.link_rounded,
                  onPressed: () {
                    final pdfUrl = j.officialUrl ?? widget.repository.getJudgmentPdfUrl(j.id);
                    Clipboard.setData(ClipboardData(text: pdfUrl));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Judgment PDF link copied')));
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildInfoLine(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 14, color: AppColors.textMuted),
          const SizedBox(width: 6),
          Text('$label: ', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 11.5, color: AppColors.textPrimary)),
          ),
        ],
      ),
    );
  }

  Widget _buildBulletItem(String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.arrow_right_rounded, size: 16, color: AppColors.gold),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: SelectableText(text, style: const TextStyle(fontSize: 12, height: 1.4, color: AppColors.textPrimary)),
          ),
        ],
      ),
    );
  }
}

