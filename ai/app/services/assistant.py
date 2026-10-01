import json
import urllib.request
from .. import prompts
from .. import config

FORBIDDEN = ("password", "password_hash", "jwt", "secret", "api_key", "cvv", "token")


def _lang(value: str) -> str:
    return value if value in ("fr", "en", "ar") else "fr"


def _unknown_entity(message: str) -> bool:
    text = (message or "").lower()
    markers = (
        "inexistant",
        "does not exist",
        "unknown order",
        "commande inconnue",
        "n'existe pas",
        "غير موجود",
        "00000000-0000-4000-8000-000000000000",
    )
    return any(item in text for item in markers)


def _answer(language: str, message: str, module: str, help_text: str, facts_line: str) -> str:
    if _unknown_entity(message):
        return prompts.UNAVAILABLE[language]
    text = message.lower()
    if language == "en":
        if any(word in text for word in ("pending", "attente", "status", "order")):
            return "EN_ATTENTE means the order is waiting for payment or confirmation. PAYEE means paid. I cannot change a status."
        if any(word in text for word in ("revenue", "sales", "dashboard", "stock")):
            return facts_line or "Admin analytics come from PostgreSQL on the dashboard. This is not an official ledger."
        if any(word in text for word in ("document", "invoice", "packing")):
            return "Use the Documents module for invoice, packing list and customs files linked to an order."
        return f"NexTrade: {help_text} I only explain; I never modify data."
    if language == "ar":
        if any(word in text for word in ("طلب", "حالة", "انتظار")):
            return "حالة EN_ATTENTE تعني أن الطلب ينتظر. لا يمكنني تعديل الطلب."
        if any(word in text for word in ("وثائق", "فاتورة", "مستند")):
            return "الوثائق تشمل الفاتورة وقائمة التعبئة والإجراءات الجمركية."
        return f"نيكستريد: {help_text} أنا مساعد فقط ولست مرجعاً رسمياً."
    if any(word in text for word in ("attente", "statut", "commande")):
        return "EN_ATTENTE = commande en attente. PAYEE = payée. Je n'applique aucun changement."
    if any(word in text for word in ("chiffre", "ca", "vente", "dashboard", "stock", "indicateur")):
        return facts_line or "Les indicateurs admin viennent de PostgreSQL. Ce n'est pas une liasse fiscale."
    if any(word in text for word in ("document", "facture", "formalit")):
        return "Le dossier documentaire relie facture, packing list et formalités à une commande."
    return f"NexTrade : {help_text} Je reste un assistant, pas une autorité métier."


def is_forbidden(message: str) -> bool:
    text = (message or "").lower()
    if any(item in text for item in FORBIDDEN):
        return True
    if "mot de passe" in text or "mots de passe" in text or "كلمات المرور" in text:
        return True
    if "modifier" in text and "transaction" in text:
        return True
    if "other client" in text or "autre client" in text or "عميل آخر" in text:
        return True
    return False


def build_reply(payload: dict) -> dict:
    language = _lang(str(payload.get("language") or "fr"))
    message = str(payload.get("message") or "").strip()
    role = str(payload.get("role") or "CLIENT")
    context = payload.get("context") if isinstance(payload.get("context"), dict) else {}
    module = str(context.get("module") or "support")
    help_text = prompts.MODULE_HELP.get(module, prompts.MODULE_HELP["support"])[language]

    if is_forbidden(message):
        return {
            "provider": "local",
            "model": config.AI_MODEL,
            "language": language,
            "refused": True,
            "reply": prompts.REFUSAL[language],
        }

    if _unknown_entity(message):
        return {
            "provider": "local",
            "model": config.AI_MODEL,
            "language": language,
            "module": module,
            "refused": False,
            "reply": prompts.UNAVAILABLE[language],
        }

    facts = payload.get("facts") if role == "ADMIN" else {}
    facts_line = ""
    if isinstance(facts, dict) and facts.get("overview"):
        overview = facts["overview"]
        facts_line = {
            "fr": f"Indicateurs (30j, PostgreSQL): CA={overview.get('revenue')} commandes={overview.get('orders_total')} stock faible={overview.get('stock_low')}.",
            "en": f"Indicators (30d, PostgreSQL): revenue={overview.get('revenue')} orders={overview.get('orders_total')} low stock={overview.get('stock_low')}.",
            "ar": f"مؤشرات (30 يوماً): الإيرادات={overview.get('revenue')} الطلبات={overview.get('orders_total')} مخزون منخفض={overview.get('stock_low')}.",
        }[language]

    answer = _answer(language, message, module, help_text, facts_line)
    reply = " ".join(part for part in [answer, help_text, facts_line, prompts.LIMITS[language]] if part).strip()

    return {
        "provider": "local",
        "model": config.AI_MODEL,
        "language": language,
        "module": module,
        "refused": False,
        "reply": reply,
    }


def maybe_llm(payload: dict, local_result: dict) -> dict:
    if config.AI_PROVIDER != "openai_compatible" or not config.AI_API_KEY or not config.AI_API_URL:
        return local_result
    body = json.dumps(
        {
            "model": config.AI_MODEL,
            "messages": [
                {"role": "system", "content": prompts.SYSTEM[_lang(str(payload.get("language") or "fr"))]},
                {"role": "user", "content": local_result["reply"] + "\n\n" + str(payload.get("message") or "")},
            ],
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        config.AI_API_URL.rstrip("/") + "/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + config.AI_API_KEY,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
        content = data["choices"][0]["message"]["content"]
        local_result["provider"] = "openai_compatible"
        local_result["reply"] = content
        return local_result
    except Exception:
        return local_result
