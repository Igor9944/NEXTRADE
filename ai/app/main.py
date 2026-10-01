from flask import Flask, jsonify, request
from .services.assistant import build_reply, maybe_llm, is_forbidden


def create_app():
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify({"status": "success", "service": "NexTrade AI", "provider": "local"})

    @app.post("/chat")
    def chat():
        payload = request.get_json(silent=True) or {}
        if not str(payload.get("message") or "").strip():
            return jsonify({"error": "message is required"}), 400
        if is_forbidden(str(payload.get("message") or "")):
            result = build_reply(payload)
            return jsonify(result), 200
        result = maybe_llm(payload, build_reply(payload))
        return jsonify(result)

    return app
