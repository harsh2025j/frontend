import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  Future<void> saveRefreshToken(String refreshToken) async {
    await _secureStorage.write(key: 'refresh_token', value: refreshToken);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: 'refresh_token');
  }

  Future<void> saveString(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  Future<String?> getString(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  Future<List<String>> getWishlist() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList('academy_wishlist') ?? [];
  }

  Future<void> addToWishlist(String courseId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('academy_wishlist') ?? [];
    if (!list.contains(courseId)) {
      list.add(courseId);
      await prefs.setStringList('academy_wishlist', list);
    }
  }

  Future<void> removeFromWishlist(String courseId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('academy_wishlist') ?? [];
    list.remove(courseId);
    await prefs.setStringList('academy_wishlist', list);
  }

  Future<bool> isInWishlist(String courseId) async {
    final list = await getWishlist();
    return list.contains(courseId);
  }
}

