class QuizQuestion {
  final String id;
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;

  const QuizQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      id: json['id']?.toString() ?? '',
      question: json['question']?.toString() ?? '',
      options: (json['options'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      correctIndex: json['correctIndex'] as int? ?? 0,
      explanation: json['explanation']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'question': question,
    'options': options,
    'correctIndex': correctIndex,
    'explanation': explanation,
  };
}

class QuizModel {
  final String id;
  final String courseId;
  final String title;
  final String description;
  final int durationMinutes;
  final int passingScorePercentage;
  final List<QuizQuestion> questions;

  const QuizModel({
    required this.id,
    required this.courseId,
    required this.title,
    required this.description,
    this.durationMinutes = 15,
    this.passingScorePercentage = 70,
    required this.questions,
  });

  factory QuizModel.fromJson(Map<String, dynamic> json) {
    return QuizModel(
      id: json['id']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      durationMinutes: json['durationMinutes'] as int? ?? 15,
      passingScorePercentage: json['passingScorePercentage'] as int? ?? 70,
      questions: (json['questions'] as List<dynamic>?)
              ?.map((q) => QuizQuestion.fromJson(q as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'courseId': courseId,
    'title': title,
    'description': description,
    'durationMinutes': durationMinutes,
    'passingScorePercentage': passingScorePercentage,
    'questions': questions.map((q) => q.toJson()).toList(),
  };
}

class AssignmentModel {
  final String id;
  final String courseId;
  final String title;
  final String description;
  final String dueDate;
  final String status; // 'pending', 'submitted', 'evaluated'
  final int maxMarks;
  final int? obtainedMarks;
  final String? feedback;
  final String? submittedFileUrl;

  const AssignmentModel({
    required this.id,
    required this.courseId,
    required this.title,
    required this.description,
    required this.dueDate,
    this.status = 'pending',
    this.maxMarks = 100,
    this.obtainedMarks,
    this.feedback,
    this.submittedFileUrl,
  });

  AssignmentModel copyWith({
    String? id,
    String? courseId,
    String? title,
    String? description,
    String? dueDate,
    String? status,
    int? maxMarks,
    int? obtainedMarks,
    String? feedback,
    String? submittedFileUrl,
  }) {
    return AssignmentModel(
      id: id ?? this.id,
      courseId: courseId ?? this.courseId,
      title: title ?? this.title,
      description: description ?? this.description,
      dueDate: dueDate ?? this.dueDate,
      status: status ?? this.status,
      maxMarks: maxMarks ?? this.maxMarks,
      obtainedMarks: obtainedMarks ?? this.obtainedMarks,
      feedback: feedback ?? this.feedback,
      submittedFileUrl: submittedFileUrl ?? this.submittedFileUrl,
    );
  }

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    return AssignmentModel(
      id: json['id']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      dueDate: json['dueDate']?.toString() ?? 'Next Week',
      status: json['status']?.toString() ?? 'pending',
      maxMarks: json['maxMarks'] as int? ?? 100,
      obtainedMarks: json['obtainedMarks'] as int?,
      feedback: json['feedback']?.toString(),
      submittedFileUrl: json['submittedFileUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'courseId': courseId,
    'title': title,
    'description': description,
    'dueDate': dueDate,
    'status': status,
    'maxMarks': maxMarks,
    'obtainedMarks': obtainedMarks,
    'feedback': feedback,
    'submittedFileUrl': submittedFileUrl,
  };
}

