import 'package:flutter_test/flutter_test.dart';
import 'package:tools_app/core/network/api_client.dart';
import 'package:tools_app/core/services/storage_service.dart';
import 'package:tools_app/main.dart';

void main() {
  testWidgets('ToolsApp initializes properly', (WidgetTester tester) async {
    final storageService = StorageService();
    final apiClient = ApiClient(storageService: storageService);

    await tester.pumpWidget(ToolsApp(apiClient: apiClient));
    expect(find.byType(ToolsApp), findsOneWidget);
  });
}
