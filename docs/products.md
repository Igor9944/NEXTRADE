# Produits, catalogue et tarifs

## Vue d’ensemble

Le module backend produit s’appuie sur les tables et routes déjà présentes dans NexTrade. L’API expose actuellement les points d’entrée suivants :

- `POST /api/v1/products` : création d’un produit par un fournisseur ou un administrateur
- `GET /api/v1/products/:id` : lecture d’un produit en fonction du profil
- `GET /api/v1/products/catalog` : catalogue avec recherche et filtres
- `POST /api/v1/categories` : création d’une catégorie par un administrateur
- `GET /api/v1/categories` : liste paginée des catégories

## Modèle de données

Le schéma existant utilisé par le code est compatible avec des champs legacy tels que :

- `id_product`
- `id_fournisseur`
- `nom`
- `description`
- `categorie`
- `prix_detail`
- `prix_gros`

La relation produit → catégorie est gérée via la table `product_categories` avec une clé étrangère vers `products` et `categories`.

## Règles de tarification

Le service applique l’algorithme suivant :

- `CLIENT` : prix de détail
- `COMMERCANT` / autres profils non spécifiques : prix de gros si disponible dans le contexte métier, sinon prix de détail selon la logique courante

Le code protège la couche API en n’exposant pas un prix non autorisé. La logique de calcul est centralisée dans le service de produit.

## Recherche et filtres

L’endpoint de catalogue accepte les filtres suivants :

- `search`
- `category`
- `minPrice`
- `maxPrice`
- `page`
- `limit`

Le catalogue retourne un payload structuré avec :

- `data`
- `pagination.page`
- `pagination.limit`
- `pagination.total`
- `pagination.totalPages`

## Permissions

- Administrateurs : création de catégories, gestion du catalogue
- Fournisseurs : création de leurs propres produits
- Clients / profils non autorisés : consultation du catalogue uniquement

## Vérification

Les tests réels PostgreSQL-backed présents dans le dépôt couvrent :

- création de catégorie
- création de produit et association de catégorie
- catalogue selon le profil
- recherche et filtres
- résolution d’un produit par identifiant

## Limites connues

Cette mission couvre le cœur du catalogue produit et de la tarification backend. Les écrans frontend complets ainsi que les endpoints de mise à jour/suppression détaillés ne sont pas encore rendus comme interface utilisateur complète dans le dépôt actuel.
