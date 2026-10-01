# Faisabilité mission finale (audit réel)

## FAISABILITÉ GLOBALE

**PARTIELLE**

Flutter SDK n’était **pas** installé (`flutter: command not found`). Un clone `stable` a été lancé vers `$HOME/.local/flutter` ; tant que `flutter doctor` n’est pas exécutable, **aucun APK / flutter test n’est revendiqué**.

Le backend, PostgreSQL, le web et l’IA sont fonctionnels en local.

## Tableau

| Domaine | Existant | Fonctionnel | Réutilisable | Manquant | Faisabilité |
| --- | --- | --- | --- | --- | --- |
| Flutter | stub `mobile/` puis app réelle (code) | SDK machine | API | SDK/émulateur | PARTIEL |
| Auth | API JWT | oui | oui | — | OUI |
| Catalogue | GET `/products/catalog` | oui | oui | pages web ajoutées | OUI |
| Commandes | panier + POST orders | oui | oui | — | OUI |
| Suivi | `/shipments/my` | oui | statuts backend | — | OUI |
| API | Express | `/health` 200 | — | — | OUI |
| PostgreSQL | nextrade | SELECT NOW | seeds | — | OUI |
| Tests | jest/pytest | partiels | — | flutter test si SDK | PARTIEL |
| Sécurité | JWT, rôles, IDOR orders | 403 CLIENT B | — | HTTPS prod | OUI local |
| Déploiement | docker db+mailpit | local | — | cloud | NON cloud |

## BLOQUANTS

- Flutter SDK / Android SDK absents au départ → pas de `flutter build apk` exécuté.
- Déploiement production/demo distant : **NON DÉPLOYÉ**.

## RISQUES

IA locale non LLM ; PDF arabe RTL absent ; paiement sandbox.

## PLAN

1. Code mobile branché sur l’API existante (fait).
2. Pages web catalogue/commandes (fait).
3. Docs soutenance (fait).
4. `flutter pub get && flutter test` dès que le SDK est utilisable.
