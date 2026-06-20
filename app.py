

from flask import Flask, render_template, jsonify
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# ── API URL твого ngrok/бота ──
NGROK_API = os.environ.get(
    "API_URL",
    "http://77.42.71.244:3000/api/safe"
    #  "static.244.71.42.77.clients.your-server.de/api/safe"
)

@app.route('/')
def index():
    return render_template('safe.html', api_url=NGROK_API)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)