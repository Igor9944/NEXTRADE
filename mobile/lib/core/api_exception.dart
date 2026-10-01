class ApiException implements Exception {
  ApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;

  String get userMessage {
    switch (statusCode) {
      case 401:
        return 'Session expirée ou identifiants invalides.';
      case 403:
        return 'Accès refusé.';
      case 404:
        return 'Ressource introuvable.';
      case 409:
        return 'Conflit. Réessayez.';
      case 422:
        return 'Données invalides.';
      case 0:
        return 'Réseau indisponible. Vérifiez la connexion.';
      default:
        if (statusCode >= 500) {
          return 'Le serveur est indisponible.';
        }
        return message;
    }
  }

  @override
  String toString() => 'ApiException($statusCode, $message)';
}
