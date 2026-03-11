

from flask import Flask, render_template, jsonify
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# ── API URL твого ngrok/бота ──
NGROK_API = os.environ.get(
    "API_URL",
    "https://tgbot-production-97ae.up.railway.app/api/safe"
)

@app.route('/')
def index():
    return render_template('safe.html', api_url=NGROK_API)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)