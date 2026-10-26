import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../../core/network/api_client.dart';

class AppointmentsPage extends StatefulWidget {
  const AppointmentsPage({super.key});

  @override
  State<AppointmentsPage> createState() => _AppointmentsPageState();
}

class _AppointmentsPageState extends State<AppointmentsPage> {
  bool _isLoading = true;
  List<dynamic> _appointments = [];
  String _errorMessage = "";

  @override
  void initState() {
    super.initState();
    _fetchAppointments();
  }

  Future<void> _fetchAppointments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = "";
    });

    try {
      final apiClient = context.read<ApiClient>();
      final res = await apiClient.dio.get('/appointments');
      final resData = res.data;

      List<dynamic> list = [];
      if (resData is Map && resData['data'] is List) {
        list = resData['data'];
      } else if (resData is List) {
        list = resData;
      }

      if (mounted) {
        setState(() {
          _appointments = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
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
                "Consultation Bookings",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textWhite),
              ),
            )
          : null,
      body: Column(
        children: [
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text("Client Consultation Bookings", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      Text("Review requests and confirmed client meetings", style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                AppButton(
                  text: "Refresh",
                  icon: Icons.refresh,
                  size: AppButtonSize.small,
                  variant: AppButtonVariant.secondary,
                  onPressed: _fetchAppointments,
                ),
              ],
            ),
          ),
          const Divider(),

          Expanded(
            child: _isLoading
                ? const Center(
                    child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)),
                  )
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 36, color: AppColors.textMuted),
                              const SizedBox(height: 8),
                              Text("Error loading appointments: $_errorMessage", textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 12),
                              AppButton(text: "Retry", size: AppButtonSize.small, onPressed: _fetchAppointments),
                            ],
                          ),
                        ),
                      )
                    : _appointments.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.calendar_today_outlined, size: 40, color: AppColors.textMuted),
                                  SizedBox(height: 8),
                                  Text("No consultation bookings yet", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            itemCount: _appointments.length,
                            separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                            itemBuilder: (ctx, i) {
                              final appt = _appointments[i];
                              final client = appt['client']?['name'] ?? appt['clientName'] ?? "Client";
                              final phone = appt['client']?['phone'] ?? appt['phone'] ?? "";
                              final matter = appt['matter'] ?? appt['description'] ?? appt['appointmentType'] ?? "General Consultation";
                              final status = appt['status'] ?? "pending";
                              final dateTime = appt['preferredDate'] ?? appt['dateTime'] ?? "";

                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Flexible(
                                                  child: Text(
                                                    client,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                StatusBadge(status: status),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          if (dateTime.isNotEmpty)
                                            Flexible(
                                              child: Text(
                                                dateTime,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                textAlign: TextAlign.end,
                                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.goldDark),
                                              ),
                                            ),
                                        ],
                                      ),
                                      if (phone.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          "Phone: $phone",
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        ),
                                      ],
                                      const SizedBox(height: 6),
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceMuted,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          matter,
                                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
