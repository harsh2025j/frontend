class ApiEndpoints {
  ApiEndpoints._();

  // Production Backend URL (or local override)
  static const String baseUrl = "https://api.sajjadhusainlawassociates.com/";

  // Auth
  static const String login = "auth/login";
  static const String register = "auth/register";
  static const String verifyOtp = "auth/verify";
  static const String refresh = "auth/refresh";
  static const String profile = "profile";

  // Articles & Content
  static const String articles = "articles";
  static const String articleApprove = "articles/:id/approve";
  static const String articleReject = "articles/:id/reject";
  static const String categories = "categories";
  static const String tags = "tags";

  // S3 Presigned URL
  static const String s3PresignedUrl = "academy/s3/presigned-url";

  // Academy (Courses & LMS)
  static const String academyCourses = "academy/courses";
  static const String academyModules = "academy/modules";
  static const String academyItems = "academy/items";
  static const String academyLiveSessions = "academy/live-sessions";
  static const String academyTests = "academy/tests";
  static const String academyAssignments = "academy/assignments";
  static const String academyStudents = "academy/students";
  static const String academyCoupons = "academy/coupons";
  static const String academyCertificates = "academy/certificates";

  // Cases & Legal
  static const String cases = "cases";
  static const String judgments = "judgments";
  static const String judges = "judges";
  static const String displayBoards = "display-boards";
  static const String reports = "reports";

  // Users & Access Control
  static const String users = "users";
  static const String roles = "roles";
  static const String permissions = "permissions";
  static const String offices = "offices";
  static const String practiceAreas = "practice-areas";
  static const String teams = "teams";

  // Appointments & Broadcasts
  static const String appointments = "appointments";
  static const String broadcast = "users/broadcast";
  static const String plans = "plans";
  static const String payouts = "payouts";
}
