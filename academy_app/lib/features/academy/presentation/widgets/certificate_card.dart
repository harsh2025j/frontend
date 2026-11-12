import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/certificate_model.dart';

class CertificateCard extends StatelessWidget {
  final CertificateModel certificate;
  final VoidCallback onVerifyTap;

  const CertificateCard({
    super.key,
    required this.certificate,
    required this.onVerifyTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.gold.withOpacity(0.4), width: 1),
      ),
      child: Column(
        children: [
          // Header with gold accent & Serial number
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.goldSurface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(7)),
              border: Border(
                bottom: BorderSide(
                  color: AppColors.gold.withOpacity(0.2),
                  width: 0.8,
                ),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.verified_rounded,
                  size: 14,
                  color: AppColors.goldDark,
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    certificate.certificateNumber,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.goldDark,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 5,
                    vertical: 1.5,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.successBg,
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: const Text(
                    'AUTHENTICATED',
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w700,
                      color: AppColors.success,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Certificate Body
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  certificate.courseTitle,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryNavy,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      'Conferred upon: ',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted.withOpacity(0.9),
                      ),
                    ),
                    Text(
                      certificate.studentName,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Issued: ${certificate.issueDate}',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 1.5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: Text(
                        certificate.grade,
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Divider(height: 1, color: AppColors.borderLight),
                const SizedBox(height: 8),

                // Action Buttons (Compact height 28)
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 28,
                        child: OutlinedButton.icon(
                          onPressed: onVerifyTap,
                          style: OutlinedButton.styleFrom(
                            padding: EdgeInsets.zero,
                            side: const BorderSide(
                              color: AppColors.borderLight,
                              width: 0.8,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          icon: const Icon(
                            Icons.qr_code_scanner_rounded,
                            size: 13,
                            color: AppColors.textSecondary,
                          ),
                          label: const Text(
                            'Verify Serial',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: SizedBox(
                        height: 28,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            SharePlus.instance.share(
                              ShareParams(
                                text:
                                    'Verified Legal Certificate: ${certificate.courseTitle} awarded to ${certificate.studentName}. Verify at: ${certificate.verificationUrl}',
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            padding: EdgeInsets.zero,
                            backgroundColor: AppColors.primaryNavy,
                            foregroundColor: AppColors.textWhite,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5),
                            ),
                          ),
                          icon: const Icon(
                            Icons.share_rounded,
                            size: 13,
                            color: AppColors.textWhite,
                          ),
                          label: const Text(
                            'Share Credential',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textWhite,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
