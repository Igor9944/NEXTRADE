import 'package:flutter/material.dart';

import '../session.dart';
import '../models/models.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  List<CatalogProduct> _items = [];
  String? _error;
  bool _loading = true;
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await SessionScope.of(context).catalog.list(search: _search.text);
      setState(() => _items = items);
    } catch (error) {
      setState(() => _error = error.toString());
      if (mounted) {
        showApiError(context, error);
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _search,
            decoration: InputDecoration(
              labelText: 'Recherche',
              suffixIcon: IconButton(onPressed: _load, icon: const Icon(Icons.search)),
            ),
            onSubmitted: (_) => _load(),
          ),
          const SizedBox(height: 12),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
          ..._items.map(
            (item) => ListTile(
              title: Text(item.nom),
              subtitle: Text('${item.categorie} · ${item.price}'),
              onTap: () => openProduct(context, item.id),
            ),
          ),
        ],
      ),
    );
  }
}
