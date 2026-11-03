import 'dart:convert';
import 'package:flutter/services.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/legal_template_model.dart';

class DocumentsRepository {
  final ApiClient apiClient;
  List<LegalCategory>? _cachedCategories;

  DocumentsRepository({required this.apiClient});

  Future<List<LegalCategory>> loadCatalog() async {
    if (_cachedCategories != null) return _cachedCategories!;

    try {
      final jsonString = await rootBundle.loadString('assets/data/legalTemplatesCatalog.json');
      final data = json.decode(jsonString);
      final rawCategories = data['categories'] as List<dynamic>? ?? [];

      _cachedCategories = rawCategories.map((c) {
        final catMap = c as Map<String, dynamic>;
        return LegalCategory.fromJson(catMap);
      }).toList();

      return _cachedCategories!;
    } catch (_) {
      return [];
    }
  }

  Future<List<LegalTemplate>> searchTemplates(String query) async {
    final categories = await loadCatalog();
    final lower = query.toLowerCase();

    final List<LegalTemplate> results = [];
    for (final cat in categories) {
      for (final tmpl in cat.templates) {
        if (tmpl.title.toLowerCase().contains(lower) ||
            (tmpl.categoryName?.toLowerCase().contains(lower) ?? false)) {
          results.add(tmpl);
          if (results.length >= 50) break; // limit to 50 fast matches
        }
      }
      if (results.length >= 50) break;
    }
    return results;
  }

  Future<String> generateTemplateDraft({
    required String templateTitle,
    required String category,
    required String situation,
  }) async {
    try {
      final response = await apiClient.dio.post(
        ApiEndpoints.documentsGenerate,
        data: {
          'template': templateTitle,
          'category': category,
          'situation': situation,
          'extractedData': {},
        },
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        return data['data']?['content'] ?? data['content'] ?? data['draft'] ?? '';
      }
      return data.toString();
    } catch (_) {
      // Fallback structured draft template
      return '''
DEED OF ${templateTitle.toUpperCase()}

THIS INDENTURE is made and entered into on this [● date] day of [● month], 2026,

BETWEEN:
[● Party 1 Name / Transferor / Licensor], having permanent residence/office at [● Party 1 Address], hereinafter referred to as FIRST PARTY (which expression shall unless repugnant to the context include successors and assigns);

AND:
[● Party 2 Name / Transferee / Licensee], having permanent residence/office at [● Party 2 Address], hereinafter referred to as SECOND PARTY.

WHEREAS:
1. The First Party is the lawful owner and fully entitled to execute this Deed concerning [● Property/Matter details].
2. The Second Party has agreed to terms as outlined based on: "$situation".

NOW THIS DEED WITNESSETH AS FOLLOWS:
1. CONSIDERATION & COVENANTS:
   The total consideration agreed is [● INR Amount] paid via [● Payment Mode/Cheque No].

2. GOVERNING LAW & JURISDICTION:
   This Agreement shall be governed by the laws of India. Any dispute arising hereunder shall be subject to the exclusive jurisdiction of the Courts at [● Jurisdiction City].

IN WITNESS WHEREOF, the parties hereto have set their hands on the day and year first above written.

_____________________                   _____________________
FIRST PARTY                             SECOND PARTY
Witness 1: [● Name & Address]
Witness 2: [● Name & Address]
''';
    }
  }
}

