import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class BroadcastNotificationsPage extends StatefulWidget {
  const BroadcastNotificationsPage({super.key});

  @override
  State<BroadcastNotificationsPage> createState() => _BroadcastNotificationsPageState();
}

class _BroadcastNotificationsPageState extends State<BroadcastNotificationsPage> {
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  String _targetAudience = "All Users";
  bool _isSending = false;

  final List<Map<String, dynamic>> _broadcastHistory = [];

  @override
  void dispose() {
    _titleController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  Future<void> _sendBroadcast() async {
    final title = _titleController.text.trim();
    final body = _bodyController.text.trim();

    if (title.isEmpty || body.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill title and message body")),
      );
      return;
    }

    setState(() => _isSending = true);
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      setState(() {
        _isSending = false;
        _broadcastHistory.insert(0, {
          "title": title,
          "body": body,
          "audience": _targetAudience,
          "sentAt": "Just now",
          "delivered": "Sending...",
        });
        _titleController.clear();
        _bodyController.clear();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Broadcast Notification Sent Successfully!")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: Navigator.canPop(context)
          ? AppBar(
              backgroundColor: AppColors.primaryDark,
              elevation: 0,
              title: const Text(
                "Broadcast Notifications",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textWhite),
              ),
            )
          : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Create Broadcast Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Compose Push Broadcast",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                    ),
                    const Text(
                      "Send instant push notifications to active app users",
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 12),

                    const Text("Notification Title *", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _titleController,
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(hintText: "e.g., Breaking: Supreme Court Judgment on BNSS"),
                    ),
                    const SizedBox(height: 10),

                    const Text("Target Audience", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _targetAudience,
                      decoration: const InputDecoration(),
                      style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                      items: ["All Users", "Advocates Only", "Academy Students", "Subscribers Only"].map((a) {
                        return DropdownMenuItem(value: a, child: Text(a));
                      }).toList(),
                      onChanged: (v) => setState(() => _targetAudience = v ?? _targetAudience),
                    ),
                    const SizedBox(height: 10),

                    const Text("Message Body *", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _bodyController,
                      maxLines: 3,
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: "Enter the notification summary that will appear on user lock screens...",
                      ),
                    ),
                    const SizedBox(height: 14),

                    Align(
                      alignment: Alignment.centerRight,
                      child: AppButton(
                        text: "Send Broadcast Blast",
                        icon: Icons.send_outlined,
                        isLoading: _isSending,
                        onPressed: _isSending ? null : _sendBroadcast,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_broadcastHistory.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                "RECENT BROADCAST HISTORY",
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5),
              ),
              const SizedBox(height: 8),
              ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _broadcastHistory.length,
              separatorBuilder: (ctx, i) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) {
                final b = _broadcastHistory[i];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primarySurface,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                b['audience'],
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.goldLight),
                              ),
                            ),
                            const Spacer(),
                            Text(b['sentAt'], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          b['title'],
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          b['body'],
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          "Delivered: ${b['delivered']}",
                          style: const TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
          ],
        ),
      ),
    );
  }
}
