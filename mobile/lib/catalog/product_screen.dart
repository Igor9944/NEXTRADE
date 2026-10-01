import 'package:flutter/material.dart';

import '../session.dart';
import '../models/models.dart';

class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.productId});

  final String productId;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  CatalogProduct? _product;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    try {
      final product = await SessionScope.of(context).catalog.getById(widget.productId);
      setState(() => _product = product);
    } catch (error) {
      setState(() => _error = error.toString());
      if (mounted) {
        showApiError(context, error);
      }
    }
  }

  Future<void> _add() async {
    try {
      await SessionScope.of(context).cart.add(widget.productId, 1);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ajouté au panier')));
      }
    } catch (error) {
      if (mounted) {
        showApiError(context, error);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = _product;
    return Scaffold(
      appBar: AppBar(title: Text(product?.nom ?? 'Produit')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: product == null
            ? Text(_error ?? 'Chargement…')
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.description.isEmpty ? 'Sans description' : product.description),
                  const SizedBox(height: 8),
                  Text('Catégorie : ${product.categorie}'),
                  Text('Prix : ${product.price}'),
                  if (product.stock != null) Text('Stock : ${product.stock}'),
                  const Spacer(),
                  FilledButton(onPressed: _add, child: const Text('Ajouter au panier')),
                ],
              ),
      ),
    );
  }
}
