class JudgmentDetailsModel {
  final String id;
  final String? slug;
  final String title;
  final String? petitioner;
  final String? respondent;
  final String? caseNumber;
  final String? caseType;
  final String court;
  final String? judgmentDate;
  final int? judgmentYear;
  final String? bench;
  final String? neutralCitation;
  final String? scrCitation;
  final bool hasPdf;
  final int totalParagraphs;
  final String ratio;
  final List<String> holdings;
  final List<String> headnotes;
  final List<String> provisions;
  final String? officialUrl;
  final String? disposition;

  JudgmentDetailsModel({
    required this.id,
    this.slug,
    required this.title,
    this.petitioner,
    this.respondent,
    this.caseNumber,
    this.caseType,
    required this.court,
    this.judgmentDate,
    this.judgmentYear,
    this.bench,
    this.neutralCitation,
    this.scrCitation,
    this.hasPdf = false,
    this.totalParagraphs = 0,
    required this.ratio,
    this.holdings = const [],
    this.headnotes = const [],
    this.provisions = const [],
    this.officialUrl,
    this.disposition,
  });

  factory JudgmentDetailsModel.fromJson(Map<String, dynamic> json) {
    // Parse bench
    String? benchStr;
    if (json['bench'] is List) {
      benchStr = (json['bench'] as List).where((e) => e != null).join(', ');
    } else if (json['bench'] is String) {
      benchStr = json['bench'];
    } else if (json['coram'] is String) {
      benchStr = json['coram'];
    }

    // Parse citations
    String? neutral;
    String? scr;
    if (json['citations'] is Map) {
      neutral = json['citations']['neutral'];
      scr = json['citations']['scr'];
    } else if (json['citation'] is String) {
      neutral = json['citation'];
    }

    // Parse lists
    List<String> parseList(dynamic val) {
      if (val is List) {
        return val.where((e) => e != null).map((e) => e.toString()).toList();
      }
      return [];
    }

    return JudgmentDetailsModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      slug: json['slug']?.toString(),
      title: json['title'] ?? json['case_name'] ?? json['caseTitle'] ?? 'Judgment Details',
      petitioner: json['petitioner'],
      respondent: json['respondent'],
      caseNumber: json['case_number'] ?? json['caseNumber'],
      caseType: json['case_type'] ?? json['caseType'],
      court: json['court'] ?? json['court_name'] ?? 'Supreme Court of India',
      judgmentDate: json['judgment_date'] ?? json['date'],
      judgmentYear: json['judgment_year'] is int
          ? json['judgment_year']
          : int.tryParse(json['judgment_year']?.toString() ?? ''),
      bench: benchStr,
      neutralCitation: neutral,
      scrCitation: scr,
      hasPdf: json['has_pdf'] == true || json['pdf_url'] != null,
      totalParagraphs: json['total_paragraphs'] is int
          ? json['total_paragraphs']
          : int.tryParse(json['total_paragraphs']?.toString() ?? '') ?? 0,
      ratio: (json['ratio'] ?? json['summary_llm'] ?? json['summary'] ?? json['ratio_decidendi'] ?? '').toString().trim(),
      holdings: parseList(json['holdings']),
      headnotes: parseList(json['headnotes']),
      provisions: parseList(json['provisions'] ?? json['statutory_sections']),
      officialUrl: json['official_url'] ?? json['pdf_url'],
      disposition: json['disposition']?.toString(),
    );
  }
}

