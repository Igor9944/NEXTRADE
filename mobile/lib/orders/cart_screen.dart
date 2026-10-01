import 'package:flutter/material.dart';

import '../models/models.dart';
import '../session.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartItem> _items = [];
  String _total = '0.00';
  String? _error;
  final _address = TextEditingController(text: 'Lome');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _address.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final cart = await SessionScope.of(context).cart.getCart();
      final rows = cart['items'];
      setState(() {
        _total = '${cart['total'] ?? '0.00'}';
        _items = rows is List
            ? rows.map((row) => CartItem.fromJson(Map<String, dynamic>.from(row as Map))).toList()
            : [];
        _error = null;
      });
    } catch (error) {
      setState(() => _error = error.toString());
      if (mounted) {
        showApiError(context, error);
      }
    }
  }

  Future<void> _checkout() async {
    try {
      final order = await SessionScope.of(context).cart.checkout(_address.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Commande ${order['id_order']} · ${order['montant_total']}')),
        );
        await _load();
      }
    } catch (error) {
      if (mounted) {
        showApiError(context, error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
        ..._items.map((item) => ListTile(title: Text(item.name), subtitle: Text('x${item.quantity} · ${item.unitPrice}'))),
        Text('Total serveur : $_total', style: const TextStyle(fontWeight: FontWeight.bold)),
        TextField(controller: _address, decoration: const InputDecoration(labelText: 'Adresse de livraison')),
        const SizedBox(height: 12),
        FilledButton(onPressed: _items.isEmpty ? null : _checkout, child: const Text('Passer commande')),
      ],
    );
  }
}
