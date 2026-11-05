import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../data/repositories/settlement_repository.dart';

class SettlementDeskPage extends StatefulWidget {
  final SettlementRepository repository;

  const SettlementDeskPage({super.key, required this.repository});

  @override
  State<SettlementDeskPage> createState() => _SettlementDeskPageState();
}

class _SettlementDeskPageState extends State<SettlementDeskPage> {
  final _claimantController = TextEditingController();
  final _respondentController = TextEditingController();
  final _amountController = TextEditingController();
  final _disputeSummaryController = TextEditingController();
  final _paymentTermsController = TextEditingController();

  bool _isGenerating = false;
  String? _generatedTermSheet;

  @override
  void dispose() {
    _claimantController.dispose();
    _respondentController.dispose();
    _amountController.dispose();
    _disputeSummaryController.dispose();
    _paymentTermsController.dispose();
    super.dispose();
  }

  Future<void> _generateSettlement() async {
    if (_claimantController.text.trim().isEmpty || _respondentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter Claimant and Respondent names.')),
      );
      return;
    }

    setState(() => _isGenerating = true);

    final claimant = _claimantController.text.trim();
    final respondent = _respondentController.text.trim();
    final amount = _amountController.text.trim().isEmpty ? '₹ [● Agreed Consideration]' : _amountController.text.trim();
    final dispute = _disputeSummaryController.text.trim();
    final paymentTerms = _paymentTermsController.text.trim();

    final sheet = await widget.repository.generateSettlementSheet(
      claimant: claimant,
      respondent: respondent,
      amount: amount,
      disputeSummary: dispute,
      paymentTerms: paymentTerms,
    );

    if (mounted) {
      setState(() {
        _isGenerating = false;
        _generatedTermSheet = sheet;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Mediation & Settlement Desk',
        subtitle: 'Order XXIII Rule 3 CPC & Mediation Act 2023',
      ),
      body: _generatedTermSheet != null ? _buildResultView() : _buildFormView(),
    );
  }

  Widget _buildFormView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: const Row(
              children: [
                Icon(Icons.handshake_outlined, size: 20, color: AppColors.toolSettlement),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Formulate judicially enforceable 5-part settlement term sheets, default interest covenants, and mutual release decrees.',
                    style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: AppTextField(
                  label: 'Claimant / First Party',
                  hintText: 'e.g. M/s Sunrise Infra Pvt Ltd',
                  controller: _claimantController,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppTextField(
                  label: 'Respondent / Second Party',
                  hintText: 'e.g. Apex Builders Ltd',
                  controller: _respondentController,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          AppTextField(
            label: 'Settlement Amount (INR)',
            hintText: 'e.g. ₹ 25,00,000/-',
            controller: _amountController,
          ),

          const SizedBox(height: 12),

          AppTextField(
            label: 'Dispute Summary & Pending Case Numbers',
            hintText: 'e.g. Recovery suit pending before District Court Saket, CS No. 124/2024...',
            controller: _disputeSummaryController,
            maxLines: 3,
          ),

          const SizedBox(height: 12),

          AppTextField(
            label: 'Payment Tranches & Deadlines',
            hintText: 'e.g. Tranche 1: ₹10 Lakhs by 15th Nov, Tranche 2: ₹15 Lakhs by 15th Dec...',
            controller: _paymentTermsController,
            maxLines: 2,
          ),

          const SizedBox(height: 16),

          AppButton(
            text: 'Generate Settlement Term Sheet',
            isFullWidth: true,
            size: AppButtonSize.large,
            icon: Icons.auto_awesome_rounded,
            isLoading: _isGenerating,
            onPressed: _isGenerating ? null : _generateSettlement,
          ),
        ],
      ),
    );
  }

  Widget _buildResultView() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          color: AppColors.surfaceWhite,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Enforceable Term Sheet', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              AppButton(
                text: 'New Agreement',
                size: AppButtonSize.small,
                variant: AppButtonVariant.outline,
                onPressed: () {
                  setState(() => _generatedTermSheet = null);
                },
              ),
            ],
          ),
        ),

        const Divider(height: 1),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: SelectableText(
                _generatedTermSheet!,
                style: const TextStyle(fontFamily: 'Courier', fontSize: 12, height: 1.45),
              ),
            ),
          ),
        ),

        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          color: AppColors.surfaceWhite,
          child: Row(
            children: [
              Expanded(
                child: AppButton(
                  text: 'Copy Term Sheet',
                  size: AppButtonSize.medium,
                  variant: AppButtonVariant.outline,
                  icon: Icons.copy_rounded,
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: _generatedTermSheet!));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Term sheet copied to clipboard')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  text: 'Share / Export',
                  size: AppButtonSize.medium,
                  icon: Icons.share_rounded,
                  onPressed: () {
                    SharePlus.instance.share(
                      ShareParams(
                        text: _generatedTermSheet!,
                        subject: 'Mediation Settlement Term Sheet',
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

