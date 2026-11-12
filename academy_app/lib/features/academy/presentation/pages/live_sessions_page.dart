import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/certificate_model.dart';
import '../../data/repositories/academy_repository.dart';

class LiveSessionsPage extends StatefulWidget {
  final AcademyRepository repository;

  const LiveSessionsPage({super.key, required this.repository});

  @override
  State<LiveSessionsPage> createState() => _LiveSessionsPageState();
}

class _LiveSessionsPageState extends State<LiveSessionsPage> {
  List<LiveSessionModel> _sessions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLiveSessions();
  }

  Future<void> _loadLiveSessions() async {
    final list = await widget.repository.getLiveSessions();
    if (mounted) {
      setState(() {
        _sessions = list;
        _isLoading = false;
      });
    }
  }

  void _joinSession(LiveSessionModel session) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          contentPadding: const EdgeInsets.all(14),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.danger.withOpacity(0.1),
                ),
                child: const Icon(
                  Icons.videocam_rounded,
                  size: 26,
                  color: AppColors.danger,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                session.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Faculty: ${session.instructorName}',
                style: const TextStyle(
                  fontSize: 10.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'Connected to High-Security Judicial Live Stream Room.\nMicrophones are moderated by host.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 9.5, color: AppColors.textMuted),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 32,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.danger,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Enter Live Classroom',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Courtroom Live Classes',
        subtitle: 'Interactive High Court & Tribunal Seminars',
      ),
      body: _isLoading
          ? const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : _sessions.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.videocam_off_outlined,
                          size: 36, color: AppColors.textMuted),
                      SizedBox(height: 8),
                      Text(
                        'No live courtroom classes scheduled at this moment.',
                        style: TextStyle(
                            fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
              padding: const EdgeInsets.all(10),
              itemCount: _sessions.length,
              itemBuilder: (context, idx) {
                final session = _sessions[idx];
                final isUpcoming = session.status == 'upcoming';

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isUpcoming
                          ? AppColors.danger.withOpacity(0.3)
                          : AppColors.borderLight,
                      width: 0.8,
                    ),
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
                              vertical: 1.5,
                            ),
                            decoration: BoxDecoration(
                              color: isUpcoming
                                  ? AppColors.dangerBg
                                  : AppColors.surfaceMuted,
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: Row(
                              children: [
                                if (isUpcoming) ...[
                                  Container(
                                    width: 5,
                                    height: 5,
                                    margin: const EdgeInsets.only(right: 3),
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.danger,
                                    ),
                                  ),
                                ],
                                Text(
                                  isUpcoming ? 'UPCOMING LIVE' : 'RECORDED ARCHIVE',
                                  style: TextStyle(
                                    fontSize: 8.5,
                                    fontWeight: FontWeight.w700,
                                    color: isUpcoming
                                        ? AppColors.danger
                                        : AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(
                                Icons.schedule_rounded,
                                size: 11,
                                color: AppColors.textMuted,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                session.scheduledAt,
                                style: const TextStyle(
                                  fontSize: 9.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        session.title,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Course: ${session.courseTitle}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        'Faculty: ${session.instructorName}',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.academyIndigo,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Duration: ${session.duration}',
                            style: const TextStyle(
                              fontSize: 9.5,
                              color: AppColors.textMuted,
                            ),
                          ),
                          SizedBox(
                            height: 26,
                            child: ElevatedButton.icon(
                              onPressed: () => _joinSession(session),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isUpcoming
                                    ? AppColors.danger
                                    : AppColors.primaryNavy,
                                foregroundColor: AppColors.textWhite,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                              icon: Icon(
                                isUpcoming
                                    ? Icons.videocam_rounded
                                    : Icons.play_arrow_rounded,
                                size: 12,
                                color: AppColors.textWhite,
                              ),
                              label: Text(
                                isUpcoming ? 'Join Live Room' : 'Watch Recording',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

