import 'package:flutter/material.dart';

import '../models/models.dart';
import '../session.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<OrderSummary> _items = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final items = await SessionScope.of(context).orders.list();
      setState(() => _items = items);
    } catch (error) {
      if (mounted) {
        showApiError(context, error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: _items
            .map(
              (item) => ListTile(
                title: Text(item.amount),
                subtitle: Text(item.status),
                onTap: () => openOrder(context, item.id),
              ),
            )
            .toList(),
      ),
    );
  }
}
