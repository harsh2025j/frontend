class Precedent {
  final String id;
  final String title;
  final String citation;
  final String court;
  final String? judgmentDate;
  final String? bench;
  final String ratioDecidendi;
  final List<String> statutorySections;
  final String source;
  final String? pdfUrl;

  const Precedent({
    required this.id,
    required this.title,
    required this.citation,
    required this.court,
    this.judgmentDate,
    this.bench,
    required this.ratioDecidendi,
    this.statutorySections = const [],
    this.source = 'SCR Official Index',
    this.pdfUrl,
  });

  factory Precedent.fromJson(Map<String, dynamic> json) {
    return Precedent(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title'] ?? json['case_name'] ?? json['caseTitle'] ?? 'Untitled Judgment',
      citation: json['citation'] ?? json['neutral_citation'] ?? 'Neutral Citation Pending',
      court: json['court'] ?? json['court_name'] ?? 'Supreme Court of India',
      judgmentDate: json['date'] ?? json['judgment_date'] ?? json['year']?.toString(),
      bench: json['coram'] ?? json['bench'] ?? json['judges'],
      ratioDecidendi: json['ratio_decidendi'] ?? json['ratio'] ?? json['summary'] ?? '',
      statutorySections: (json['statutory_sections'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          (json['sections'] as List<dynamic>?)?.map((e) => e.toString()).toList() ??
          [],
      source: json['source'] ?? 'Official Law Report',
      pdfUrl: json['pdf_url'] ?? json['url'],
    );
  }
}

