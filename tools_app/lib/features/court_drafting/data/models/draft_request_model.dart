class DraftRequest {
  final String court;
  final String petitionType;
  final String petitioner;
  final String respondent;
  final String facts;
  final String grounds;
  final String prayers;

  DraftRequest({
    required this.court,
    required this.petitionType,
    required this.petitioner,
    required this.respondent,
    required this.facts,
    required this.grounds,
    required this.prayers,
  });

  Map<String, dynamic> toJson() {
    return {
      'court': court,
      'petitionType': petitionType,
      'petitioner': petitioner,
      'respondent': respondent,
      'facts': facts,
      'grounds': grounds,
      'prayers': prayers,
    };
  }
}

class DraftResponse {
  final String title;
  final String content;
  final String? id;

  DraftResponse({
    required this.title,
    required this.content,
    this.id,
  });

  factory DraftResponse.fromJson(Map<String, dynamic> json) {
    return DraftResponse(
      title: json['title'] ?? 'Court Pleading Draft',
      content: json['draft'] ?? json['content'] ?? json['text'] ?? '',
      id: json['id']?.toString() ?? json['_id']?.toString(),
    );
  }
}

