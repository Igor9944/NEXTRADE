class SessionUser {
  SessionUser({required this.id, required this.email, required this.role});

  final String id;
  final String email;
  final String role;

  factory SessionUser.fromJson(Map<String, dynamic> json) {
    return SessionUser(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
    );
  }
}

class CatalogProduct {
  CatalogProduct({
    required this.id,
    required this.nom,
    required this.description,
    required this.categorie,
    required this.price,
    this.stock,
  });

  final String id;
  final String nom;
  final String description;
  final String categorie;
  final String price;
  final num? stock;

  factory CatalogProduct.fromJson(Map<String, dynamic> json) {
    return CatalogProduct(
      id: json['id_product']?.toString() ?? '',
      nom: json['nom']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      categorie: (json['categorie'] ?? json['category'] ?? '').toString(),
      price: (json['effective_price'] ?? json['prix_detail'] ?? '').toString(),
      stock: json['quantite_disponible'] is num ? json['quantite_disponible'] as num : null,
    );
  }
}

class CartItem {
  CartItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.quantity,
    required this.unitPrice,
  });

  final String id;
  final String productId;
  final String name;
  final int quantity;
  final String unitPrice;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id_cart_item']?.toString() ?? '',
      productId: json['id_product']?.toString() ?? '',
      name: (json['productName'] ?? json['nom'] ?? '').toString(),
      quantity: int.tryParse('${json['quantity'] ?? json['quantite'] ?? 0}') ?? 0,
      unitPrice: '${json['unit_price'] ?? json['prix_detail'] ?? ''}',
    );
  }
}

class OrderSummary {
  OrderSummary({
    required this.id,
    required this.amount,
    required this.status,
  });

  final String id;
  final String amount;
  final String status;

  factory OrderSummary.fromJson(Map<String, dynamic> json) {
    return OrderSummary(
      id: json['id_order']?.toString() ?? '',
      amount: '${json['montant_total'] ?? ''}',
      status: json['statut']?.toString() ?? '',
    );
  }
}

class ShipmentSummary {
  ShipmentSummary({
    required this.id,
    required this.reference,
    required this.orderId,
    required this.status,
    this.tracking,
  });

  final String id;
  final String reference;
  final String orderId;
  final String status;
  final String? tracking;

  factory ShipmentSummary.fromJson(Map<String, dynamic> json) {
    return ShipmentSummary(
      id: json['id_shipment']?.toString() ?? '',
      reference: json['reference_shipment']?.toString() ?? '',
      orderId: json['id_order']?.toString() ?? '',
      status: json['statut']?.toString() ?? '',
      tracking: json['numero_suivi']?.toString(),
    );
  }
}

const trackingSteps = [
  'PREPARATION',
  'PRISE_EN_CHARGE',
  'EXPEDIEE',
  'EN_TRANSIT',
  'EN_LIVRAISON',
  'LIVREE',
];

int trackingIndex(String status) {
  final index = trackingSteps.indexOf(status);
  if (index >= 0) {
    return index;
  }
  const extras = {
    'ARRIVEE': 3,
    'ARRIVEE_AGENCE': 3,
    'DOUANE': 3,
    'ECHEC_LIVRAISON': 4,
    'ANNULEE': -1,
  };
  return extras[status] ?? 0;
}
