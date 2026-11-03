import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../data/models/translation_model.dart';
import '../data/repositories/translation_repository.dart';

class TranslationPage extends StatefulWidget {
  final TranslationRepository repository;

  const TranslationPage({super.key, required this.repository});

  @override
  State<TranslationPage> createState() => _TranslationPageState();
}

class _TranslationPageState extends State<TranslationPage> {
  final TextEditingController _textController = TextEditingController();
  File? _selectedFile;
  String? _selectedFileName;
  String _sourceLang = 'Hindi';
  final String _targetLang = 'Judicial English';
  bool _isTranslating = false;
  TranslationResult? _result;

  static const List<String> indianLanguages = [
    'Hindi',
    'Marathi',
    'Bengali',
    'Telugu',
    'Tamil',
    'Gujarati',
    'Urdu',
    'Kannada',
    'Odia',
    'Malayalam',
    'Punjabi',
    'Assamese',
  ];

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final files = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'txt'],
    );
    if (files.isNotEmpty && files.first.path != null) {
      setState(() {
        _selectedFile = File(files.first.path!);
        _selectedFileName = files.first.name;
      });
    }
  }

  Future<void> _translate() async {
    if (_textController.text.trim().isEmpty && _selectedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter text or select a document.')),
      );
      return;
    }

    setState(() => _isTranslating = true);

    final res = await widget.repository.translateDocument(
      text: _textController.text.trim().isEmpty ? null : _textController.text.trim(),
      sourceLanguage: _sourceLang,
      targetLanguage: _targetLang,
      file: _selectedFile,
    );

    if (mounted) {
      setState(() {
        _isTranslating = false;
        _result = res;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CompactAppBar(
        title: 'Vernacular Translation & Legal OCR',
        subtitle: '22 Indian Languages to High Court Judicial English',
      ),
      body: _result != null ? _buildResultView() : _buildInputView(),
    );
  }

  Widget _buildInputView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: const Row(
              children: [
                Icon(Icons.g_translate_rounded, size: 20, color: AppColors.toolTranslation),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Certified translation for vernacular court orders, police FIRs, and revenue records preserving statutory sections & plot numbers.',
                    style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Language Selector Row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Source Language', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _sourceLang,
                          isExpanded: true,
                          style: const TextStyle(fontSize: 12.5, color: AppColors.textPrimary),
                          items: indianLanguages.map((l) => DropdownMenuItem(value: l, child: Text(l))).toList(),
                          onChanged: (v) => setState(() => _sourceLang = v!),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 16),
                child: Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.textMuted),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Target Language', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Text(
                        _targetLang,
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.primaryNavy),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // File Picker / Camera Upload
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                AppButton(
                  text: _selectedFileName == null ? 'Upload FIR / Order' : 'Change Document',
                  size: AppButtonSize.small,
                  variant: AppButtonVariant.outline,
                  icon: Icons.document_scanner_rounded,
                  onPressed: _pickFile,
                ),
                const SizedBox(width: 8),
                if (_selectedFileName != null)
                  Expanded(
                    child: Text(
                      _selectedFileName!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.primaryNavy),
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Paste Vernacular Text
          AppTextField(
            label: 'Or Paste Vernacular Text',
            hintText: 'Paste police complaint, FIR, or court decree in $_sourceLang...',
            controller: _textController,
            maxLines: 6,
          ),

          const SizedBox(height: 16),

          // Submit Action
          AppButton(
            text: 'Translate & Map Statutory Sections',
            isFullWidth: true,
            size: AppButtonSize.large,
            icon: Icons.translate_rounded,
            isLoading: _isTranslating,
            onPressed: _isTranslating ? null : _translate,
          ),
        ],
      ),
    );
  }

  Widget _buildResultView() {
    final result = _result!;
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          // Action Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            color: AppColors.surfaceWhite,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Certified Translation', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                AppButton(
                  text: 'New Translation',
                  size: AppButtonSize.small,
                  variant: AppButtonVariant.outline,
                  onPressed: () {
                    setState(() {
                      _result = null;
                      _textController.clear();
                      _selectedFile = null;
                      _selectedFileName = null;
                    });
                  },
                ),
              ],
            ),
          ),

          // Statutory Mapping Banner
          if (result.statutoryMapping.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(10),
              color: AppColors.goldSurface,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Statutory Transition Mapping (IPC/CrPC ➔ BNS/BNSS 2023):',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                  ),
                  const SizedBox(height: 4),
                  ...result.statutoryMapping.map((m) {
                    return Text(
                      '• $m',
                      style: const TextStyle(fontSize: 11, color: AppColors.textPrimary, height: 1.25),
                    );
                  }),
                ],
              ),
            ),

          // Tab Bar
          const TabBar(
            labelColor: AppColors.primaryNavy,
            unselectedLabelColor: AppColors.textMuted,
            indicatorColor: AppColors.primaryNavy,
            labelStyle: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
            tabs: [
              Tab(text: 'Judicial English (Translated)'),
              Tab(text: 'Vernacular Original'),
            ],
          ),

          Expanded(
            child: TabBarView(
              children: [
                // English View
                SingleChildScrollView(
                  padding: const EdgeInsets.all(14),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: SelectableText(
                      result.translatedText,
                      style: const TextStyle(fontSize: 12.5, height: 1.45, color: AppColors.textPrimary),
                    ),
                  ),
                ),
                // Original View
                SingleChildScrollView(
                  padding: const EdgeInsets.all(14),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: SelectableText(
                      result.originalText.isNotEmpty ? result.originalText : '[Uploaded File Content Processed]',
                      style: const TextStyle(fontSize: 12.5, height: 1.45, color: AppColors.textSecondary),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Copy & Share
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            color: AppColors.surfaceWhite,
            child: Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: 'Copy English Text',
                    size: AppButtonSize.small,
                    variant: AppButtonVariant.outline,
                    icon: Icons.copy_rounded,
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: result.translatedText));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Translation copied to clipboard')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: AppButton(
                    text: 'Share',
                    size: AppButtonSize.small,
                    icon: Icons.share_rounded,
                    onPressed: () {
                      SharePlus.instance.share(
                        ShareParams(
                          text: result.translatedText,
                          subject: 'Certified Legal Translation',
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
