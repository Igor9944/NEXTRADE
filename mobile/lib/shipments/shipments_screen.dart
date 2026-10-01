import 'package:flutter/material.dart';

import '../models/models.dart';
import '../session.dart';

class ShipmentsScreen extends StatefulWidget {
  const ShipmentsScreen({super.key});

  @override
  State<ShipmentsScreen> createState() => _ShipmentsScreenState();
}

class _ShipmentsScreenState extends State<ShipmentsScreen> {
  List<ShipmentSummary> _items = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final items = await SessionScope.of(context).shipments.listMine();
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
                title: Text(item.reference),
                subtitle: Text(item.status),
                onTap: () => openShipment(context, item.id),
              ),
            )
            .toList(),
      ),
    );
  }
}
