import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';

class SettlementDeskPage extends StatefulWidget {
  const SettlementDeskPage({super.key});

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

  void _generateSettlement() {
    if (_claimantController.text.trim().isEmpty || _respondentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter Claimant and Respondent names.')),
      );
      return;
    }

    setState(() => _isGenerating = true);

    Future.delayed(const Duration(milliseconds: 600), () {
      final claimant = _claimantController.text.trim();
      final respondent = _respondentController.text.trim();
      final amount = _amountController.text.trim().isEmpty ? '₹ [● Agreed Consideration]' : _amountController.text.trim();
      final dispute = _disputeSummaryController.text.trim();
      final paymentTerms = _paymentTermsController.text.trim();

      final sheet = '''
MEDIATION SETTLEMENT AGREEMENT & COMPROMISE TERM SHEET
(Under the Mediation Act, 2023 & Order XXIII Rule 3 of the Code of Civil Procedure, 1908)

THIS SETTLEMENT AGREEMENT is entered into on this [● Date] day of [● Month], 2026,

BETWEEN:
$claimant (hereinafter referred to as the "FIRST PARTY / CLAIMANT")
AND:
$respondent (hereinafter referred to as the "SECOND PARTY / RESPONDENT")

PREAMBLE & DISPUTE BACKGROUND:
WHEREAS the parties had disputes concerning: "${dispute.isNotEmpty ? dispute : 'Outstanding commercial claims, pending litigation, and contested liabilities'}".
WHEREAS the parties, with the intervention of appointed counsels/mediator, have voluntarily resolved all differences amicably on the following binding terms:

1. FULL & FINAL MONETARY CONSIDERATION:
   The Second Party covenants and agrees to pay a total sum of $amount to the First Party in full and final settlement of all claims, counterclaims, and interest.
   Payment schedule agreed: ${paymentTerms.isNotEmpty ? paymentTerms : '50% within 15 days upon execution, remainder within 45 days via RTGS/NEFT'}.

2. WITHDRAWAL OF PENDING PROCEEDINGS:
   Upon receipt of the initial tranche, both parties shall file joint compromise applications under Order XXIII Rule 3 CPC for withdrawal/disposal of all pending suits, FIRs, and Section 138 NI Act complaints.

3. MUTUAL RELEASE & NON-DISPARAGEMENT:
   Each party irrevocably releases and discharges the other from all liabilities, obligations, and claims. Neither party shall publish derogatory remarks against each other in public or on digital platforms.

4. BINDING EFFECT & COURT RECORD:
   This Settlement Agreement constitutes a decree-executable instrument under Section 27 of the Mediation Act, 2023 and shall be placed before the Court for recording a compromise decree.

IN WITNESS WHEREOF the parties have set their hands:

________________________                      ________________________
FIRST PARTY / CLAIMANT                        SECOND PARTY / RESPONDENT
Advocate for First Party:                     Advocate for Second Party:
''';

      if (mounted) {
        setState(() {
          _isGenerating = false;
          _generatedTermSheet = sheet;
        });
      }
    });
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

