class TranslationResult {
  final String originalText;
  final String translatedText;
  final String sourceLanguage;
  final String targetLanguage;
  final List<String> statutoryMapping; // e.g. "IPC 420 -> BNS 318(4)"

  TranslationResult({
    required this.originalText,
    required this.translatedText,
    required this.sourceLanguage,
    required this.targetLanguage,
    this.statutoryMapping = const [],
  });

  factory TranslationResult.fromJson(Map<String, dynamic> json) {
    final rawMapping = json['bns_mapping'] as List<dynamic>? ?? [];
    return TranslationResult(
      originalText: json['original_text'] ?? json['source'] ?? '',
      translatedText: json['translated_text'] ?? json['translation'] ?? json['text'] ?? '',
      sourceLanguage: json['source_language'] ?? 'Hindi',
      targetLanguage: json['target_language'] ?? 'English',
      statutoryMapping: rawMapping.map((e) => e.toString()).toList(),
    );
  }
}

