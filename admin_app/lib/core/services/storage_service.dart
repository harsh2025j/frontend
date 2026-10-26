import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  static const String _tokenKey = "admin_auth_token";
  static const String _refreshTokenKey = "admin_refresh_token";
  static const String _userRoleKey = "admin_user_role";
  static const String _userEmailKey = "admin_user_email";
  static const String _userNameKey = "admin_user_name";

  // Token Management
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(key: _refreshTokenKey, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _refreshTokenKey);
  }

  // Profile Cache
  Future<void> saveUserProfile({
    required String name,
    required String email,
    required String role,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userNameKey, name);
    await prefs.setString(_userEmailKey, email);
    await prefs.setString(_userRoleKey, role);
  }

  Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userRoleKey);
  }

  Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userNameKey);
  }

  Future<String?> getUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userEmailKey);
  }

  // Clear Session
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userRoleKey);
    await prefs.remove(_userNameKey);
    await prefs.remove(_userEmailKey);
  }
}
