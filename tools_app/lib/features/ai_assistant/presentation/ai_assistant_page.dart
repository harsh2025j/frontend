import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';

class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}

class AIAssistantPage extends StatefulWidget {
  final ApiClient apiClient;

  const AIAssistantPage({super.key, required this.apiClient});

  @override
  State<AIAssistantPage> createState() => _AIAssistantPageState();
}

class _AIAssistantPageState extends State<AIAssistantPage> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;

  static const List<String> exampleQueries = [
    'What are the grounds for divorce in India?',
    'How to file a consumer complaint?',
    'Explain Section 498A of IPC & BNS equivalent',
    'What are tenant eviction rights in India?',
    'Anticipatory bail requirements under Section 438 CrPC / 482 BNSS',
  ];

  @override
  void initState() {
    super.initState();
    _messages.add(
      ChatMessage(
        id: '1',
        text: 'Namaste! I am your AI Legal Assistant. You can ask me any legal query regarding Indian courts, statutes (BNS, BNSS, CPC, CrPC), consumer rights, matrimonial laws, or property matters.',
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String query) async {
    final text = query.trim();
    if (text.isEmpty) return;

    _textController.clear();
    setState(() {
      _messages.add(
        ChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          text: text,
          isUser: true,
          timestamp: DateTime.now(),
        ),
      );
      _isTyping = true;
    });
    _scrollToBottom();

    // Check for conversational / greeting queries first
    final q = text.toLowerCase().trim();
    final bool isCasual = q == 'hi' ||
        q == 'hello' ||
        q == 'hey' ||
        q == 'namaste' ||
        q == 'kya kr rhe ho' ||
        q == 'kya kar rahe ho' ||
        q == 'kaise ho' ||
        q.startsWith('hi ') ||
        q.startsWith('hello ') ||
        q.length < 4;

    if (isCasual) {
      await Future.delayed(const Duration(milliseconds: 400));
      _addAssistantReply(_generateLegalGuidance(text));
      return;
    }

    // Try research endpoint only for actual legal questions
    try {
      final response = await widget.apiClient.dio.post(
        'tools/research',
        data: {'query': text},
      ).timeout(const Duration(seconds: 15));

      final data = response.data;
      String? precedentRatio;
      if (data is Map<String, dynamic>) {
        final payload = data['data'] ?? data;
        final list = (payload is Map && payload['precedents'] is List)
            ? payload['precedents']
            : (payload is List ? payload : null);
        if (list != null && list.isNotEmpty) {
          final first = list[0];
          final title = first['title'] ?? first['case_name'] ?? 'Relevant Landmark Precedent';
          final citation = first['citation'] ?? '';
          final ratio = first['ratio_decidendi'] ?? first['ratio'] ?? first['summary'] ?? '';
          if (ratio.toString().trim().isNotEmpty) {
            precedentRatio = 'Relevant Judicial Precedent:\n• $title ($citation)\n\nRatio:\n$ratio\n\n---';
          }
        }
      }

      final guidance = _generateLegalGuidance(text);
      final finalReply = precedentRatio != null ? '$precedentRatio\n\n$guidance' : guidance;
      _addAssistantReply(finalReply);
    } catch (_) {
      await Future.delayed(const Duration(milliseconds: 500));
      _addAssistantReply(_generateLegalGuidance(text));
    }
  }

  void _addAssistantReply(String text) {
    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add(
          ChatMessage(
            id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
            text: text,
            isUser: false,
            timestamp: DateTime.now(),
          ),
        );
      });
      _scrollToBottom();
    }
  }

  String _generateLegalGuidance(String query) {
    final q = query.toLowerCase().trim();

    // Friendly greetings & short conversational prompts
    if (q == 'hi' ||
        q == 'hello' ||
        q == 'hey' ||
        q == 'namaste' ||
        q == 'kaise ho' ||
        q == 'kya kr rhe ho' ||
        q == 'kya kar rahe ho' ||
        q.startsWith('hi ') ||
        q.startsWith('hello ')) {
      if (q.contains('kya kr rhe ho') || q.contains('kya kar rahe ho')) {
        return 'Main aapka AI Legal Assistant hoon! Main aapke legal sawaalon, Court procedures, statutes aur acts ko samajhne me madad karne ke liye ready hoon. Aap koi bhi legal query pooch sakte hain.';
      }
      return 'Hello! How can I assist you today? You can ask me any legal query regarding Indian courts, acts, petitions, bail, consumer disputes, property laws, or matrimonial matters.';
    }

    if (q.contains('rule') || q.contains('rul') || q.contains('law') || q.contains('act')) {
      if (q.contains('court') || q.contains('high court') || q.contains('supreme court')) {
        return '''Court Rules in India:
• Supreme Court Rules, 2013: Governs practice, procedure, filing of Special Leave Petitions (SLPs under Art. 136), Writs (Art. 32), Review, and Curative Petitions.
• High Court Rules: Each High Court frames its original and appellate side rules under Article 225 of the Constitution.
• CPC Rules (Code of Civil Procedure, 1908): 51 Orders detailing summons, written statements, interim injunctions (Order 39), and execution.''';
      }
    }

    if (q.contains('article') || q.contains('artical') || q.contains('sanvidhan') || q.contains('constitution')) {
      return '''Key Articles of the Constitution of India:
• Article 14: Right to Equality before Law.
• Article 19: Freedom of Speech, Expression, Peaceful Assembly, and Profession.
• Article 21: Protection of Life and Personal Liberty (includes Right to Privacy, Speedy Trial, and Clean Environment).
• Article 32: Constitutional Remedies for enforcement of Fundamental Rights before the Supreme Court.
• Article 226: Power of High Courts to issue Writs (Habeas Corpus, Mandamus, Prohibition, Quo Warranto, Certiorari).''';
    }

    if (q.contains('bail') || q.contains('anticipatory')) {
      return '''Bail Provisions in India:
1. Anticipatory Bail: Section 438 CrPC (now Section 482 BNSS 2023) - protection before arrest on apprehension of non-bailable accusation.
2. Regular Bail: Section 437/439 CrPC (now Section 480/483 BNSS 2023) - granted post-arrest.
3. Default / Statutory Bail: Section 167(2) CrPC (now Section 187 BNSS 2023) - indefeasible right if investigation not completed within 60 or 90 days.''';
    }

    if (q.contains('divorce')) {
      return '''Under the Hindu Marriage Act, 1955 (Section 13) and Special Marriage Act, 1954:
1. Mutual Consent: Filed under Section 13B with 6-month statutory cooling-off period (which can be waived per Supreme Court judgment in Amardeep Singh v. Harveen Kaur).
2. Contested Grounds: Cruelty (physical/mental), Desertion (uninterrupted for min 2 years), Adultery, Conversion, Incurable mental disorder.
3. Maintenance & Alimony: Determined under Section 24 (interim) and Section 25 (permanent) considering spouse status and income capacity.''';
    } else if (q.contains('consumer')) {
      return '''Under the Consumer Protection Act, 2019:
1. Pecuniary Jurisdiction:
   • District Commission: Claims up to ₹50 Lakhs
   • State Commission: Claims ₹50 Lakhs to ₹2 Crores
   • National Commission (NCDRC): Claims exceeding ₹2 Crores
2. Filing: Can be filed online via the e-Daakhil portal (edaakhil.nic.in).
3. Limitation Period: 2 years from the date on which the cause of action arose (Section 69).''';
    } else if (q.contains('498a') || q.contains('bns')) {
      return '''Section 498A IPC (Matrimonial Cruelty) Transition:
• Under the new Bharatiya Nyaya Sanhita, 2023 (BNS), Section 498A is transitioned to Section 85 (Cruelty by husband or relatives) & Section 86 (Cruelty defined).
• Procedural Safeguards: Supreme Court directives in Arnesh Kumar v. State of Bihar & Social Action Forum mandate strict Section 41A CrPC (now Section 35 BNSS) notice prior to mechanical arrest.''';
    } else if (q.contains('tenant') || q.contains('rent')) {
      return '''Tenant Eviction & Rights in India:
1. Model Tenancy Act, 2021 & State Rent Control Acts govern leases and tenancies.
2. Lawful Grounds for Eviction: Failure to pay agreed rent for 2 consecutive months, structural misuse without consent, bona fide requirement by the landlord for self-residence.
3. Mandatory Procedure: Service of formal 15 to 30-day legal notice under Section 106 of Transfer of Property Act, 1882 before filing eviction proceedings.''';
    } else {
      return 'I have noted your query: "$query". Please specify the particular legal section, act, dispute type, or relief you are looking for so I can assist you with precise legal provisions.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: CompactAppBar(
        title: 'AI Legal Assistant',
        subtitle: 'Indian Law • 24/7 Precision Advice',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20),
            tooltip: 'New Chat',
            onPressed: () {
              setState(() {
                _messages.clear();
                _messages.add(
                  ChatMessage(
                    id: '1',
                    text: 'Chat cleared. How can I assist you with Indian law or legal procedures today?',
                    isUser: false,
                    timestamp: DateTime.now(),
                  ),
                );
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Prompt suggestions
          if (_messages.length <= 1)
            Container(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 8),
              color: AppColors.surfaceWhite,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Common Legal Queries', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: exampleQueries.map((ex) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ActionChip(
                            label: Text(ex, style: const TextStyle(fontSize: 11.5, color: AppColors.primaryNavy, fontWeight: FontWeight.w500)),
                            backgroundColor: AppColors.surfaceMuted,
                            side: const BorderSide(color: AppColors.borderLight),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            onPressed: () => _sendMessage(ex),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),

          const Divider(height: 1),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(14),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          if (_isTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              alignment: Alignment.centerLeft,
              child: const Row(
                children: [
                  SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                  SizedBox(width: 8),
                  Text('Legal Copilot analyzing statutes...', style: TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
                ],
              ),
            ),

          const Divider(height: 1),

          // Input Box
          Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
            color: AppColors.surfaceWhite,
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      child: TextField(
                        controller: _textController,
                        onSubmitted: _sendMessage,
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Ask any legal question...',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => _sendMessage(_textController.text),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: AppColors.primaryNavy,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.send_rounded, size: 18, color: AppColors.textWhite),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: msg.isUser ? AppColors.primaryNavy : AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: msg.isUser ? AppColors.primaryNavy : AppColors.borderLight,
          ),
          boxShadow: [
            if (!msg.isUser)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!msg.isUser)
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.scale_rounded, size: 13, color: AppColors.gold),
                  SizedBox(width: 4),
                  Text('Legal AI Counsel', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldDark)),
                ],
              ),
            if (!msg.isUser) const SizedBox(height: 4),
            SelectableText(
              msg.text,
              style: TextStyle(
                fontSize: 12.5,
                height: 1.4,
                color: msg.isUser ? AppColors.textWhite : AppColors.textPrimary,
              ),
            ),
            if (!msg.isUser) ...[
              const SizedBox(height: 6),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: msg.text));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard')));
                },
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.copy_rounded, size: 11, color: AppColors.textMuted),
                    SizedBox(width: 3),
                    Text('Copy', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
