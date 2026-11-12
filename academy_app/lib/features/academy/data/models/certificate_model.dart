class CertificateModel {
  final String id;
  final String certificateNumber;
  final String courseId;
  final String courseTitle;
  final String studentName;
  final String issueDate;
  final String grade;
  final String pdfUrl;
  final String verificationUrl;
  final bool isValid;

  const CertificateModel({
    required this.id,
    required this.certificateNumber,
    required this.courseId,
    required this.courseTitle,
    required this.studentName,
    required this.issueDate,
    this.grade = 'Distinction (Grade A)',
    this.pdfUrl = '',
    required this.verificationUrl,
    this.isValid = true,
  });

  factory CertificateModel.fromJson(Map<String, dynamic> json) {
    final certId = json['id']?.toString() ?? json['_id']?.toString() ?? '';
    final certNum = json['certificateNumber']?.toString() ??
        json['serialNumber']?.toString() ??
        certId;

    return CertificateModel(
      id: certId,
      certificateNumber: certNum,
      courseId: json['courseId']?.toString() ?? '',
      courseTitle: json['courseTitle']?.toString() ??
          json['course']?['title']?.toString() ??
          '',
      studentName: json['studentName']?.toString() ??
          json['user']?['name']?.toString() ??
          '',
      issueDate: json['issueDate']?.toString() ??
          json['issuedAt']?.toString() ??
          '',
      grade: json['grade']?.toString() ?? '',
      pdfUrl: json['pdfUrl']?.toString() ?? json['fileUrl']?.toString() ?? '',
      verificationUrl: json['verificationUrl']?.toString() ?? '',
      isValid: json['isValid'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'certificateNumber': certificateNumber,
    'courseId': courseId,
    'courseTitle': courseTitle,
    'studentName': studentName,
    'issueDate': issueDate,
    'grade': grade,
    'pdfUrl': pdfUrl,
    'verificationUrl': verificationUrl,
    'isValid': isValid,
  };
}

class LiveSessionModel {
  final String id;
  final String title;
  final String courseTitle;
  final String instructorName;
  final String scheduledAt;
  final String duration;
  final String status; // 'upcoming', 'live', 'completed'
  final String joinUrl;

  const LiveSessionModel({
    required this.id,
    required this.title,
    required this.courseTitle,
    required this.instructorName,
    required this.scheduledAt,
    this.duration = '60 mins',
    this.status = 'upcoming',
    this.joinUrl = '',
  });

  factory LiveSessionModel.fromJson(Map<String, dynamic> json) {
    return LiveSessionModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Advocacy Masterclass Live',
      courseTitle: json['courseTitle']?.toString() ?? 'Legal Career Accelerator',
      instructorName:
          json['instructorName']?.toString() ?? 'Adv. Sajjad Husain',
      scheduledAt: json['scheduledAt']?.toString() ?? 'Today, 06:00 PM',
      duration: json['duration']?.toString() ?? '60 mins',
      status: json['status']?.toString() ?? 'upcoming',
      joinUrl: json['joinUrl']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'courseTitle': courseTitle,
    'instructorName': instructorName,
    'scheduledAt': scheduledAt,
    'duration': duration,
    'status': status,
    'joinUrl': joinUrl,
  };
}

