import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/course_model.dart';
import '../../data/repositories/academy_repository.dart';

class PaymentBottomSheet extends StatefulWidget {
  final CourseModel course;
  final AcademyRepository repository;
  final VoidCallback? onEnrollmentSuccess;

  const PaymentBottomSheet({
    super.key,
    required this.course,
    required this.repository,
    this.onEnrollmentSuccess,
  });

  static Future<void> show(
    BuildContext context, {
    required CourseModel course,
    required AcademyRepository repository,
    VoidCallback? onEnrollmentSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PaymentBottomSheet(
        course: course,
        repository: repository,
        onEnrollmentSuccess: onEnrollmentSuccess,
      ),
    );
  }

  @override
  State<PaymentBottomSheet> createState() => _PaymentBottomSheetState();
}

class _PaymentBottomSheetState extends State<PaymentBottomSheet> {
  final _couponCtrl = TextEditingController();
  Map<String, dynamic>? _couponData;
  bool _validatingCoupon = false;
  bool _processingPayment = false;
  String? _couponError;

  double get _finalPrice {
    if (_couponData != null) {
      final discount = (_couponData!['discountAmount'] ?? _couponData!['discount'] ?? 0) as num;
      final val = widget.course.price - discount.toDouble();
      return val < 0 ? 0 : val;
    }
    return widget.course.price;
  }

  @override
  void dispose() {
    _couponCtrl.dispose();
    super.dispose();
  }

  Future<void> _validateCoupon() async {
    final code = _couponCtrl.text.trim();
    if (code.isEmpty) return;
    setState(() {
      _validatingCoupon = true;
      _couponError = null;
      _couponData = null;
    });
    final result = await widget.repository.validateCoupon(widget.course.id, code);
    if (mounted) {
      setState(() {
        _validatingCoupon = false;
        if (result != null) {
          _couponData = result;
        } else {
          _couponError = 'Invalid or expired coupon code';
        }
      });
    }
  }

  Future<void> _proceedToPayment() async {
    setState(() => _processingPayment = true);

    if (_finalPrice <= 0) {
      final ok = await widget.repository.enrollInCourse(widget.course.id);
      if (mounted) {
        setState(() => _processingPayment = false);
        Navigator.of(context).pop();
        if (ok) {
          widget.onEnrollmentSuccess?.call();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Enrolled successfully! Start learning.', style: TextStyle(fontSize: 11)),
              backgroundColor: AppColors.primaryNavy,
            ),
          );
        }
      }
      return;
    }

    final order = await widget.repository.createPaymentOrder(
      widget.course.id,
      couponCode: _couponCtrl.text.trim().isNotEmpty ? _couponCtrl.text.trim() : null,
    );

    if (!mounted) return;

    if (order == null) {
      setState(() => _processingPayment = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to create payment order. Try again.', style: TextStyle(fontSize: 11)),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    final orderId = order['id'] ?? order['razorpay_order_id'] ?? order['orderId'] ?? '';
    final razorpayKey = order['key'] ?? order['razorpayKey'] ?? '';
    final amount = order['amount'] ?? (_finalPrice * 100).toInt();

    setState(() => _processingPayment = false);

    if (orderId.toString().isNotEmpty) {
      _showPaymentInstructions(orderId.toString(), razorpayKey.toString(), amount);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Order created. Please proceed to payment.', style: TextStyle(fontSize: 11)),
        ),
      );
    }
  }

  void _showPaymentInstructions(String orderId, String key, dynamic amount) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        contentPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        title: const Row(
          children: [
            Icon(Icons.payment_rounded, size: 18, color: AppColors.primaryNavy),
            SizedBox(width: 8),
            Text('Complete Payment', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Order generated successfully!',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryNavy),
            ),
            const SizedBox(height: 8),
            _infoRow('Order ID', orderId),
            _infoRow('Amount', '₹${_finalPrice.toStringAsFixed(0)}'),
            const SizedBox(height: 10),
            const Text(
              'Tap Pay Now to open secure checkout gateway.',
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.3),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Close', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () async {
              final uri = Uri.parse('https://api.sajjadhusainlawassociates.com/academy/pay/$orderId');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryNavy,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
            ),
            child: const Text('Pay Now', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text('$label: ', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 14,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: AppColors.borderSubtle,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(5),
                child: Image.network(
                  widget.course.thumbnailUrl,
                  width: 52,
                  height: 38,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: 52,
                    height: 38,
                    color: AppColors.primaryNavy.withOpacity(0.1),
                    child: const Icon(Icons.school, size: 20, color: AppColors.primaryNavy),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.course.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryNavy),
                    ),
                    Text(
                      widget.course.instructorName,
                      style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.borderLight),
          const SizedBox(height: 10),

          const Text(
            'Have a coupon?',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 34,
                  child: TextField(
                    controller: _couponCtrl,
                    textCapitalization: TextCapitalization.characters,
                    style: const TextStyle(fontSize: 11.5),
                    decoration: InputDecoration(
                      hintText: 'Enter coupon code',
                      hintStyle: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      filled: true,
                      fillColor: AppColors.surfaceMuted,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(5),
                        borderSide: const BorderSide(color: AppColors.borderLight, width: 0.8),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(5),
                        borderSide: const BorderSide(color: AppColors.borderLight, width: 0.8),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                height: 34,
                child: ElevatedButton(
                  onPressed: _validatingCoupon ? null : _validateCoupon,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.academyIndigo,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                  ),
                  child: Text(
                    _validatingCoupon ? '...' : 'Apply',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          if (_couponError != null) ...[
            const SizedBox(height: 4),
            Text(_couponError!, style: const TextStyle(fontSize: 10, color: AppColors.danger)),
          ],
          if (_couponData != null) ...[
            const SizedBox(height: 4),
            Text(
              '✓ Coupon applied! Saving ₹${(_couponData!['discountAmount'] ?? _couponData!['discount'] ?? 0).toStringAsFixed(0)}',
              style: const TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.w600),
            ),
          ],
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Course Price', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text('₹${widget.course.price.toStringAsFixed(0)}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  ],
                ),
                if (_couponData != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Coupon Discount', style: TextStyle(fontSize: 11, color: AppColors.success)),
                      Text(
                        '-₹${(_couponData!['discountAmount'] ?? _couponData!['discount'] ?? 0).toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
                const Divider(height: 10, color: AppColors.borderLight),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Tuition', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryNavy)),
                    Text(
                      '₹${_finalPrice.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryNavy),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          SizedBox(
            width: double.infinity,
            height: 40,
            child: ElevatedButton.icon(
              onPressed: _processingPayment ? null : _proceedToPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryNavy,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
              icon: Icon(
                _processingPayment ? Icons.hourglass_empty_rounded : Icons.payment_rounded,
                size: 16,
                color: Colors.white,
              ),
              label: Text(
                _processingPayment
                    ? 'Processing...'
                    : (_finalPrice <= 0 ? 'Enroll Free' : 'Proceed to Pay ₹${_finalPrice.toStringAsFixed(0)}'),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
