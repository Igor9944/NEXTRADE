# Service IA NexTrade

## Architecture

```text
Frontend → POST /api/v1/ai/chat (JWT) → Backend (filtre rôle/secrets) → Python Flask /chat → assistant local
```

Aucune clé IA n’est exposée au frontend.

## Provider

- **local** (défaut) : assistant métier déterministe, FR/EN/AR, à partir de prompts + contexte filtré.
- **openai_compatible** : optionnel si `AI_API_KEY` et `AI_API_URL` existent. Non utilisé sans credentials.

Il n’y a pas d’Ollama / OpenAI configuré dans cet environnement. Ne pas prétendre qu’un LLM cloud répond.

## Endpoints

- Python : `GET /health`, `POST /chat`
- Backend : `POST /api/v1/ai/chat`

## Prompts

Réponse utilisateur = réponse courte selon l’intention + aide de module (`support`, `orders`, `documents`, `import-export`, `shipments`, `analytics`, `payments`) + indicateurs admin filtrés + limites. Le prompt `SYSTEM` n’est utilisé que si un LLM compatible OpenAI est branché.

## Interdits

Secrets, JWT, modification de transaction, données d’un autre client. Refus backend **et** Python.

## Limites

Hallucinations possibles si un LLM est branché ; le mode local reste un assistant, pas une source comptable/juridique. Latence et coût nuls en local. Pas de décision automatique. Pas de génération PDF arabe RTL.

La PHASE 3 du prompt maître est complétée par [`docs/test-strategy.md`](test-strategy.md) (niveaux, critères d’entrée/sortie, ordre obligatoire). Ancrage : [`docs/prompts/p3-ia-analytics-i18n-dashboard.md`](prompts/p3-ia-analytics-i18n-dashboard.md).

## Variables

```env
AI_PROVIDER=local
AI_MODEL=nextrade-local-assistant
AI_SERVICE_URL=http://127.0.0.1:5000
AI_API_URL=
AI_API_KEY=
```
