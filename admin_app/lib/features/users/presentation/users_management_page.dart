import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../../core/network/api_client.dart';

class UsersManagementPage extends StatefulWidget {
  const UsersManagementPage({super.key});

  @override
  State<UsersManagementPage> createState() => _UsersManagementPageState();
}

class _UsersManagementPageState extends State<UsersManagementPage> {
  bool _isLoading = true;
  List<dynamic> _users = [];
  List<dynamic> _filteredUsers = [];
  String _errorMessage = "";
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchUsers() async {
    setState(() {
      _isLoading = true;
      _errorMessage = "";
    });

    try {
      final apiClient = context.read<ApiClient>();
      final res = await apiClient.dio.get('/users', queryParameters: {'limit': 20});
      final resData = res.data;

      List<dynamic> list = [];
      if (resData is List) {
        list = resData;
      } else if (resData is Map) {
        if (resData['data'] is List) {
          list = resData['data'];
        } else if (resData['data'] is Map) {
          final nested = resData['data'];
          if (nested['data'] is List) {
            list = nested['data'];
          } else if (nested['users'] is List) {
            list = nested['users'];
          } else if (nested['results'] is List) {
            list = nested['results'];
          }
        } else if (resData['users'] is List) {
          list = resData['users'];
        }
      }

      if (mounted) {
        setState(() {
          _users = list;
          _filteredUsers = list;
          _isLoading = false;
        });
        if (_searchController.text.isNotEmpty) {
          _applySearch(_searchController.text);
        }
      }
    } catch (e) {
      String message = e.toString();
      if (e is DioException && e.response?.data is Map) {
        message = e.response?.data['message']?.toString() ?? e.message ?? "Failed to fetch users";
      }
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = message;
        });
      }
    }
  }

  void _applySearch(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) {
      setState(() => _filteredUsers = _users);
      return;
    }

    setState(() {
      _filteredUsers = _users.where((u) {
        final name = (u['name'] ?? u['fullName'] ?? "").toString().toLowerCase();
        final email = (u['email'] ?? "").toString().toLowerCase();
        final role = _extractRole(u).toLowerCase();
        return name.contains(q) || email.contains(q) || role.contains(q);
      }).toList();
    });
  }

  String _extractRole(dynamic u) {
    if (u['roles'] != null && u['roles'] is List && (u['roles'] as List).isNotEmpty) {
      final firstRole = u['roles'][0];
      if (firstRole is Map) {
        return firstRole['name'] ?? firstRole['slug'] ?? "User";
      }
      return firstRole.toString();
    }
    return u['role']?.toString() ?? "User";
  }

  void _showUserDetails(dynamic user) {
    final name = user['name'] ?? user['fullName'] ?? "User";
    final email = user['email'] ?? "No email provided";
    final role = _extractRole(user);
    final isActive = user['isActive'] ?? true;
    final id = user['_id'] ?? user['id'] ?? "";
    final createdAt = user['createdAt'] != null ? user['createdAt'].toString().split('T').first : "N/A";

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primaryNavy,
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const SizedBox(height: 2),
                      Text(email, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                StatusBadge(status: isActive ? "active" : "inactive"),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),

            _detailRow("Role Assigned", role.toUpperCase()),
            _detailRow("Account Status", isActive ? "Active & Verified" : "Suspended / Inactive"),
            _detailRow("User ID", id),
            _detailRow("Registered Date", createdAt),

            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: "Close",
                    variant: AppButtonVariant.outline,
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: Navigator.canPop(context)
          ? AppBar(
              backgroundColor: AppColors.primaryDark,
              elevation: 0,
              title: Text(
                "Registered Users (${_users.length})",
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textWhite),
              ),
            )
          : null,
      body: Column(
        children: [
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Text("Users & Accounts", style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primarySurface,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  "${_users.length} Users",
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          const Text("Manage roles, accounts & user profiles", style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh, size: 20, color: AppColors.primaryNavy),
                      onPressed: _fetchUsers,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 38,
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: "Search by user name, email, or role...",
                      prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textMuted),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16),
                              onPressed: () {
                                _searchController.clear();
                                _applySearch("");
                              },
                            )
                          : null,
                    ),
                    onChanged: _applySearch,
                  ),
                ),
              ],
            ),
          ),
          const Divider(),

          Expanded(
            child: _isLoading
                ? const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, size: 36, color: AppColors.danger),
                              const SizedBox(height: 8),
                              Text("Error loading users: $_errorMessage", textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 12),
                              AppButton(text: "Retry", size: AppButtonSize.small, onPressed: _fetchUsers),
                            ],
                          ),
                        ),
                      )
                    : _filteredUsers.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.people_outline, size: 40, color: AppColors.textMuted),
                                  SizedBox(height: 8),
                                  Text("No users match your query", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            itemCount: _filteredUsers.length,
                            separatorBuilder: (ctx, i) => const SizedBox(height: 8),
                            itemBuilder: (ctx, i) {
                              final u = _filteredUsers[i];
                              final name = u['name'] ?? u['fullName'] ?? "User";
                              final email = u['email'] ?? "";
                              final role = _extractRole(u);
                              final isActive = u['isActive'] ?? true;
                              final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';

                              return Card(
                                child: ListTile(
                                  dense: true,
                                  onTap: () => _showUserDetails(u),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  leading: CircleAvatar(
                                    radius: 18,
                                    backgroundColor: AppColors.primarySurface,
                                    child: Text(
                                      initial,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.goldLight),
                                    ),
                                  ),
                                  title: Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          name,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      StatusBadge(status: isActive ? "active" : "inactive"),
                                    ],
                                  ),
                                  subtitle: Text(
                                    "$email • Role: $role",
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                  trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.textMuted),
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
