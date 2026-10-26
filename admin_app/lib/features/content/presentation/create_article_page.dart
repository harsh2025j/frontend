import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class CreateArticlePage extends StatefulWidget {
  const CreateArticlePage({super.key});

  @override
  State<CreateArticlePage> createState() => _CreateArticlePageState();
}

class _CreateArticlePageState extends State<CreateArticlePage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _slugController = TextEditingController();
  final _subHeadlineController = TextEditingController();
  final _contentController = TextEditingController();

  String _selectedCategory = "supreme-court";
  bool _isPaywalled = false;
  bool _publishDirectly = true;
  File? _thumbnailImage;
  bool _isSubmitting = false;

  final List<({String label, String value})> _categories = const [
    (label: "Supreme Court", value: "supreme-court"),
    (label: "High Court", value: "high-court"),
    (label: "Judgments", value: "judgments"),
    (label: "Corporate Law", value: "business-article"),
    (label: "Criminal Law", value: "crime-news"),
    (label: "Know The Law", value: "know-the-law"),
    (label: "Hindi News", value: "hindi-news"),
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _slugController.dispose();
    _subHeadlineController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _generateSlug(String title) {
    final slug = title.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-|-$'), '');
    _slugController.text = slug;
  }

  Future<void> _pickThumbnail() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null) {
      setState(() => _thumbnailImage = File(picked.path));
    }
  }

  Future<void> _saveArticle() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isSubmitting = true);

      // Simulate S3 upload and API creation
      await Future.delayed(const Duration(seconds: 1));

      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_publishDirectly ? "Article Published!" : "Draft Saved Successfully!")),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: const Text("Create Legal Article", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: AppButton(
              text: _publishDirectly ? "Publish" : "Save Draft",
              icon: Icons.check,
              size: AppButtonSize.small,
              isLoading: _isSubmitting,
              onPressed: _isSubmitting ? null : _saveArticle,
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title Field
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Article Title *",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _titleController,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: "e.g., Supreme Court Landmark Judgment on Electoral Bonds",
                        ),
                        onChanged: _generateSlug,
                        validator: (v) => v == null || v.trim().isEmpty ? "Title is required" : null,
                      ),
                      const SizedBox(height: 10),

                      const Text(
                        "URL Slug *",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _slugController,
                        style: const TextStyle(fontSize: 12),
                        decoration: const InputDecoration(
                          hintText: "slug-auto-generated",
                        ),
                        validator: (v) => v == null || v.trim().isEmpty ? "Slug is required" : null,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Category & Settings Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Category *",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedCategory,
                        decoration: const InputDecoration(),
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                        items: _categories.map((c) {
                          return DropdownMenuItem(value: c.value, child: Text(c.label));
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedCategory = val);
                        },
                      ),
                      const SizedBox(height: 10),

                      const Text(
                        "Sub Headline (Optional)",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _subHeadlineController,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: "Brief summary or case citation highlight",
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Toggles
                      SwitchListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: const Text("Direct Publish", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        subtitle: const Text("Skip pending review and publish immediately", style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                        value: _publishDirectly,
                        onChanged: (v) => setState(() => _publishDirectly = v),
                      ),
                      const Divider(height: 10),
                      SwitchListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: const Text("Paywalled Content", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        subtitle: const Text("Subscribers only access", style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                        value: _isPaywalled,
                        onChanged: (v) => setState(() => _isPaywalled = v),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Thumbnail Uploader Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Cover Image / Thumbnail",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 8),
                      if (_thumbnailImage != null) ...[
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Image.file(_thumbnailImage!, height: 140, width: double.infinity, fit: BoxFit.cover),
                            ),
                            Positioned(
                              top: 6,
                              right: 6,
                              child: InkWell(
                                onTap: () => setState(() => _thumbnailImage = null),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle),
                                  child: const Icon(Icons.close, size: 14, color: AppColors.textWhite),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                      ],
                      AppButton(
                        text: _thumbnailImage == null ? "Select Image from Gallery" : "Change Image",
                        icon: Icons.upload_file,
                        variant: AppButtonVariant.outline,
                        size: AppButtonSize.small,
                        onPressed: _pickThumbnail,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Content Body Field
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Article Content *",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _contentController,
                        maxLines: 10,
                        style: const TextStyle(fontSize: 13, height: 1.4),
                        decoration: const InputDecoration(
                          hintText: "Enter complete legal article, bench details, arguments, and conclusions...",
                        ),
                        validator: (v) => v == null || v.trim().isEmpty ? "Content is required" : null,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
