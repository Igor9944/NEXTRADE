abstract class TokenStore {
  Future<void> write(String token);
  Future<String?> read();
  Future<void> clear();
}

class MemoryTokenStore implements TokenStore {
  String? _token;

  @override
  Future<void> write(String token) async {
    _token = token;
  }

  @override
  Future<String?> read() async => _token;

  @override
  Future<void> clear() async {
    _token = null;
  }
}
