# Sécurité de NexTrade

## Authentification

### Inscription
Endpoint: `POST /api/v1/auth/register`
- Validation des données d'entrée
- Vérification de l'unicité de l'email
- Hachage sécurisé du mot de passe avec bcryptjs
- Création de l'utilisateur en base de données
- Génération d'un JWT de connexion
- Réponse contenant le token et les informations utilisateur (sans le hash de mot de passe)

### Connexion
Endpoint: `POST /api/v1/auth/login`
- Vérification de l'existence de l'utilisateur par email
- Comparaison sécurisée du mot de passe fourni avec le hash stocké
- Génération d'un JWT en cas de succès
- Réponse contenant le token et les informations utilisateur

### JWT (JSON Web Token)
- Algorithme: HS256
- Contenu du payload:
  - `sub`: ID de l'utilisateur
  - `email`: Email de l'utilisateur
  - `role`: Rôle de l'utilisateur
  - `iat`: Date d'émission
  - `exp`: Date d'expiration (configurable via JWT_EXPIRES_IN)
- Secret stocké dans la variable d'environnement `JWT_SECRET`
- Ne contient jamais: mot de passe, hash de mot de passe, données sensibles

## Autorisation

### Rôles définis
- `ADMIN`: Accès complet au système
- `FOURNISSEUR`: Gestion de leurs produits et commandes
- `CLIENT`: Accès à leur profil et historique de commandes
- `COMMERCANT`: Gestion de leur commerce et ventes
- `TRANSPORTEUR`: Suivi de leurs expéditions assignées

### Middleware d'authentification
- Vérifie la présence du header `Authorization: Bearer <token>`
- Valide la signature et l'expiration du token
- Récupère l'utilisateur depuis la base de données
- Attache l'utilisateur à la requête (`req.user`)

### Middleware d'autorisation
- Factory `requireRole(...)` qui crée un middleware vérifiant les rôles
- Utilisation: `app.use('/api/v1/admin', authMiddleware, requireRole('ADMIN'))`
- Retourne 401 si non authentifié
- Retourne 403 si authentifié mais rôle insuffisant

### Matrix d'accès
| Ressource             | ADMIN | FOURNISSEUR | CLIENT | COMMERCANT | TRANSPORTEUR |
| --------------------- | ----- | ----------- | ------ | ---------- | ------------ |
| Gestion utilisateurs  | ✅     | ❌           | ❌      | ❌          | ❌            |
| Catalogue fournisseur | ✅     | ✅           | Lecture | Lecture    | ❌            |
| Commandes             | ✅     | Selon commande | ✅      | ✅          | Lecture/suivi |
| Expéditions           | ✅     | Selon commande | Lecture | Lecture    | ✅            |
| Administration        | ✅     | ❌           | ❌      | ❌          | ❌            |

## Sécurité des mots de passe

### Politique de mot de passe
- Longueur minimale: 8 caractères
- Complexité requise:
  - Au moins une lettre majuscule
  - Au moins un chiffre
  - Au moins un caractère spécial
- Stockage: Hash bcryptjs avec salt factor 10
- Jamais stocké en clair ou réversible

### Processus de hash
1. Mot de passe en clair reçu
2. Génération d'un salt aléatoire
3. Création du hash avec bcrypt.hash(password, salt)
4. Stockage exclusif du hash en base de données
5. Vérification lors de la connexion avec bcrypt.compare()

## Routes protégées

### Route authentifiée
`GET /api/v1/test/protected`
- Accessible à tout utilisateur possédant un token valide
- Retourne les informations de l'utilisateur connecté

### Routes par rôle
- `GET /api/v1/test/admin` - ADMIN uniquement
- `GET /api/v1/test/commercant` - COMMERCANT uniquement
- `GET /api/v1/test/transporteur` - TRANSPORTEUR uniquement

## Variables d'environnement

### Configuration JWT
```
JWT_SECRET= votre_clé_secrete_ici
JWT_EXPIRES_IN= 1h
```

### Configuration de base de données
```
DB_HOST= localhost
DB_PORT= 5432
DB_NAME= nextrade
DB_USER= neotrade
DB_PASSWORD= votre_mot_de_passe_ici
```

### Autres configurations
```
PORT= 3000
NODE_ENV= development
API_BASE_URL= http://localhost:3000
AI_SERVICE_URL= http://localhost:5000
```

*Note: Ne jamais committer les valeurs réelles de JWT_SECRET et DB_PASSWORD en git.*

## Tests

### Scénarios de test effectués
1. ✅ Inscription réussie
2. ✅ Rejet email dupliqué
3. ✅ Connexion réussie avec identifiants valides
4. ✅ Rejet connexion avec identifiants invalides
5. ✅ Accès route protégée avec token valide
6. ✅ Rejet accès route protégée sans token
7. ✅ Rejet accès route protégée avec token invalide
8. ✅ Accès refusé selon les rôles (403 Forbidden)
9. ✅ Accès autorisé selon les rôles (200 OK)

### Tests à implémenter
- Tests unitaires avec Jest pour:
  - Validation du mot de passe
  - Génération et vérification JWT
  - Fonctionnement des middlewares
  - Contrôle d'accès basé sur les rôles
- Tests d'intégration pour les endpoints API
- Tests de sécurité pour les vulnérabilités courantes

## Bonnes pratiques de sécurité implémentées

1. **Principe du moindre privilège**: Les rôles sont strictement définis
2. **Défense en profondeur**: Plusieurs couches de validation (authentification puis autorisation)
3. **Secret management**: Les secrets ne sont jamais en code source
4. **Password security**: Utilisation de bcrypt adapté au hashage de mots de passe
5. **JWT best practices**: Token court durée, pas de données sensibles dans le payload
6. **Error management**: Messages d'erreur génériques pour éviter l'énumération
7. **Input validation**: Validation des données d'entrée dans les DTOs
8. **HTTP security headers**: Utilisation de Helmet.js
9. **CORS**: Configuration restrictive à adapter selon les besoins frontend
10. **Audit and logging**: Journalisation des événements de sécurité sans exposer de secrets

## Recommandations pour la production

1. Changer JWT_SECRET pour une valeur forte et aléatoire
2. Mettre en place un rate limiting sur les endpoints d'authentification
3. Utiliser HTTPS en production
4. Mettre en place une surveillance des tentatives de connexion échouées
5. Rotater périodiquement les clés de chiffrement
6. Effectuer des tests de pénétration réguliers
7. Maintenir les dépendances à jour
8. Implémenter un système de renouvellement de token (refresh tokens)
9. Ajouter la vérification de la révocation de token si nécessaire
10. Logger les événements de sécurité dans un système dédié