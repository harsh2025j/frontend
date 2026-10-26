import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class CurriculumBuilderPage extends StatefulWidget {
  final String courseTitle;

  const CurriculumBuilderPage({super.key, required this.courseTitle});

  @override
  State<CurriculumBuilderPage> createState() => _CurriculumBuilderPageState();
}

class _CurriculumBuilderPageState extends State<CurriculumBuilderPage> {
  // Modules state
  final List<Map<String, dynamic>> _modules = [
    {
      "id": "mod-1",
      "title": "Module 1: Foundations & Statutory Scheme",
      "items": [
        {"id": "item-1", "title": "Overview of Statutory Amendments", "type": "video", "duration": "24 mins"},
        {"id": "item-2", "title": "Comparative Chart of Old vs New Code", "type": "document", "pages": "12 pages"},
        {"id": "item-3", "title": "Live Interactive Q&A Session", "type": "live", "date": "Every Saturday 6 PM"},
      ],
    },
    {
      "id": "mod-2",
      "title": "Module 2: Drafting Applications & Pleadings",
      "items": [
        {"id": "item-4", "title": "Drafting Bail Application under Section 483", "type": "video", "duration": "35 mins"},
        {"id": "item-5", "title": "Bail Drafting Assignment #1", "type": "assignment", "marks": "50 marks"},
        {"id": "item-6", "title": "Module Practice Quiz", "type": "test", "questions": "20 MCQs"},
        {"id": "item-7", "title": "Course Final Certification Assessment", "type": "final_assessment", "passing": "70%"},
      ],
    },
  ];

  final List<({String label, String type, IconData icon, Color color})> _contentTypes = const [
    (label: "Video Lecture", type: "video", icon: Icons.play_circle_outline, color: AppColors.info),
    (label: "PDF Document", type: "document", icon: Icons.description_outlined, color: AppColors.gold),
    (label: "Live Class", type: "live", icon: Icons.live_tv, color: AppColors.danger),
    (label: "Assignment", type: "assignment", icon: Icons.assignment_outlined, color: AppColors.purple),
    (label: "Quiz / Test", type: "test", icon: Icons.quiz_outlined, color: AppColors.warning),
    (label: "Final Assessment", type: "final_assessment", icon: Icons.military_tech_outlined, color: AppColors.success),
  ];

  void _showAddModuleDialog() {
    final titleController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceWhite,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        title: const Text("Add New Module / Section", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        content: TextField(
          controller: titleController,
          style: const TextStyle(fontSize: 13),
          decoration: const InputDecoration(hintText: "e.g., Module 3: Advanced Trial Strategies"),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: AppColors.textSecondary)),
          ),
          AppButton(
            text: "Create Module",
            size: AppButtonSize.small,
            onPressed: () {
              final text = titleController.text.trim();
              if (text.isNotEmpty) {
                setState(() {
                  _modules.add({
                    "id": "mod-${DateTime.now().millisecondsSinceEpoch}",
                    "title": text,
                    "items": [],
                  });
                });
                Navigator.pop(ctx);
              }
            },
          ),
        ],
      ),
    );
  }

  void _showAddItemDialog(int moduleIndex) {
    final titleController = TextEditingController();
    String selectedType = "video";

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => AlertDialog(
          backgroundColor: AppColors.surfaceWhite,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          title: const Text("Add Curriculum Item", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Select Content Type (6 Types)", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: selectedType,
                decoration: const InputDecoration(),
                items: _contentTypes.map((t) {
                  return DropdownMenuItem(
                    value: t.type,
                    child: Row(
                      children: [
                        Icon(t.icon, size: 16, color: t.color),
                        const SizedBox(width: 8),
                        Text(t.label, style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setModalState(() => selectedType = val);
                },
              ),
              const SizedBox(height: 12),
              const Text("Item Title", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextField(
                controller: titleController,
                style: const TextStyle(fontSize: 13),
                decoration: const InputDecoration(hintText: "e.g., Cross Examination of Forensic Witnesses"),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Cancel", style: TextStyle(color: AppColors.textSecondary)),
            ),
            AppButton(
              text: "Add to Module",
              size: AppButtonSize.small,
              onPressed: () {
                final text = titleController.text.trim();
                if (text.isNotEmpty) {
                  setState(() {
                    (_modules[moduleIndex]['items'] as List).add({
                      "id": "item-${DateTime.now().millisecondsSinceEpoch}",
                      "title": text,
                      "type": selectedType,
                    });
                  });
                  Navigator.pop(ctx);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Curriculum Builder", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            Text(widget.courseTitle, style: const TextStyle(fontSize: 11, color: AppColors.goldLight)),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: AppButton(
              text: "Add Module",
              icon: Icons.add,
              size: AppButtonSize.small,
              onPressed: _showAddModuleDialog,
            ),
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        itemCount: _modules.length,
        separatorBuilder: (ctx, i) => const SizedBox(height: 12),
        itemBuilder: (ctx, modIdx) {
          final module = _modules[modIdx];
          final List items = module['items'] ?? [];

          return Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Module Header
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primarySurface,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Icon(Icons.folder, size: 16, color: AppColors.gold),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          module['title'],
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.textMuted),
                        visualDensity: VisualDensity.compact,
                        onPressed: () {
                          setState(() => _modules.removeAt(modIdx));
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(),

                  // Module Items List
                  if (items.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        "No content items in this module yet. Add video, PDF, or test below.",
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: items.length,
                      separatorBuilder: (ctx, i) => const Divider(),
                      itemBuilder: (ctx, itemIdx) {
                        final item = items[itemIdx];
                        final typeInfo = _contentTypes.firstWhere(
                          (t) => t.type == item['type'],
                          orElse: () => _contentTypes[0],
                        );

                        return ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: typeInfo.color.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Icon(typeInfo.icon, size: 16, color: typeInfo.color),
                          ),
                          title: Text(
                            item['title'],
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                          subtitle: Text(
                            typeInfo.label,
                            style: TextStyle(fontSize: 10, color: typeInfo.color, fontWeight: FontWeight.w500),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                            visualDensity: VisualDensity.compact,
                            onPressed: () {
                              setState(() => items.removeAt(itemIdx));
                            },
                          ),
                        );
                      },
                    ),

                  const SizedBox(height: 8),
                  // Add Item Button inside Module
                  AppButton(
                    text: "Add Content Item",
                    icon: Icons.add_circle_outline,
                    variant: AppButtonVariant.outline,
                    size: AppButtonSize.small,
                    onPressed: () => _showAddItemDialog(modIdx),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
