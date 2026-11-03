class HealthCheckReport {
  final int overallScore;
  final String riskLevel; // Low, Moderate, Critical
  final String summary;
  final List<RiskFinding> findings;
  final List<String> recommendations;

  HealthCheckReport({
    required this.overallScore,
    required this.riskLevel,
    required this.summary,
    required this.findings,
    required this.recommendations,
  });

  factory HealthCheckReport.fromJson(Map<String, dynamic> json) {
    final rawFindings = json['findings'] as List<dynamic>? ?? [];
    final rawRecs = json['recommendations'] as List<dynamic>? ?? [];

    return HealthCheckReport(
      overallScore: json['score'] ?? json['overall_score'] ?? 72,
      riskLevel: json['risk_level'] ?? json['status'] ?? 'Moderate Risk',
      summary: json['summary'] ??
          '3-layer diagnostic audit identified potential vulnerabilities in arbitration seat clarity and limitation of liability.',
      findings: rawFindings.map((e) => RiskFinding.fromJson(e as Map<String, dynamic>)).toList(),
      recommendations: rawRecs.map((e) => e.toString()).toList(),
    );
  }
}

class RiskFinding {
  final String title;
  final String severity; // High, Medium, Low
  final String description;
  final String? suggestedClause;

  RiskFinding({
    required this.title,
    required this.severity,
    required this.description,
    this.suggestedClause,
  });

  factory RiskFinding.fromJson(Map<String, dynamic> json) {
    return RiskFinding(
      title: json['title'] ?? 'Clause Risk',
      severity: json['severity'] ?? 'Medium',
      description: json['description'] ?? '',
      suggestedClause: json['suggested_clause'] ?? json['recommendation'],
    );
  }
}

