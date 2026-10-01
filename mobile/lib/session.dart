import 'package:flutter/material.dart';

import 'core/api_client.dart';
import 'core/api_exception.dart';
import 'models/models.dart';
import 'repositories/repositories.dart';
import 'catalog/product_screen.dart';
import 'orders/order_detail_screen.dart';
import 'shipments/shipment_detail_screen.dart';

class SessionScope extends InheritedWidget {
  const SessionScope({
    super.key,
    required this.api,
    required this.auth,
    required this.catalog,
    required this.cart,
    required this.orders,
    required this.shipments,
    required this.user,
    required this.setUser,
    required super.child,
  });

  final ApiClient api;
  final AuthRepository auth;
  final CatalogRepository catalog;
  final CartRepository cart;
  final OrderRepository orders;
  final ShipmentRepository shipments;
  final SessionUser? user;
  final void Function(SessionUser?) setUser;

  static SessionScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<SessionScope>();
    if (scope == null) {
      throw StateError('SessionScope missing');
    }
    return scope;
  }

  @override
  bool updateShouldNotify(SessionScope oldWidget) => user != oldWidget.user;
}

void showApiError(BuildContext context, Object error) {
  final text = error is ApiException ? error.userMessage : 'Une erreur est survenue.';
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
}

Future<void> openProduct(BuildContext context, String id) {
  return Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProductScreen(productId: id)));
}

Future<void> openOrder(BuildContext context, String id) {
  return Navigator.of(context).push(MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: id)));
}

Future<void> openShipment(BuildContext context, String id) {
  return Navigator.of(context).push(MaterialPageRoute(builder: (_) => ShipmentDetailScreen(shipmentId: id)));
}
