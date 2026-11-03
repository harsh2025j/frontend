class LegalCategory {
  final String slug;
  final String name;
  final int count;
  final List<LegalTemplate> templates;

  LegalCategory({
    required this.slug,
    required this.name,
    required this.count,
    required this.templates,
  });

  factory LegalCategory.fromJson(Map<String, dynamic> json) {
    final list = (json['templates'] as List<dynamic>?)
            ?.map((e) => LegalTemplate.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    return LegalCategory(
      slug: json['slug'] ?? '',
      name: json['category_name'] ?? json['slug'] ?? 'General',
      count: json['count'] ?? list.length,
      templates: list,
    );
  }
}

class LegalTemplate {
  final String id;
  final String title;
  final String? kind;
  final String? categoryName;
  final String? categorySlug;
  final String? subcategoryName;

  LegalTemplate({
    required this.id,
    required this.title,
    this.kind,
    this.categoryName,
    this.categorySlug,
    this.subcategoryName,
  });

  factory LegalTemplate.fromJson(Map<String, dynamic> json) {
    return LegalTemplate(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'Untitled Legal Template',
      kind: json['kind'] ?? 'draft',
      categoryName: json['category_name'] ?? 'General',
      categorySlug: json['category_slug'] ?? '',
      subcategoryName: json['subcategory_name'] ?? '',
    );
  }
}

