class DocumentAnalysisResult {
  final String assistantMessage;
  final List<String> whatIHave;
  final List<String> stillNeeded;

  DocumentAnalysisResult({
    required this.assistantMessage,
    this.whatIHave = const [],
    this.stillNeeded = const [],
  });

  factory DocumentAnalysisResult.fromJson(Map<String, dynamic> json) {
    List<String> parseList(dynamic val) {
      if (val is List) {
        return val.map((e) {
          if (e is Map) {
            return e['label']?.toString() ?? e['name']?.toString() ?? e['value']?.toString() ?? '';
          }
          return e.toString();
        }).where((s) => s.isNotEmpty).toList();
      }
      return [];
    }

    return DocumentAnalysisResult(
      assistantMessage: json['assistantMessage']?.toString() ??
          json['message']?.toString() ??
          'I have analyzed the provided details.',
      whatIHave: parseList(json['whatIHave']),
      stillNeeded: parseList(json['stillNeeded']),
    );
  }
}

class SavedLegalDocItem {
  final String id;
  final String title;
  final String category;
  final String content;
  final String createdAt;

  SavedLegalDocItem({
    required this.id,
    required this.title,
    required this.category,
    required this.content,
    required this.createdAt,
  });

  factory SavedLegalDocItem.fromJson(Map<String, dynamic> json) {
    return SavedLegalDocItem(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title'] ?? json['template'] ?? 'Legal Deed',
      category: json['category'] ?? 'General',
      content: json['content'] ?? json['fullDraft'] ?? '',
      createdAt: json['createdAt'] ?? json['date'] ?? '',
    );
  }
}

