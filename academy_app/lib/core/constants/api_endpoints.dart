class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = "https://api.sajjadhusainlawassociates.com/";

  // Auth & Profile
  static const String login = "auth/login";
  static const String register = "auth/register";
  static const String verifyOtp = "auth/verify";
  static const String refresh = "auth/refresh";
  static const String profile = "profile";

  // Legal Academy Endpoints
  static const String academyCourses = "academy/courses";
  static const String academySearchCourses = "academy/courses/search";
  static const String academyCourseById = "academy/courses/:id";
  static const String academyCurriculum = "academy/curriculum";
  static const String academyMyCourses = "academy/enrollments/my-courses";
  static const String academyEnrollOrder = "academy/enrollments/courses/:courseId/create-order";
  static const String academyEnrollVerify = "academy/enrollments/courses/:courseId/verify";
  static const String academyCertificatesMine = "academy/certificates/mine";
  static const String academyVerifyCertificate = "academy/certificates/verify/:certificateId";
  static const String academyLiveSessions = "academy/dashboard/live-sessions";
  static const String academyQA = "academy/courses/:courseId/qa";
  static const String academyQAAnswers = "academy/courses/:courseId/qa/:questionId/answers";
  static const String academySubmitAssignment = "academy/dashboard/assignments";

  // S3 Presigned Upload
  static const String s3PresignedUrl = "academy/s3/presigned-url";

  // Q&A
  static const String academyPostQA = "academy/courses/:courseId/qa";
  static const String academyUpvoteQA = "academy/courses/:courseId/qa/:questionId/upvote";

  // Reviews
  static const String academyCourseReviews = "academy/courses/:courseId/reviews";
  static const String academySubmitReview = "academy/courses/:courseId/reviews";

  // Progress Sync
  static const String academyProgressUpdate = "academy/enrollments/courses/:courseId/progress";

  // Notifications
  static const String academyNotifications = "academy/notifications";
  static const String academyNotificationRead = "academy/notifications/:id/read";
  static const String academyNotificationReadAll = "academy/notifications/read-all";

  // Coupons & Analytics
  static const String academyValidateCoupon = "academy/coupons/validate";
  static const String academyStudentPerformance = "academy/students/me/performance";
}

