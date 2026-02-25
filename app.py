from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
from pathlib import Path

app = FastAPI(title="СЕЙФ 250")

templates = Jinja2Templates(directory="templates")

STATE_FILE = Path("safe_state.json")

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "opened": [],
        "win_cell": 137,      # ← ЗМІНЮЙ ЦЕ ЧИСЛО КОЛИ ХОЧЕШ НОВИЙ СЕЙФ
        "total": 250
    }

def save_state(opened):
    data = {
        "opened": list(opened),
        "win_cell": load_state()["win_cell"],
        "total": 250
    }
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.get("/", response_class=HTMLResponse)
async def safe_page(request: Request):
    state = load_state()
    return templates.TemplateResponse("safe.html", {
        "request": request,
        "opened": state["opened"],
        "win_cell": state["win_cell"],
        "total": state["total"]
    })

@app.get("/state")
async def get_state():
    return load_state()

# Ендпоінт для бота (адмін відкриває клітинку)
@app.post("/open/{cell}")
async def open_cell(cell: int):
    state = load_state()
    opened = set(state["opened"])

    if cell in opened:
        return {"status": "already_opened"}

    opened.add(cell)
    save_state(opened)

    is_win = (cell == state["win_cell"])

    return {
        "status": "success",
        "cell": cell,
        "is_win": is_win
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)