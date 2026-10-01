import '../core/api_client.dart';
import '../core/token_store.dart';
import '../models/models.dart';

class AuthRepository {
  AuthRepository(this._api, this._tokens);

  final ApiClient _api;
  final TokenStore _tokens;

  Future<SessionUser> login(String email, String password) async {
    final payload = await _api.post(
      '/api/v1/auth/login',
      auth: false,
      body: {'email': email.trim(), 'password': password},
    ) as Map<String, dynamic>;
    final token = payload['accessToken']?.toString() ?? '';
    if (token.isEmpty) {
      throw StateError('Token manquant');
    }
    await _tokens.write(token);
    return SessionUser.fromJson(Map<String, dynamic>.from(payload['user'] as Map));
  }

  Future<void> logout() => _tokens.clear();
}

class CatalogRepository {
  CatalogRepository(this._api);
  final ApiClient _api;

  Future<List<CatalogProduct>> list({String search = ''}) async {
    final query = search.isEmpty ? '' : '&search=${Uri.encodeQueryComponent(search)}';
    final payload = await _api.get('/api/v1/products/catalog?limit=50$query', auth: false) as Map<String, dynamic>;
    final rows = payload['data'];
    if (rows is! List) {
      return [];
    }
    return rows.map((row) => CatalogProduct.fromJson(Map<String, dynamic>.from(row as Map))).toList();
  }

  Future<CatalogProduct> getById(String id) async {
    final payload = await _api.get('/api/v1/products/$id', auth: false) as Map<String, dynamic>;
    return CatalogProduct.fromJson(Map<String, dynamic>.from(payload['data'] as Map));
  }
}

class CartRepository {
  CartRepository(this._api);
  final ApiClient _api;

  Future<Map<String, dynamic>> getCart() async {
    final payload = await _api.get('/api/v1/cart') as Map<String, dynamic>;
    return Map<String, dynamic>.from(payload['data'] as Map);
  }

  Future<void> add(String productId, int quantity) async {
    await _api.post('/api/v1/cart/items', body: {'productId': productId, 'quantity': quantity});
  }

  Future<Map<String, dynamic>> checkout(String address) async {
    final payload = await _api.post('/api/v1/orders', body: {'adresse_livraison': address}) as Map<String, dynamic>;
    return Map<String, dynamic>.from(payload['data'] as Map);
  }
}

class OrderRepository {
  OrderRepository(this._api);
  final ApiClient _api;

  Future<List<OrderSummary>> list() async {
    final payload = await _api.get('/api/v1/orders') as Map<String, dynamic>;
    final rows = payload['data'];
    if (rows is! List) {
      return [];
    }
    return rows.map((row) => OrderSummary.fromJson(Map<String, dynamic>.from(row as Map))).toList();
  }

  Future<OrderSummary> getById(String id) async {
    final payload = await _api.get('/api/v1/orders/$id') as Map<String, dynamic>;
    return OrderSummary.fromJson(Map<String, dynamic>.from(payload['data'] as Map));
  }
}

class ShipmentRepository {
  ShipmentRepository(this._api);
  final ApiClient _api;

  Future<List<ShipmentSummary>> listMine() async {
    final payload = await _api.get('/api/v1/shipments/my') as Map<String, dynamic>;
    final data = payload['data'] as Map<String, dynamic>;
    final rows = data['shipments'];
    if (rows is! List) {
      return [];
    }
    return rows.map((row) => ShipmentSummary.fromJson(Map<String, dynamic>.from(row as Map))).toList();
  }

  Future<Map<String, dynamic>> getById(String id) async {
    final payload = await _api.get('/api/v1/shipments/$id') as Map<String, dynamic>;
    return Map<String, dynamic>.from(payload['data'] as Map);
  }
}
