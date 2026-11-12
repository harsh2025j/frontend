import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/assessment_model.dart';
import '../models/certificate_model.dart';
import '../models/course_model.dart';
import '../models/qa_model.dart';

class AcademyRepository {
  final ApiClient apiClient;

  AcademyRepository({required this.apiClient});

  final Set<String> _completedLessonIds = {};

  Future<List<CourseModel>> getCourses({
    String? category,
    String? query,
    String? level,
  }) async {
    try {
      final response = await apiClient.get(
        ApiEndpoints.academyCourses,
        queryParameters: {
          if (category != null && category != 'All') 'category': category,
          if (query != null && query.isNotEmpty) 'search': query,
          if (level != null && level != 'All Levels') 'level': level,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['value'] is List) {
          list = data['value'];
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        } else if (data is Map && data['courses'] is List) {
          list = data['courses'];
        }

        var courses = list
            .map((item) => CourseModel.fromJson(
                item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map)))
            .toList();

        if (category != null && category != 'All') {
          courses = courses
              .where((c) => c.category.toLowerCase().contains(category.toLowerCase()))
              .toList();
        }

        if (query != null && query.isNotEmpty) {
          final q = query.toLowerCase();
          courses = courses
              .where((c) =>
                  c.title.toLowerCase().contains(q) ||
                  c.description.toLowerCase().contains(q) ||
                  c.category.toLowerCase().contains(q))
              .toList();
        }

        return courses;
      }
    } catch (_) {}

