import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/assessment_model.dart';

class AssignmentSubmissionPage extends StatefulWidget {
  final AssignmentModel assignment;

  const AssignmentSubmissionPage({super.key, required this.assignment});

  @override
  State<AssignmentSubmissionPage> createState() =>
      _AssignmentSubmissionPageState();
}

class _AssignmentSubmissionPageState extends State<AssignmentSubmissionPage> {
  late AssignmentModel _assignment;
  String? _selectedFileName;
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _assignment = widget.assignment;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final files = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'docx', 'doc'],
    );
    if (files.isNotEmpty) {
      setState(() {
        _selectedFileName = files.first.name;
      });
    }
  }

  Future<void> _submitAssignment() async {
    if (_selectedFileName == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Please attach your drafted petition or document first',
            style: TextStyle(fontSize: 11),
          ),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 1200));

    if (mounted) {
      setState(() {
        _assignment = _assignment.copyWith(
          status: 'submitted',
          submittedFileUrl: _selectedFileName,
        );
        _isSubmitting = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Drafting assignment submitted to Senior Counsel for review!',
            style: TextStyle(fontSize: 11),
          ),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitted = _assignment.status != 'pending';

    return Scaffold(
      appBar: CompactAppBar(
        title: _assignment.title,
        subtitle: 'Courtroom Drafting Submission',
      ),
      body: ListView(
        padding: const EdgeInsets.all(10),
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight, width: 0.8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: isSubmitted
                            ? AppColors.successBg
                            : AppColors.warningBg,
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: Text(
                        _assignment.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: isSubmitted
                              ? AppColors.success
                              : AppColors.warning,
                        ),
                      ),
                    ),
                    Text(
                      _assignment.dueDate,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _assignment.title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _assignment.description,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          if (_assignment.status == 'evaluated' && _assignment.feedback != null)
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: AppColors.successBg.withOpacity(0.5),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.successBorder, width: 0.8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.rate_review_rounded,
                            size: 13,
                            color: AppColors.success,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Faculty Evaluation & Marks',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '${_assignment.obtainedMarks}/${_assignment.maxMarks}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _assignment.feedback!,
                    style: const TextStyle(
                      fontSize: 10.5,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),

          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight, width: 0.8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Attachment (PDF or DOCX)',
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 6),
                InkWell(
                  onTap: isSubmitted ? null : _pickFile,
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: AppColors.borderLight,
                        width: 0.8,
                        style: BorderStyle.solid,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _selectedFileName != null
                              ? Icons.description_rounded
                              : Icons.cloud_upload_outlined,
                          size: 24,
                          color: _selectedFileName != null
                              ? AppColors.academyIndigo
                              : AppColors.textMuted,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _selectedFileName ??
                              (_assignment.submittedFileUrl ??
                                  'Tap to choose PDF/DOCX file'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: _selectedFileName != null
                                ? FontWeight.w600
                                : FontWeight.w400,
                            color: _selectedFileName != null
                                ? AppColors.academyIndigo
                                : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Maximum file size: 25 MB',
                          style: TextStyle(
                            fontSize: 9,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                const Text(
                  'Additional Notes for Counsel (Optional)',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                TextField(
                  controller: _notesController,
                  enabled: !isSubmitted,
                  maxLines: 2,
                  style: const TextStyle(fontSize: 11),
                  decoration: InputDecoration(
                    hintText:
                        'e.g. Incorporated prayers for interim stay under NCLT Rule 34...',
                    hintStyle: const TextStyle(
                      fontSize: 10.5,
                      color: AppColors.textMuted,
                    ),
                    filled: true,
                    fillColor: AppColors.surfaceMuted,
                    contentPadding: const EdgeInsets.all(8),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(4),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                if (!isSubmitted)
                  SizedBox(
                    width: double.infinity,
                    height: 32,
                    child: ElevatedButton.icon(
                      onPressed: _isSubmitting ? null : _submitAssignment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryNavy,
                        foregroundColor: AppColors.textWhite,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      icon: const Icon(
                        Icons.send_rounded,
                        size: 13,
                        color: AppColors.textWhite,
                      ),
                      label: Text(
                        _isSubmitting
                            ? 'Submitting...'
                            : 'Submit Drafting Assignment',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textWhite,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

