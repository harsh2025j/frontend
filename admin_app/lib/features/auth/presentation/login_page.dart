import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import 'bloc/auth_bloc.dart';
import '../../dashboard/main_navigation_shell.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
            LoginSubmitted(
              email: _emailController.text,
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              color: AppColors.surfaceWhite,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: AppColors.borderLight),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Badge
                      Align(
                        alignment: Alignment.center,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.goldSurface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.goldLight),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.shield_outlined, size: 14, color: AppColors.goldDark),
                              SizedBox(width: 4),
                              Text(
                                "ADMIN CONSOLE",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.goldDark,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Title
                      const Text(
                        "Sajjad Husain Law Associates",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        "Sign in to access admin management portal",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 24),

                      // Error & Success Auth Listener
                      BlocConsumer<AuthBloc, AuthState>(
                        listener: (context, state) {
                          if (state is Authenticated) {
                            Navigator.of(context).pushReplacement(
                              MaterialPageRoute(
                                builder: (_) => MainNavigationShell(
                                  adminName: state.name,
                                  adminRole: state.role,
                                ),
                              ),
                            );
                          }
                        },
                        builder: (context, state) {
                          if (state is AuthFailure) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.dangerBg,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppColors.dangerBorder),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.error_outline, size: 16, color: AppColors.danger),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      state.error,
                                      style: const TextStyle(fontSize: 12, color: AppColors.danger),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),

                      // Email Field
                      const Text(
                        "Email Address",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: "admin@sajjadhusainlaw.com",
                          prefixIcon: Icon(Icons.email_outlined, size: 18, color: AppColors.textMuted),
                        ),
                        validator: (val) => val == null || !val.contains('@') ? "Enter a valid email" : null,
                      ),
                      const SizedBox(height: 16),

                      // Password Field
                      const Text(
                        "Password",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        style: const TextStyle(fontSize: 13),
                        decoration: InputDecoration(
                          hintText: "••••••••",
                          prefixIcon: const Icon(Icons.lock_outline, size: 18, color: AppColors.textMuted),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                              size: 18,
                              color: AppColors.textMuted,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        validator: (val) => (val?.length ?? 0) < 6 ? "Password must be at least 6 characters" : null,
                      ),
                      const SizedBox(height: 22),

                      // Submit Button
                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, state) {
                          return AppButton(
                            text: "Log In to Admin",
                            isLoading: state is AuthLoading,
                            isFullWidth: true,
                            onPressed: state is AuthLoading ? null : _submit,
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
