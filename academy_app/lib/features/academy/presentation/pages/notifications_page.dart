import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/repositories/academy_repository.dart';

class NotificationsPage extends StatefulWidget {
  final AcademyRepository repository;
  const NotificationsPage({super.key, required this.repository});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final notifs = await widget.repository.getNotifications();
    if (mounted) {
      setState(() {
        _notifications = notifs;
        _loading = false;
      });
    }
  }

  Future<void> _markAllRead() async {
    await widget.repository.markAllNotificationsRead();
    if (mounted) {
      setState(() {
        _notifications = _notifications.map((n) => {...n, 'isRead': true, 'read': true}).toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications
        .where((n) => !(n['isRead'] == true || n['read'] == true))
        .length;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: CompactAppBar(
        title: 'Academy Alerts',
        subtitle: unreadCount > 0 ? '$unreadCount new alerts' : 'All caught up',
        actions: unreadCount > 0
            ? [
                TextButton(
                  onPressed: _markAllRead,
                  child: const Text(
                    'Mark all read',
                    style: TextStyle(fontSize: 11, color: AppColors.textWhite, fontWeight: FontWeight.w600),
                  ),
                ),
              ]
            : null,
      ),
      body: _loading
          ? const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.notifications_none_rounded,
                        size: 44,
                        color: AppColors.textMuted.withOpacity(0.5),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'No notifications yet',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 3),
                      const Text(
                        'Class schedules, assignments and scores will appear here',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _notifications.length,
                  itemBuilder: (context, i) {
                    final n = _notifications[i];
                    final isRead = n['isRead'] == true || n['read'] == true;
                    final title = n['title'] ?? n['subject'] ?? 'Notification';
                    final body = n['body'] ?? n['message'] ?? n['content'] ?? '';
                    final date = n['createdAt'] ?? '';

                    return InkWell(
                      onTap: () async {
                        final id = n['_id'] ?? n['id'] ?? '';
                        if (id.toString().isNotEmpty && !isRead) {
                          await widget.repository.markNotificationRead(id.toString());
                          setState(() {
                            _notifications[i] = {...n, 'isRead': true};
                          });
                        }
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isRead ? AppColors.surfaceWhite : AppColors.academyLight,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isRead ? AppColors.borderLight : AppColors.academyIndigo.withOpacity(0.3),
                            width: 0.8,
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: isRead
                                    ? AppColors.surfaceMuted
                                    : AppColors.academyIndigo.withOpacity(0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.notifications_rounded,
                                size: 14,
                                color: isRead ? AppColors.textMuted : AppColors.academyIndigo,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    title.toString(),
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: isRead ? FontWeight.w500 : FontWeight.w700,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  if (body.toString().isNotEmpty) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      body.toString(),
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        color: AppColors.textSecondary,
                                        height: 1.3,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                  if (date.toString().isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      date.toString().length > 10
                                          ? date.toString().substring(0, 10)
                                          : date.toString(),
                                      style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            if (!isRead)
                              Container(
                                width: 7,
                                height: 7,
                                margin: const EdgeInsets.only(top: 4),
                                decoration: const BoxDecoration(
                                  color: AppColors.academyIndigo,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

