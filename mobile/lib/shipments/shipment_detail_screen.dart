import 'package:flutter/material.dart';

import '../models/models.dart';
import '../session.dart';

class ShipmentDetailScreen extends StatefulWidget {
  const ShipmentDetailScreen({super.key, required this.shipmentId});

  final String shipmentId;

  @override
  State<ShipmentDetailScreen> createState() => _ShipmentDetailScreenState();
}

class _ShipmentDetailScreenState extends State<ShipmentDetailScreen> {
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        final data = await SessionScope.of(context).shipments.getById(widget.shipmentId);
        setState(() => _data = data);
      } catch (error) {
        if (mounted) {
          showApiError(context, error);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final shipment = _data?['shipment'] as Map<String, dynamic>?;
    final status = shipment?['statut']?.toString() ?? '';
    final current = trackingIndex(status);
    return Scaffold(
      appBar: AppBar(title: Text(shipment?['reference_shipment']?.toString() ?? 'Suivi')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: shipment == null
            ? const Text('Chargement…')
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Commande : ${shipment['id_order']}'),
                  Text('Statut : $status'),
                  Text('Suivi : ${shipment['numero_suivi'] ?? '—'}'),
                  const SizedBox(height: 16),
                  ...trackingSteps.asMap().entries.map((entry) {
                    final done = current >= entry.key && current >= 0;
                    return ListTile(
                      leading: Icon(done ? Icons.check_circle : Icons.radio_button_unchecked),
                      title: Text(entry.value),
                    );
                  }),
                ],
              ),
      ),
    );
  }
}
