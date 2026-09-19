import os
from flask import Flask, jsonify
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

def create_app():
    app = Flask(__name__)

    @app.route('/health')
    def health():
        return jsonify({
            'status': 'success',
            'service': 'NexTrade AI',
            'message': 'AI service operational'
        })

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)