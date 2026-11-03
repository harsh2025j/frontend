class ApiEndpoints {
  ApiEndpoints._();

  // Production Backend URL (with trailing slash)
  static const String baseUrl = "https://api.sajjadhusainlawassociates.com/";

  // Auth & Profile
  static const String login = "auth/login";
  static const String register = "auth/register";
  static const String verifyOtp = "auth/verify";
  static const String refresh = "auth/refresh";
  static const String profile = "profile";

  // Legal AI Tools Endpoints
  static const String toolsStatus = "tools/status";
  static const String precedentResearch = "tools/research";
  static const String judgmentDetails = "tools/judgment/:id";
  static const String judgmentDownload = "tools/judgment/:id/download";
  static const String judgmentParagraphs = "tools/judgment/:id/paragraphs";
  static const String judgmentPdf = "tools/judgment/:id/pdf";

  static const String courtDrafting = "tools/drafting";
  static const String draftHistory = "tools/drafting/history";
  static const String draftDelete = "tools/drafting/history/:id";
  static const String draftSave = "tools/drafting/save";

  static const String documentsChat = "tools/documents/chat";
  static const String documentsGenerate = "tools/documents/generate";
  static const String documentsSave = "tools/documents/save";
  static const String documentsHistory = "tools/documents/history";
  static const String documentsDelete = "tools/documents/history/:id";
  static const String templatesCategories = "tools/documents/templates/categories";
  static const String templates = "tools/documents/templates";
  static const String templateById = "tools/documents/templates/:id";

  static const String healthCheck = "tools/health-check";
  static const String translation = "tools/translation";
  static const String mediation = "tools/mediation";

  // S3 Presigned Upload
  static const String s3PresignedUrl = "academy/s3/presigned-url";
}

