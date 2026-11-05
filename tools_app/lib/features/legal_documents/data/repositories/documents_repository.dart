import 'dart:convert';
import 'package:flutter/services.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../models/document_chat_model.dart';
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

  Future<DocumentAnalysisResult> analyzeInterviewChat({
    required String template,
    required String category,
    required String situation,
    List<Map<String, dynamic>> messages = const [],
  }) async {
    try {
      final response = await apiClient.dio.post(
        ApiEndpoints.documentsChat,
        data: {
          'template': template,
          'category': category,
          'situation': situation,
          'messages': messages,
        },
      );
      final data = response.data;
      if (data is Map<String, dynamic>) {
        final payload = data['data'] ?? data;
        return DocumentAnalysisResult.fromJson(payload as Map<String, dynamic>);
      }
    } catch (_) {}

    // Fallback heuristic parsing
    final List<String> extracted = [];
    final List<String> needed = [];
    if (situation.toLowerCase().contains('between') || situation.toLowerCase().contains('and')) {
      extracted.add('Parties Identified from Description');
    } else {
      needed.add('Names & addresses of First Party & Second Party');
    }
    if (situation.contains('₹') || situation.toLowerCase().contains('rs') || situation.toLowerCase().contains('inr') || situation.toLowerCase().contains('lakh')) {
      extracted.add('Consideration / Financial Sum Outlined');
    } else {
      needed.add('Agreed Monetary Consideration / Monthly Fee');
    }
    if (situation.toLowerCase().contains('month') || situation.toLowerCase().contains('year') || situation.toLowerCase().contains('days')) {
      extracted.add('Tenure / Term Duration Stated');
    } else {
      needed.add('Commencement date & duration / termination clause');
    }
    needed.add('Jurisdiction Court City / Governing State');

    return DocumentAnalysisResult(
      assistantMessage: 'I have analyzed the provided facts for "$template". Below is what was extracted and what is still needed before finalizing the draft.',
      whatIHave: extracted,
      stillNeeded: needed,
    );
  }

  Future<bool> saveLegalDocument({
    required String title,
    required String category,
    required String content,
  }) async {
    try {
      await apiClient.dio.post(
        ApiEndpoints.documentsSave,
        data: {
          'document': {
            'title': title,
            'category': category,
            'content': content,
            'createdAt': DateTime.now().toIso8601String(),
          }
        },
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<List<SavedLegalDocItem>> fetchSavedDocuments() async {
    try {
      final res = await apiClient.dio.get(ApiEndpoints.documentsHistory);
      final dynamic raw = res.data;
      final List<dynamic> items = raw is Map ? (raw['data']?['history'] ?? raw['history'] ?? raw['data'] ?? []) : (raw is List ? raw : []);
      return items.map((e) => SavedLegalDocItem.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<bool> deleteSavedDocument(String id) async {
    try {
      final endpoint = ApiEndpoints.documentsDelete.replaceFirst(':id', Uri.encodeComponent(id));
      await apiClient.dio.delete(endpoint);
      return true;
    } catch (_) {
      return false;
    }
  }
}

