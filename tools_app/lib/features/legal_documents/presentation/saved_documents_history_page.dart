import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../data/models/document_chat_model.dart';
import '../data/repositories/documents_repository.dart';

class SavedDocumentsHistoryPage extends StatefulWidget {
  final DocumentsRepository repository;

  const SavedDocumentsHistoryPage({super.key, required this.repository});

  @override
  State<SavedDocumentsHistoryPage> createState() => _SavedDocumentsHistoryPageState();
}

class _SavedDocumentsHistoryPageState extends State<SavedDocumentsHistoryPage> {
  List<SavedLegalDocItem> _savedDocs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    final docs = await widget.repository.fetchSavedDocuments();
    if (mounted) {
      setState(() {
        _savedDocs = docs;
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteDoc(String id, int index) async {
    final ok = await widget.repository.deleteSavedDocument(id);
    if (mounted) {
      if (ok) {
        setState(() {
          _savedDocs.removeAt(index);
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Document deleted')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete document')));
      }
    }
  }

  void _showDocumentDetail(SavedLegalDocItem doc) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.8,
          maxChildSize: 0.95,
          builder: (context, scrollController) {
            return Column(
              children: [
                const SizedBox(height: 8),
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.borderLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(doc.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                            Text(doc.category, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(14),
                    child: SelectableText(
                      doc.content,
                      style: const TextStyle(fontFamily: 'Courier', fontSize: 12, height: 1.45),
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  color: AppColors.surfaceWhite,
                  child: Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          text: 'Copy Deed',
                          size: AppButtonSize.small,
                          variant: AppButtonVariant.outline,
                          icon: Icons.copy_rounded,
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: doc.content));
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deed copied')));
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
                            SharePlus.instance.share(ShareParams(text: doc.content, subject: doc.title));
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: const CompactAppBar(
        title: 'Saved Deeds & Agreements',
        subtitle: 'Contracts Library History',
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(strokeWidth: 2.5))
          : _savedDocs.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.library_books_outlined, size: 48, color: AppColors.textMuted.withValues(alpha: 0.5)),
                      const SizedBox(height: 12),
                      const Text('No saved deeds yet', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      const Text('Deeds generated from Contracts Library will appear here.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _savedDocs.length,
                  itemBuilder: (context, index) {
                    final item = _savedDocs[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.description_outlined, size: 22, color: AppColors.gold),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 2),
                                Text(item.category, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.danger),
                            onPressed: () => _deleteDoc(item.id, index),
                          ),
                          AppButton(
                            text: 'View',
                            size: AppButtonSize.small,
                            variant: AppButtonVariant.outline,
                            onPressed: () => _showDocumentDetail(item),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}

