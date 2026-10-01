import 'package:nextrade_mobile/core/api_exception.dart';
import 'package:nextrade_mobile/models/models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('user message maps HTTP codes', () {
    expect(ApiException(401, 'x').userMessage, contains('invalides'));
    expect(ApiException(403, 'x').userMessage, contains('refusé'));
    expect(ApiException(0, 'x').userMessage, contains('Réseau'));
    expect(ApiException(500, 'x').userMessage, contains('serveur'));
  });

  test('tracking index uses backend statuses', () {
    expect(trackingIndex('PREPARATION'), 0);
    expect(trackingIndex('EN_TRANSIT'), 3);
    expect(trackingIndex('LIVREE'), 5);
    expect(trackingIndex('DOUANE'), 3);
    expect(trackingIndex('ANNULEE'), -1);
  });

  test('catalog product parses API payload', () {
    final product = CatalogProduct.fromJson({
      'id_product': 'p1',
      'nom': 'Cacao',
      'description': 'Lot',
      'categorie': 'Agro',
      'effective_price': '1200.00',
    });
    expect(product.nom, 'Cacao');
    expect(product.price, '1200.00');
  });
}
