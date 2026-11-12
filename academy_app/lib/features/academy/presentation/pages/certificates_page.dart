import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/certificate_model.dart';
import '../../data/repositories/academy_repository.dart';
import '../widgets/certificate_card.dart';

class CertificatesPage extends StatefulWidget {
  final AcademyRepository repository;

  const CertificatesPage({super.key, required this.repository});

  @override
  State<CertificatesPage> createState() => _CertificatesPageState();
}

class _CertificatesPageState extends State<CertificatesPage> {
  List<CertificateModel> _certificates = [];
  bool _isLoading = true;
  final TextEditingController _verifyController = TextEditingController();
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _loadCertificates();
  }

  @override
  void dispose() {
    _verifyController.dispose();
    super.dispose();
  }

  Future<void> _loadCertificates() async {
    final list = await widget.repository.getCertificates();
    if (mounted) {
      setState(() {
        _certificates = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _verifyCertificate(String serial) async {
    if (serial.trim().isEmpty) return;

    setState(() => _isVerifying = true);
    final result = await widget.repository.verifyCertificate(serial);
    if (mounted) {
      setState(() => _isVerifying = false);

      showDialog(
        context: context,
        builder: (context) {
          final isFound = result != null;
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.all(14),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isFound ? Icons.verified_rounded : Icons.error_outline_rounded,
                  size: 36,
                  color: isFound ? AppColors.goldDark : AppColors.danger,
                ),
                const SizedBox(height: 8),
                Text(
                  isFound
                      ? 'Authentic Judicial Certificate'
                      : 'Certificate Not Found',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 4),
                if (isFound) ...[
                  Text(
                    'Serial: ${result.certificateNumber}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Awarded to: ${result.studentName}',
                    style: const TextStyle(fontSize: 10.5, color: AppColors.textPrimary),
                  ),
                  Text(
                    'Course: ${result.courseTitle}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.successBg,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      result.grade,
                      style: const TextStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                ] else ...[
                  const Text(
                    'No official record found matching this credential identifier. Please double check the serial number.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                  ),
                ],
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 30,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryNavy,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Close',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Certificates & Credentials',
        subtitle: 'Cryptographically Verified Judicial Qualifications',
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
            child: Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 34,
                    child: TextField(
                      controller: _verifyController,
                      style: const TextStyle(fontSize: 11.5),
                      decoration: InputDecoration(
                        hintText: 'Enter Certificate ID or Serial Number...',
                        hintStyle: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                        prefixIcon: const Icon(
                          Icons.qr_code_rounded,
                          size: 15,
                          color: AppColors.textMuted,
                        ),
                        filled: true,
                        fillColor: AppColors.surfaceMuted,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(5),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: _verifyCertificate,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                SizedBox(
                  height: 34,
                  child: ElevatedButton(
                    onPressed: _isVerifying
                        ? null
                        : () => _verifyCertificate(_verifyController.text),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.goldDark,
                      foregroundColor: AppColors.textWhite,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                    child: Text(
                      _isVerifying ? 'Checking...' : 'Verify',
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
          const Divider(height: 1, color: AppColors.borderLight),

          Expanded(
            child: _isLoading
                ? const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : _certificates.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.verified_outlined,
                              size: 32,
                              color: AppColors.textMuted,
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Complete course assessments to earn certificates',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(10),
                        itemCount: _certificates.length,
                        itemBuilder: (context, idx) {
                          final cert = _certificates[idx];
                          return CertificateCard(
                            certificate: cert,
                            onVerifyTap: () =>
                                _verifyCertificate(cert.certificateNumber),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

