import os

AI_PROVIDER = os.getenv("AI_PROVIDER", "local")
AI_MODEL = os.getenv("AI_MODEL", "nextrade-local-assistant")
AI_API_URL = os.getenv("AI_API_URL", "")
AI_API_KEY = os.getenv("AI_API_KEY", "")
PORT = int(os.getenv("AI_PORT", os.getenv("FLASK_RUN_PORT", "5000")))
