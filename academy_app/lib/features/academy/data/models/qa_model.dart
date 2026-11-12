class QAAnswer {
  final String id;
  final String authorName;
  final String authorRole;
  final String content;
  final String createdAt;
  final int upvotes;

  const QAAnswer({
    required this.id,
    required this.authorName,
    this.authorRole = 'Student',
    required this.content,
    required this.createdAt,
    this.upvotes = 0,
  });

  factory QAAnswer.fromJson(Map<String, dynamic> json) {
    return QAAnswer(
      id: json['id']?.toString() ?? '',
      authorName: json['authorName']?.toString() ??
          json['author']?['name']?.toString() ??
          'Counsel',
      authorRole: json['authorRole']?.toString() ?? 'Faculty Member',
      content: json['content']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? 'Just now',
      upvotes: json['upvotes'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'authorName': authorName,
    'authorRole': authorRole,
    'content': content,
    'createdAt': createdAt,
    'upvotes': upvotes,
  };
}

class QAModel {
  final String id;
  final String courseId;
  final String authorName;
  final String question;
  final String createdAt;
  final int upvotes;
  final List<QAAnswer> answers;

  const QAModel({
    required this.id,
    required this.courseId,
    required this.authorName,
    required this.question,
    required this.createdAt,
    this.upvotes = 0,
    this.answers = const [],
  });

  factory QAModel.fromJson(Map<String, dynamic> json) {
    return QAModel(
      id: json['id']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      authorName: json['authorName']?.toString() ??
          json['user']?['name']?.toString() ??
          'Law Student',
      question: json['question']?.toString() ?? json['title']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '2 days ago',
      upvotes: json['upvotes'] as int? ?? 0,
      answers: (json['answers'] as List<dynamic>?)
              ?.map((a) => QAAnswer.fromJson(a as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'courseId': courseId,
    'authorName': authorName,
    'question': question,
    'createdAt': createdAt,
    'upvotes': upvotes,
    'answers': answers.map((a) => a.toJson()).toList(),
  };
}

