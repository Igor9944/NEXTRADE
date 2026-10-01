import 'package:flutter/material.dart';

import '../models/models.dart';
import '../session.dart';

class OrderDetailScreen extends StatefulWidget {
  const OrderDetailScreen({super.key, required this.orderId});

  final String orderId;

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  OrderSummary? _order;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        final order = await SessionScope.of(context).orders.getById(widget.orderId);
        setState(() => _order = order);
      } catch (error) {
        if (mounted) {
          showApiError(context, error);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final order = _order;
    return Scaffold(
      appBar: AppBar(title: const Text('Commande')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: order == null
            ? const Text('Chargement…')
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(order.id),
                  Text('Montant : ${order.amount}'),
                  Text('Statut : ${order.status}'),
                ],
              ),
      ),
    );
  }
}
