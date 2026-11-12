import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/compact_app_bar.dart';
import '../../data/models/assessment_model.dart';
import '../../data/repositories/academy_repository.dart';

class AssessmentQuizPage extends StatefulWidget {
  final String courseId;
  final AcademyRepository repository;

  const AssessmentQuizPage({
    super.key,
    required this.courseId,
    required this.repository,
  });

  @override
  State<AssessmentQuizPage> createState() => _AssessmentQuizPageState();
}

class _AssessmentQuizPageState extends State<AssessmentQuizPage> {
  QuizModel? _quiz;
  bool _isLoading = true;
  int _currentQuestionIndex = 0;
  final Map<int, int> _selectedAnswers = {};
  bool _isSubmitted = false;
  int _remainingSeconds = 15 * 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_remainingSeconds > 0 && !_isSubmitted) {
        if (mounted) {
          setState(() => _remainingSeconds--);
        }
      } else {
        _timer?.cancel();
        if (!_isSubmitted) _submitTest();
      }
    });
  }

  Future<void> _loadQuiz() async {
    final quiz = await widget.repository.getCourseQuiz(widget.courseId);
    if (mounted) {
      setState(() {
        _quiz = quiz;
        _isLoading = false;
      });
    }
  }

  void _selectOption(int optionIndex) {
    if (_isSubmitted) return;
    setState(() {
      _selectedAnswers[_currentQuestionIndex] = optionIndex;
    });
  }

  int _calculateScore() {
    if (_quiz == null) return 0;
    int correctCount = 0;
    for (int i = 0; i < _quiz!.questions.length; i++) {
      if (_selectedAnswers[i] == _quiz!.questions[i].correctIndex) {
        correctCount++;
      }
    }
    return correctCount;
  }

  void _submitTest() {
    setState(() => _isSubmitted = true);
    _timer?.cancel();

    final score = _calculateScore();
    final total = _quiz!.questions.length;
    final pct = total > 0 ? (score / total) * 100 : 0;
    final isPassed = pct >= _quiz!.passingScorePercentage;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          contentPadding: const EdgeInsets.all(14),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isPassed
                    ? Icons.verified_rounded
                    : Icons.sentiment_dissatisfied_rounded,
                size: 38,
                color: isPassed ? AppColors.success : AppColors.danger,
              ),
              const SizedBox(height: 8),
              Text(
                isPassed ? 'Assessment Qualified!' : 'Passing Threshold Not Met',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryNavy,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'You scored $score out of $total (${pct.toInt()}%)',
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isPassed ? AppColors.successBg : AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isPassed
                      ? 'Certificate credit has been unlocked for your profile.'
                      : 'You need 70% to qualify for judicial certification. You may retry.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: isPassed ? AppColors.success : AppColors.danger,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 32,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryNavy,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Review Detailed Answers',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textWhite,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatTimer(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        appBar: CompactAppBar(title: 'Loading Assessment...'),
        body: Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      );
    }

    if (_quiz == null) {
      return Scaffold(
        appBar: const CompactAppBar(title: 'Course Assessment'),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.quiz_outlined, size: 36, color: AppColors.textMuted),
              const SizedBox(height: 8),
              const Text(
                'No assessment published for this course yet.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryNavy,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Back to Course', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ),
      );
    }

    final currentQ = _quiz!.questions[_currentQuestionIndex];
    final selectedOption = _selectedAnswers[_currentQuestionIndex];

    return Scaffold(
      appBar: CompactAppBar(
        title: _quiz!.title,
        subtitle: 'Courtroom MCQ Bench Test',
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: _remainingSeconds < 180
                  ? AppColors.dangerBg
                  : AppColors.primarySurface,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.timer_outlined,
                  size: 11,
                  color: _remainingSeconds < 180
                      ? AppColors.danger
                      : AppColors.gold,
                ),
                const SizedBox(width: 3),
                Text(
                  _formatTimer(_remainingSeconds),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: _remainingSeconds < 180
                        ? AppColors.danger
                        : AppColors.gold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.surfaceWhite,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: SizedBox(
              height: 24,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _quiz!.questions.length,
                separatorBuilder: (context, index) => const SizedBox(width: 4),
                itemBuilder: (context, idx) {
                  final isAnswered = _selectedAnswers.containsKey(idx);
                  final isCurrent = idx == _currentQuestionIndex;

                  Color bg = AppColors.surfaceMuted;
                  Color border = AppColors.borderLight;
                  Color text = AppColors.textSecondary;

                  if (isCurrent) {
                    bg = AppColors.primaryNavy;
                    border = AppColors.primaryNavy;
                    text = AppColors.textWhite;
                  } else if (isAnswered) {
                    bg = AppColors.successBg;
                    border = AppColors.successBorder;
                    text = AppColors.success;
                  }

                  return InkWell(
                    onTap: () => setState(() => _currentQuestionIndex = idx),
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(3),
                        border: Border.all(color: border, width: 0.8),
                      ),
                      child: Center(
                        child: Text(
                          '${idx + 1}',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: text,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(10),
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.borderLight, width: 0.8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'QUESTION ${_currentQuestionIndex + 1} OF ${_quiz!.questions.length}',
                            style: const TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMuted,
                              letterSpacing: 0.3,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 1.5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.academyIndigo.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: const Text(
                              'Single Choice',
                              style: TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.academyIndigo,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        currentQ.question,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryNavy,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                ...currentQ.options.asMap().entries.map((entry) {
                  final optIdx = entry.key;
                  final optText = entry.value;
                  final isSelected = selectedOption == optIdx;
                  final isCorrect = currentQ.correctIndex == optIdx;

                  Color cardBg = AppColors.surfaceWhite;
                  Color borderColor = AppColors.borderLight;

                  if (_isSubmitted) {
                    if (isCorrect) {
                      cardBg = AppColors.successBg;
                      borderColor = AppColors.success;
                    } else if (isSelected && !isCorrect) {
                      cardBg = AppColors.dangerBg;
                      borderColor = AppColors.danger;
                    }
                  } else if (isSelected) {
                    cardBg = AppColors.academyIndigo.withOpacity(0.06);
                    borderColor = AppColors.academyIndigo;
                  }

                  return InkWell(
                    onTap: () => _selectOption(optIdx),
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: borderColor, width: 0.8),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 18,
                            height: 18,
                            margin: const EdgeInsets.only(top: 1),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected
                                  ? AppColors.academyIndigo
                                  : Colors.transparent,
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.academyIndigo
                                    : AppColors.borderSubtle,
                                width: 1.2,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                String.fromCharCode(65 + optIdx),
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected
                                      ? AppColors.textWhite
                                      : AppColors.textMuted,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              optText,
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                                color: AppColors.textPrimary,
                                height: 1.25,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),

                if (_isSubmitted) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppColors.borderLight, width: 0.8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(
                              Icons.info_outline_rounded,
                              size: 12,
                              color: AppColors.academyIndigo,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Judicial Ratio & Statutory Explanation',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.academyIndigo,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          currentQ.explanation,
                          style: const TextStyle(
                            fontSize: 10.5,
                            color: AppColors.textSecondary,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: const BoxDecoration(
              color: AppColors.surfaceWhite,
              border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  height: 30,
                  child: OutlinedButton(
                    onPressed: _currentQuestionIndex > 0
                        ? () => setState(() => _currentQuestionIndex--)
                        : null,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      side: const BorderSide(
                        color: AppColors.borderLight,
                        width: 0.8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    child: const Text(
                      'Previous',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ),
                if (!_isSubmitted &&
                    _currentQuestionIndex == _quiz!.questions.length - 1)
                  SizedBox(
                    height: 30,
                    child: ElevatedButton(
                      onPressed: _submitTest,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success,
                        foregroundColor: AppColors.textWhite,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      child: const Text(
                        'Submit Test',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textWhite,
                        ),
                      ),
                    ),
                  )
                else
                  SizedBox(
                    height: 30,
                    child: ElevatedButton(
                      onPressed:
                          _currentQuestionIndex < _quiz!.questions.length - 1
                              ? () => setState(() => _currentQuestionIndex++)
                              : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryNavy,
                        foregroundColor: AppColors.textWhite,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      child: const Text(
                        'Next',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textWhite,
                        ),
                      ),
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

