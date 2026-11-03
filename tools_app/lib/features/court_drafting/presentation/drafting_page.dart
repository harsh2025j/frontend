import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../data/models/draft_request_model.dart';
import 'bloc/drafting_bloc.dart';

class DraftingPage extends StatefulWidget {
  const DraftingPage({super.key});

  @override
  State<DraftingPage> createState() => _DraftingPageState();
}

class _DraftingPageState extends State<DraftingPage> {
  final _formKey = GlobalKey<FormState>();

  String _selectedCourt = 'Supreme Court of India';
  String _selectedPetitionType = 'Special Leave Petition (Civil/Criminal)';

  final _petitionerController = TextEditingController();
  final _respondentController = TextEditingController();
  final _factsController = TextEditingController();
  final _groundsController = TextEditingController();
  final _prayersController = TextEditingController();

  static const List<String> courtList = [
    'Supreme Court of India',
    'High Court of Delhi',
    'High Court of Bombay',
    'High Court of Allahabad',
    'High Court of Karnataka',
    'Other High Courts',
  ];

  static const List<String> petitionTypes = [
    'Special Leave Petition (Civil/Criminal)',
    'Article 226/32 Writ Petition (Mandamus/Certiorari)',
    'Anticipatory / Regular Bail Application',
    'Commercial Suit / Plaint for Recovery',
    'Section 11 Arbitration Appointment Petition',
    'Section 138 NI Act Cheque Bounce Notice',
  ];

  @override
  void dispose() {
    _petitionerController.dispose();
    _respondentController.dispose();
    _factsController.dispose();
    _groundsController.dispose();
    _prayersController.dispose();
    super.dispose();
  }

  void _submitDraft() {
    if (_formKey.currentState?.validate() ?? false) {
      final request = DraftRequest(
        court: _selectedCourt,
        petitionType: _selectedPetitionType,
        petitioner: _petitionerController.text.trim(),
        respondent: _respondentController.text.trim(),
        facts: _factsController.text.trim(),
        grounds: _groundsController.text.trim(),
        prayers: _prayersController.text.trim(),
      );

      context.read<DraftingBloc>().add(GenerateDraftEvent(request));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Court Pleadings Drafter',
        subtitle: 'High Court & Supreme Court Formats',
      ),
      body: BlocConsumer<DraftingBloc, DraftingState>(
        listener: (context, state) {
          if (state is DraftingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: AppColors.danger),
            );
          }
          if (state is DraftingSuccess && state.isSaved) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Draft saved successfully to history'),
                backgroundColor: AppColors.success,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is DraftingSuccess) {
            return _buildDraftResultView(state.draft);
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(14),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Banner Header
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.goldSurface,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.goldLight, width: 0.8),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.shield_outlined, size: 16, color: AppColors.goldDark),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Drafts formulated follow official Court Rules: Chronological Synopsis, List of Dates, Binding Grounds, and Conforming Prayers.',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: AppColors.goldDark,
                              height: 1.3,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Court Selection Dropdown
                  const Text(
                    'Court Jurisdiction',
                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedCourt,
                        isExpanded: true,
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                        items: courtList.map((court) {
                          return DropdownMenuItem(value: court, child: Text(court));
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedCourt = val);
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Petition Type Dropdown
                  const Text(
                    'Pleading / Petition Category',
                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedPetitionType,
                        isExpanded: true,
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                        items: petitionTypes.map((type) {
                          return DropdownMenuItem(value: type, child: Text(type));
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedPetitionType = val);
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Parties Names (Petitioner & Respondent)
                  Row(
                    children: [
                      Expanded(
                        child: AppTextField(
                          label: 'Petitioner / Applicant',
                          hintText: 'e.g. Ramesh Kumar & Ors.',
                          controller: _petitionerController,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: AppTextField(
                          label: 'Respondent / Opposite Party',
                          hintText: 'e.g. State of NCT & Anr.',
                          controller: _respondentController,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Facts of the Matter
                  AppTextField(
                    label: 'Material Facts & Sequence of Events',
                    hintText: 'Briefly state dates, impugned orders, dispute origin and key transactions...',
                    controller: _factsController,
                    maxLines: 4,
                    validator: (v) => v == null || v.length < 10 ? 'Please provide brief facts' : null,
                  ),

                  const SizedBox(height: 12),

                  // Statutory Grounds
                  AppTextField(
                    label: 'Statutory Grounds & Legal Violations',
                    hintText: 'e.g. Violation of Art 14/21, Section 438 CrPC parameters, lack of natural justice...',
                    controller: _groundsController,
                    maxLines: 3,
                    validator: (v) => v == null || v.isEmpty ? 'Please specify legal grounds' : null,
                  ),

                  const SizedBox(height: 12),

                  // Prayers
                  AppTextField(
                    label: 'Specific Prayers & Interim Reliefs',
                    hintText: 'e.g. Quashing of FIR / Stay of impugned order dated 12.01.2025...',
                    controller: _prayersController,
                    maxLines: 3,
                    validator: (v) => v == null || v.isEmpty ? 'Please specify relief requested' : null,
                  ),

                  const SizedBox(height: 18),

                  // Submit Action Button
                  AppButton(
                    text: 'Formulate Court Pleading Draft',
                    isFullWidth: true,
                    size: AppButtonSize.large,
                    icon: Icons.auto_awesome_rounded,
                    isLoading: state is DraftingLoading,
                    onPressed: state is DraftingLoading ? null : _submitDraft,
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDraftResultView(DraftResponse draft) {
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
                  draft.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 8),
              AppButton(
                text: 'New Draft',
                size: AppButtonSize.small,
                variant: AppButtonVariant.outline,
                onPressed: () {
                  context.read<DraftingBloc>().add(ResetDraftEvent());
                },
              ),
            ],
          ),
        ),

        const Divider(height: 1),

        // Draft Content Area
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
                  draft.content,
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

        // Bottom Actions (Copy, Share, Save)
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          color: AppColors.surfaceWhite,
          child: Row(
            children: [
              Expanded(
                child: AppButton(
                  text: 'Copy Text',
                  size: AppButtonSize.medium,
                  variant: AppButtonVariant.outline,
                  icon: Icons.copy_rounded,
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: draft.content));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Draft copied to clipboard')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  text: 'Share / Export',
                  size: AppButtonSize.medium,
                  variant: AppButtonVariant.outline,
                  icon: Icons.share_rounded,
                  onPressed: () {
                    SharePlus.instance.share(
                      ShareParams(
                        text: draft.content,
                        subject: draft.title,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  text: 'Save',
                  size: AppButtonSize.medium,
                  variant: AppButtonVariant.primary,
                  icon: Icons.bookmark_added_outlined,
                  onPressed: () {
                    context.read<DraftingBloc>().add(
                          SaveDraftEvent(title: draft.title, content: draft.content),
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