    return [];
  }

  Future<CourseModel?> getCourseById(String idOrSlug) async {
    try {
      final response = await apiClient.get(
        '${ApiEndpoints.academyCourses}/$idOrSlug',
      );
      if (response.statusCode == 200 && response.data != null) {
        final raw = response.data is Map && response.data['data'] != null
            ? response.data['data']
            : response.data;
        if (raw is Map) {
          return CourseModel.fromJson(
              raw is Map<String, dynamic> ? raw : Map<String, dynamic>.from(raw));
        }
      }
    } catch (_) {}

    return null;
  }

  Future<CourseModel?> getCourseBySlug(String slug) async {
    return getCourseById(slug);
  }

  Future<List<CourseModel>> getMyEnrolledCourses() async {
    final token = await apiClient.storageService.getToken();
    if (token == null || token.isEmpty) {
      return [];
    }

    try {
      final response = await apiClient.get(ApiEndpoints.academyMyCourses);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        } else if (data is Map && data['enrollments'] is List) {
          list = data['enrollments'];
        }

        return list.map((item) {
          final map = item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map);
          if (map['course'] is Map) {
            final cMap = Map<String, dynamic>.from(map['course'] as Map);
            cMap['isEnrolled'] = true;
            if (map['progress'] != null) cMap['progress'] = map['progress'];
            return CourseModel.fromJson(cMap);
          }
          map['isEnrolled'] = true;
          return CourseModel.fromJson(map);
        }).toList();
      }
    } catch (_) {}

    return [];
  }

  Future<bool> enrollInCourse(String courseId) async {
    try {
      final url = ApiEndpoints.academyEnrollOrder.replaceAll(':courseId', courseId);
      final res = await apiClient.post(url, data: {'courseId': courseId});
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<bool> toggleLessonCompleted(String lessonId) async {
    if (_completedLessonIds.contains(lessonId)) {
      _completedLessonIds.remove(lessonId);
    } else {
      _completedLessonIds.add(lessonId);
    }
    return true;
  }

  bool isLessonCompleted(String lessonId) {
    return _completedLessonIds.contains(lessonId);
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await apiClient.post(
        ApiEndpoints.login,
        data: {'email': email.trim(), 'password': password},
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final token = data['token'] ?? data['accessToken'] ?? data['data']?['accessToken'];
        if (token != null) {
          await apiClient.storageService.saveToken(token.toString());
          await apiClient.storageService.saveString('user_email', email.trim());
          final user = data['user'] ?? data['data']?['user'];
          if (user is Map) {
            final name = user['name'] ?? user['firstName'];
            if (name != null) {
              await apiClient.storageService.saveString('user_name', name.toString());
            }
          }
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  Future<void> logout() async {
    await apiClient.storageService.clearAll();
  }

  Future<bool> isAuthenticated() async {
    final token = await apiClient.storageService.getToken();
    return token != null && token.isNotEmpty;
  }

  // Real Live Sessions from backend API
  Future<List<LiveSessionModel>> getLiveSessions() async {
    try {
      final response = await apiClient.get(ApiEndpoints.academyLiveSessions);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        }
        return list
            .map((item) => LiveSessionModel.fromJson(
                item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map)))
            .toList();
      }
    } catch (_) {}

    return [];
  }

  // Real Assessments/Quizzes from backend API
  Future<QuizModel?> getCourseQuiz(String courseId) async {
    try {
      final response = await apiClient.get('${ApiEndpoints.academyCourses}/$courseId/quiz');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data is Map && response.data['data'] != null
            ? response.data['data']
            : response.data;
        if (data is Map) {
          return QuizModel.fromJson(
              data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data));
        }
      }
    } catch (_) {}

    return null;
  }

  // Real Certificates for logged-in user
  Future<List<CertificateModel>> getCertificates() async {
    final token = await apiClient.storageService.getToken();
    if (token == null || token.isEmpty) {
      return [];
    }

    try {
      final response = await apiClient.get(ApiEndpoints.academyCertificatesMine);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        }
        return list
            .map((item) => CertificateModel.fromJson(
                item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map)))
            .toList();
      }
    } catch (_) {}

    return [];
  }

  // Real Certificate Verification
  Future<CertificateModel?> verifyCertificate(String certId) async {
    final cleanId = certId.trim();
    if (cleanId.isEmpty) return null;

    try {
      final url = ApiEndpoints.academyVerifyCertificate.replaceAll(':certificateId', cleanId);
      final response = await apiClient.get(url);
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data is Map && response.data['data'] != null
            ? response.data['data']
            : response.data;
        if (data is Map) {
          return CertificateModel.fromJson(
              data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data));
        }
      }
    } catch (_) {}

    return null;
  }

  // Real Q&A for Course
  Future<List<QAModel>> getCourseQA(String courseId) async {
    try {
      final response = await apiClient.get(
        '${ApiEndpoints.academyCourses}/$courseId/qa',
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        }
        return list
            .map((item) => QAModel.fromJson(
                item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map)))
            .toList();
      }
    } catch (_) {}

    return [];
  }

  // Real Course Assignments
  Future<List<AssignmentModel>> getCourseAssignments(String courseId) async {
    try {
      final response = await apiClient.get(
        '${ApiEndpoints.academyCourses}/$courseId/assignments',
      );
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        }
        return list
            .map((item) => AssignmentModel.fromJson(
                item is Map<String, dynamic> ? item : Map<String, dynamic>.from(item as Map)))
            .toList();
      }
    } catch (_) {}

    return [];
  }

  // Post a new Q&A question
  Future<QAModel?> postQuestion(String courseId, String question) async {
    try {
      final res = await apiClient.post(
        'academy/courses/$courseId/qa',
        data: {'question': question},
      );
      if ((res.statusCode == 200 || res.statusCode == 201) && res.data != null) {
        final raw = res.data is Map && res.data['data'] != null ? res.data['data'] : res.data;
        if (raw is Map) {
          return QAModel.fromJson(raw is Map<String, dynamic> ? raw : Map<String, dynamic>.from(raw));
        }
      }
    } catch (_) {}
    return null;
  }

  // Upvote a question
  Future<bool> upvoteQuestion(String courseId, String questionId) async {
    try {
      final res = await apiClient.post('academy/courses/$courseId/qa/$questionId/upvote', data: {});
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  // Get course reviews
  Future<List<Map<String, dynamic>>> getCourseReviews(String courseId) async {
    try {
      final res = await apiClient.get('academy/courses/$courseId/reviews');
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        } else if (data is Map && data['reviews'] is List) {
          list = data['reviews'];
        }
        return list.map((e) => e is Map<String, dynamic> ? e : Map<String, dynamic>.from(e as Map)).toList();
      }
    } catch (_) {}
    return [];
  }

  // Submit a review
  Future<bool> submitReview(String courseId, int rating, String comment) async {
    try {
      final res = await apiClient.post(
        'academy/courses/$courseId/reviews',
        data: {'rating': rating, 'comment': comment},
      );
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  // Sync lesson progress to backend
  Future<bool> syncLessonProgress(String courseId, String itemId, bool completed) async {
    try {
      final url = 'academy/enrollments/courses/$courseId/progress';
      final res = await apiClient.post(url, data: {'itemId': itemId, 'completed': completed});
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  // Create Razorpay order
  Future<Map<String, dynamic>?> createPaymentOrder(String courseId, {String? couponCode}) async {
    try {
      final Map<String, dynamic> body = {};
      if (couponCode != null && couponCode.isNotEmpty) {
        body['couponCode'] = couponCode;
      }
      final url = 'academy/enrollments/courses/$courseId/create-order';
      final res = await apiClient.post(url, data: body);
      if ((res.statusCode == 200 || res.statusCode == 201) && res.data != null) {
        final data = res.data is Map && res.data['data'] != null ? res.data['data'] : res.data;
        if (data is Map) return data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data);
      }
    } catch (_) {}
    return null;
  }

  // Verify payment after completion
  Future<bool> verifyPayment(
    String courseId, {
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    try {
      final url = 'academy/enrollments/courses/$courseId/verify';
      final res = await apiClient.post(url, data: {
        'razorpay_order_id': razorpayOrderId,
        'razorpay_payment_id': razorpayPaymentId,
        'razorpay_signature': razorpaySignature,
      });
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  // Validate coupon
  Future<Map<String, dynamic>?> validateCoupon(String courseId, String couponCode) async {
    try {
      final res = await apiClient.post('academy/coupons/validate', data: {
        'courseId': courseId,
        'couponCode': couponCode,
      });
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map && res.data['data'] != null ? res.data['data'] : res.data;
        if (data is Map) return data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data);
      }
    } catch (_) {}
    return null;
  }

  // Get student performance analytics
  Future<Map<String, dynamic>?> getStudentPerformance() async {
    final token = await apiClient.storageService.getToken();
    if (token == null || token.isEmpty) return null;
    try {
      final res = await apiClient.get('academy/students/me/performance');
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map && res.data['data'] != null ? res.data['data'] : res.data;
        if (data is Map) return data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data);
      }
    } catch (_) {}
    return null;
  }

  // Search course suggestions (autocomplete)
  Future<List<String>> getSearchSuggestions(String query) async {
    if (query.length < 2) return [];
    try {
      final res = await apiClient.get(
        'academy/courses/search',
        queryParameters: {'q': query, 'limit': '5'},
      );
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        } else if (data is Map && data['suggestions'] is List) {
          list = data['suggestions'];
        }
        return list.map((e) {
          if (e is String) return e;
          if (e is Map) return (e['title'] ?? e['name'] ?? '').toString();
          return e.toString();
        }).where((s) => s.isNotEmpty).take(5).toList();
      }
    } catch (_) {}
    return [];
  }

  // Academy Notifications
  Future<List<Map<String, dynamic>>> getNotifications() async {
    final token = await apiClient.storageService.getToken();
    if (token == null || token.isEmpty) return [];
    try {
      final res = await apiClient.get(ApiEndpoints.academyNotifications);
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data;
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['data'] is List) {
          list = data['data'];
        } else if (data is Map && data['notifications'] is List) {
          list = data['notifications'];
        }
        return list.map((e) => e is Map<String, dynamic> ? e : Map<String, dynamic>.from(e as Map)).toList();
      }
    } catch (_) {}
    return [];
  }

  Future<bool> markNotificationRead(String notifId) async {
    try {
      final url = ApiEndpoints.academyNotificationRead.replaceAll(':id', notifId);
      final res = await apiClient.post(url, data: {});
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<bool> markAllNotificationsRead() async {
    try {
      final res = await apiClient.post(ApiEndpoints.academyNotificationReadAll, data: {});
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  // User Profile
  Future<Map<String, dynamic>?> getUserProfile() async {
    final token = await apiClient.storageService.getToken();
    if (token == null || token.isEmpty) return null;
    try {
      final res = await apiClient.get(ApiEndpoints.profile);
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data is Map && res.data['data'] != null ? res.data['data'] : res.data;
        if (data is Map) return data is Map<String, dynamic> ? data : Map<String, dynamic>.from(data);
      }
    } catch (_) {}
    return null;
  }

  Future<bool> updateProfile({String? name, String? phone}) async {
    try {
      final Map<String, dynamic> body = {};
      if (name != null) body['name'] = name;
      if (phone != null) body['phone'] = phone;
      final res = await apiClient.put(ApiEndpoints.profile, data: body);
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }
}
