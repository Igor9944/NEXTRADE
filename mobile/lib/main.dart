import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'core/api_client.dart';
import 'core/token_store.dart';
import 'models/models.dart';
import 'repositories/repositories.dart';
import 'auth/login_screen.dart';
import 'catalog/catalog_screen.dart';
import 'orders/cart_screen.dart';
import 'orders/orders_screen.dart';
import 'shipments/shipments_screen.dart';
import 'session.dart';

void main() {
  runApp(const NexTradeApp());
}

class NexTradeApp extends StatefulWidget {
  const NexTradeApp({super.key, this.tokenStore});

  final TokenStore? tokenStore;

  @override
  State<NexTradeApp> createState() => _NexTradeAppState();
}

class _NexTradeAppState extends State<NexTradeApp> {
  late final TokenStore _tokens;
  late final ApiClient _api;
  late final AuthRepository _auth;
  late final CatalogRepository _catalog;
  late final CartRepository _cart;
  late final OrderRepository _orders;
  late final ShipmentRepository _shipments;
  SessionUser? _user;

  @override
  void initState() {
    super.initState();
    _tokens = widget.tokenStore ?? SecureTokenStore();
    _api = ApiClient(tokenStore: _tokens);
    _auth = AuthRepository(_api, _tokens);
    _catalog = CatalogRepository(_api);
    _cart = CartRepository(_api);
    _orders = OrderRepository(_api);
    _shipments = ShipmentRepository(_api);
  }

  @override
  Widget build(BuildContext context) {
    return SessionScope(
      api: _api,
      auth: _auth,
      catalog: _catalog,
      cart: _cart,
      orders: _orders,
      shipments: _shipments,
      user: _user,
      setUser: (value) => setState(() => _user = value),
      child: MaterialApp(
        title: 'NexTrade',
        theme: ThemeData(colorSchemeSeed: Colors.blue, useMaterial3: true),
        home: _user == null ? const LoginScreen() : const HomeShell(),
      ),
    );
  }
}

class SecureTokenStore implements TokenStore {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  static const _key = 'nextrade_jwt';

  @override
  Future<void> write(String token) => _storage.write(key: _key, value: token);

  @override
  Future<String?> read() => _storage.read(key: _key);

  @override
  Future<void> clear() => _storage.delete(key: _key);
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);
    const pages = [CatalogScreen(), CartScreen(), OrdersScreen(), ShipmentsScreen()];
    return Scaffold(
      appBar: AppBar(
        title: const Text('NexTrade'),
        actions: [
          IconButton(
            tooltip: 'Déconnexion',
            onPressed: () async {
              await session.auth.logout();
              session.setUser(null);
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.storefront_outlined), label: 'Catalogue'),
          NavigationDestination(icon: Icon(Icons.shopping_cart_outlined), label: 'Panier'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Commandes'),
          NavigationDestination(icon: Icon(Icons.local_shipping_outlined), label: 'Suivi'),
        ],
      ),
    );
  }
}
