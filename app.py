# from fastapi import FastAPI, Request
# from fastapi.responses import HTMLResponse
# from fastapi.templating import Jinja2Templates
# import json
# from pathlib import Path

# app = FastAPI(title="СЕЙФ 250")

# templates = Jinja2Templates(directory="templates")

# STATE_FILE = Path("safe_state.json")

# def load_state():
#     if STATE_FILE.exists():
#         return json.loads(STATE_FILE.read_text(encoding="utf-8"))
#     return {"opened": [], "win_cell": 137, "total": 250}

# def save_state(opened):
#     data = {"opened": list(opened), "win_cell": load_state()["win_cell"], "total": 250}
#     STATE_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# @app.get("/", response_class=HTMLResponse)
# async def safe_page(request: Request):
#     state = load_state()
#     return templates.TemplateResponse("safe.html", {
#         "request": request,
#         "opened": state["opened"],
#         "win_cell": state["win_cell"],
#         "total": state["total"]
#     })

# @app.get("/state")
# async def get_state():
#     return load_state()

# # Для бота — відкрити клітинку
# @app.post("/open/{cell}")
# async def open_cell(cell: int):
#     state = load_state()
#     opened = set(state["opened"])
#     if cell in opened:
#         return {"status": "already_opened"}
#     opened.add(cell)
#     save_state(opened)
#     return {"status": "success", "cell": cell, "is_win": cell == state["win_cell"]}

from flask import Flask, render_template, jsonify
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# ── API URL твого ngrok/бота ──
NGROK_API = os.environ.get(
    "NGROK_API",
    "https://intramarginal-existentialistically-corrin.ngrok-free.dev/api/safe"
)

@app.route('/')
def index():
    return render_template('safe.html', api_url=NGROK_API)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)