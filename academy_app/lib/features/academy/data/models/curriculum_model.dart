class LessonResource {
  final String id;
  final String title;
  final String fileUrl;
  final String fileType;

  const LessonResource({
    required this.id,
    required this.title,
    required this.fileUrl,
    required this.fileType,
  });

  factory LessonResource.fromJson(Map<String, dynamic> json) {
    return LessonResource(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      fileUrl: json['fileUrl']?.toString() ?? '',
      fileType: json['fileType']?.toString() ?? 'pdf',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'fileUrl': fileUrl,
    'fileType': fileType,
  };
}

class Lesson {
  final String id;
  final String title;
  final String duration;
  final String videoUrl;
  final bool isFreePreview;
  final bool isCompleted;
  final String? summary;
  final List<LessonResource> resources;

  const Lesson({
    required this.id,
    required this.title,
    required this.duration,
    required this.videoUrl,
    this.isFreePreview = false,
    this.isCompleted = false,
    this.summary,
    this.resources = const [],
  });

  Lesson copyWith({
    String? id,
    String? title,
    String? duration,
    String? videoUrl,
    bool? isFreePreview,
    bool? isCompleted,
    String? summary,
    List<LessonResource>? resources,
  }) {
    return Lesson(
      id: id ?? this.id,
      title: title ?? this.title,
      duration: duration ?? this.duration,
      videoUrl: videoUrl ?? this.videoUrl,
      isFreePreview: isFreePreview ?? this.isFreePreview,
      isCompleted: isCompleted ?? this.isCompleted,
      summary: summary ?? this.summary,
      resources: resources ?? this.resources,
    );
  }

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '10 mins',
      videoUrl: json['videoUrl']?.toString() ?? '',
      isFreePreview: json['isFreePreview'] == true,
      isCompleted: json['isCompleted'] == true,
      summary: json['summary']?.toString(),
      resources: (json['resources'] as List<dynamic>?)
              ?.map((r) => LessonResource.fromJson(r as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'duration': duration,
    'videoUrl': videoUrl,
    'isFreePreview': isFreePreview,
    'isCompleted': isCompleted,
    'summary': summary,
    'resources': resources.map((r) => r.toJson()).toList(),
  };
}

class Chapter {
  final String id;
  final String title;
  final String description;
  final List<Lesson> lessons;

  const Chapter({
    required this.id,
    required this.title,
    this.description = '',
    required this.lessons,
  });

  int get totalLessons => lessons.length;
  int get completedLessons => lessons.where((l) => l.isCompleted).length;

  factory Chapter.fromJson(Map<String, dynamic> json) {
    return Chapter(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      lessons: (json['lessons'] as List<dynamic>?)
              ?.map((l) => Lesson.fromJson(l as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'lessons': lessons.map((l) => l.toJson()).toList(),
  };
}

