import 'curriculum_model.dart';

class CourseFaq {
  final String question;
  final String answer;

  const CourseFaq({required this.question, required this.answer});

  factory CourseFaq.fromJson(Map<String, dynamic> json) {
    return CourseFaq(
      question: json['q']?.toString() ?? json['question']?.toString() ?? '',
      answer: json['a']?.toString() ?? json['answer']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'q': question, 'a': answer};
}

class CourseModel {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String slug;
  final double price;
  final double originalPrice;
  final String thumbnailUrl;
  final String category;
  final String level;
  final String language;
  final String duration;
  final String instructorName;
  final String instructorBio;
  final String instructorImage;
  final double rating;
  final int enrolledCount;
  final bool hasCertificate;
  final bool isEnrolled;
  final double progress; // 0.0 to 1.0
  final List<String> requirements;
  final List<String> whatYouWillLearn;
  final List<CourseFaq> faqs;
  final List<Chapter> chapters;

  const CourseModel({
    required this.id,
    required this.title,
    this.subtitle = '',
    required this.description,
    required this.slug,
    required this.price,
    this.originalPrice = 0.0,
    required this.thumbnailUrl,
    required this.category,
    this.level = 'All Levels',
    this.language = 'English',
    this.duration = '',
    this.instructorName = '',
    this.instructorBio = '',
    this.instructorImage = '',
    this.rating = 0.0,
    this.enrolledCount = 0,
    this.hasCertificate = true,
    this.isEnrolled = false,
    this.progress = 0.0,
    this.requirements = const [],
    this.whatYouWillLearn = const [],
    this.faqs = const [],
    this.chapters = const [],
  });

  int get totalLessons =>
      chapters.fold(0, (sum, chapter) => sum + chapter.totalLessons);

  int get completedLessons =>
      chapters.fold(0, (sum, chapter) => sum + chapter.completedLessons);

  CourseModel copyWith({
    String? id,
    String? title,
    String? subtitle,
    String? description,
    String? slug,
    double? price,
    double? originalPrice,
    String? thumbnailUrl,
    String? category,
    String? level,
    String? language,
    String? duration,
    String? instructorName,
    String? instructorBio,
    String? instructorImage,
    double? rating,
    int? enrolledCount,
    bool? hasCertificate,
    bool? isEnrolled,
    double? progress,
    List<String>? requirements,
    List<String>? whatYouWillLearn,
    List<CourseFaq>? faqs,
    List<Chapter>? chapters,
  }) {
    return CourseModel(
      id: id ?? this.id,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      description: description ?? this.description,
      slug: slug ?? this.slug,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      category: category ?? this.category,
      level: level ?? this.level,
      language: language ?? this.language,
      duration: duration ?? this.duration,
      instructorName: instructorName ?? this.instructorName,
      instructorBio: instructorBio ?? this.instructorBio,
      instructorImage: instructorImage ?? this.instructorImage,
      rating: rating ?? this.rating,
      enrolledCount: enrolledCount ?? this.enrolledCount,
      hasCertificate: hasCertificate ?? this.hasCertificate,
      isEnrolled: isEnrolled ?? this.isEnrolled,
      progress: progress ?? this.progress,
      requirements: requirements ?? this.requirements,
      whatYouWillLearn: whatYouWillLearn ?? this.whatYouWillLearn,
      faqs: faqs ?? this.faqs,
      chapters: chapters ?? this.chapters,
    );
  }

  static double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }

  static int _parseInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val) ?? 0;
    return 0;
  }

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    String instName = json['instructorName']?.toString() ?? '';
    String instBio = json['instructorBio']?.toString() ?? '';
    String instImg = json['instructorImage']?.toString() ?? '';

    if (json['instructors'] is List && (json['instructors'] as List).isNotEmpty) {
      final firstInst = (json['instructors'] as List)[0];
      if (firstInst is Map) {
        if (instName.isEmpty) instName = firstInst['name']?.toString() ?? '';
        if (instBio.isEmpty) instBio = firstInst['bio']?.toString() ?? '';
        if (instImg.isEmpty) instImg = firstInst['image']?.toString() ?? '';
      }
    }

    List<Chapter> parsedChapters = [];
    final rawModules = json['modules'] ?? json['chapters'];
    if (rawModules is List) {
      parsedChapters = rawModules.map((m) {
        final mod = m is Map<String, dynamic> ? m : Map<String, dynamic>.from(m as Map);
        final rawItems = mod['items'] ?? mod['lessons'];
        List<Lesson> lessons = [];
        if (rawItems is List) {
          lessons = rawItems.map((it) {
            final item = it is Map<String, dynamic> ? it : Map<String, dynamic>.from(it as Map);
            return Lesson(
              id: item['id']?.toString() ?? '',
              title: item['title']?.toString() ?? '',
              duration: item['duration']?.toString() ?? '',
              videoUrl: item['videoUrl']?.toString() ?? item['fileUrl']?.toString() ?? '',
              isFreePreview: item['isFreePreview'] == true,
              isCompleted: item['isCompleted'] == true,
              summary: item['content']?.toString() ?? item['description']?.toString(),
            );
          }).toList();
        }

        return Chapter(
          id: mod['id']?.toString() ?? '',
          title: mod['title']?.toString() ?? '',
          description: mod['description']?.toString() ?? '',
          lessons: lessons,
        );
      }).toList();
    }

    return CourseModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      price: _parseDouble(json['price']),
      originalPrice: _parseDouble(json['originalPrice']),
      thumbnailUrl: json['thumbnailUrl']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      level: json['level']?.toString() ?? 'All Levels',
      language: json['language']?.toString() ?? 'English',
      duration: json['duration']?.toString() ??
          (json['durationHours'] != null && _parseInt(json['durationHours']) > 0
              ? '${json['durationHours']} Hours'
              : ''),
      instructorName: instName,
      instructorBio: instBio,
      instructorImage: instImg,
      rating: _parseDouble(json['rating'] ?? json['averageRating']),
      enrolledCount: _parseInt(json['enrolledCount'] ?? json['studentsCount'] ?? json['totalReviews']),
      hasCertificate: json['hasCertificate'] == true,
      isEnrolled: json['isEnrolled'] == true,
      progress: _parseDouble(json['progress']),
      requirements: (json['requirements'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      whatYouWillLearn: (json['whatYouWillLearn'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      faqs: (json['faqs'] as List<dynamic>?)
              ?.map((e) => CourseFaq.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      chapters: parsedChapters,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'subtitle': subtitle,
    'description': description,
    'slug': slug,
    'price': price,
    'originalPrice': originalPrice,
    'thumbnailUrl': thumbnailUrl,
    'category': category,
    'level': level,
    'language': language,
    'duration': duration,
    'instructorName': instructorName,
    'instructorBio': instructorBio,
    'instructorImage': instructorImage,
    'rating': rating,
    'enrolledCount': enrolledCount,
    'hasCertificate': hasCertificate,
    'isEnrolled': isEnrolled,
    'progress': progress,
    'requirements': requirements,
    'whatYouWillLearn': whatYouWillLearn,
    'faqs': faqs.map((f) => f.toJson()).toList(),
    'chapters': chapters.map((c) => c.toJson()).toList(),
  };
}
