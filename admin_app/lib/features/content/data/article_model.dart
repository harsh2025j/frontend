class AdminArticleModel {
  final String id;
  final String title;
  final String? subHeadline;
  final String slug;
  final String status; // 'pending' | 'published' | 'draft' | 'rejected'
  final String? rejectionReason;
  final String? thumbnail;
  final String? categoryName;
  final String? authorName;
  final DateTime createdAt;

  AdminArticleModel({
    required this.id,
    required this.title,
    this.subHeadline,
    required this.slug,
    required this.status,
    this.rejectionReason,
    this.thumbnail,
    this.categoryName,
    this.authorName,
    required this.createdAt,
  });

  factory AdminArticleModel.fromJson(Map<String, dynamic> json) {
    String? author;
    if (json['author'] != null) {
      if (json['author'] is Map) {
        author = json['author']['name']?.toString() ?? json['author']['fullName']?.toString();
      } else {
        author = json['author'].toString();
      }
    } else if (json['advocateName'] != null) {
      author = json['advocateName'].toString();
    } else if (json['authorName'] != null) {
      author = json['authorName'].toString();
    }

    String? category;
    if (json['category'] != null) {
      if (json['category'] is Map) {
        category = json['category']['name']?.toString();
      } else {
        category = json['category'].toString();
      }
    } else if (json['categoryName'] != null) {
      category = json['categoryName'].toString();
    }

    return AdminArticleModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: (json['title'] ?? json['headline'] ?? 'Untitled Article').toString(),
      subHeadline: json['subHeadline']?.toString(),
      slug: (json['slug'] ?? '').toString(),
      status: (json['status'] ?? 'draft').toString().toLowerCase(),
      rejectionReason: json['rejectionReason']?.toString(),
      thumbnail: json['thumbnail']?.toString() ?? json['thumbnailUrl']?.toString(),
      categoryName: category,
      authorName: author ?? 'Editorial Desk',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
