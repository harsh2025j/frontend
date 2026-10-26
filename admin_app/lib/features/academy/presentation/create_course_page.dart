import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';

class CreateCoursePage extends StatefulWidget {
  const CreateCoursePage({super.key});

  @override
  State<CreateCoursePage> createState() => _CreateCoursePageState();
}

class _CreateCoursePageState extends State<CreateCoursePage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _descController = TextEditingController();

  String _level = "Intermediate";
  bool _isLive = true;
  bool _hasCertificate = true;

  @override
  void dispose() {
    _titleController.dispose();
    _priceController.dispose();
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: const Text("Create Academy Course", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: AppButton(
              text: "Save Course",
              size: AppButtonSize.small,
              onPressed: () {
                if (_formKey.currentState?.validate() ?? false) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Course Created Successfully!")),
                  );
                  Navigator.pop(context);
                }
              },
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Course Title *", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _titleController,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(hintText: "e.g., Bharatiya Nagarik Suraksha Sanhita (BNSS) Mastery"),
                        validator: (v) => v == null || v.isEmpty ? "Title required" : null,
                      ),
                      const SizedBox(height: 10),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("Difficulty Level", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 6),
                                DropdownButtonFormField<String>(
                                  initialValue: _level,
                                  decoration: const InputDecoration(),
                                  style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                                  items: ["Beginner", "Intermediate", "Advanced", "Expert"].map((l) {
                                    return DropdownMenuItem(value: l, child: Text(l));
                                  }).toList(),
                                  onChanged: (v) => setState(() => _level = v ?? _level),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("Price (INR) *", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: _priceController,
                                  keyboardType: TextInputType.number,
                                  style: const TextStyle(fontSize: 13),
                                  decoration: const InputDecoration(hintText: "4999"),
                                  validator: (v) => v == null || v.isEmpty ? "Price required" : null,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      SwitchListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: const Text("Live Interactive Classes", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        value: _isLive,
                        onChanged: (v) => setState(() => _isLive = v),
                      ),
                      const Divider(height: 10),
                      SwitchListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: const Text("Certificate of Completion", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        value: _hasCertificate,
                        onChanged: (v) => setState(() => _hasCertificate = v),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Course Description", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _descController,
                        maxLines: 5,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: "Detailed overview of learning objectives, curriculum syllabus, and live sessions...",
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
