// ── Конфіг ──
const API_URL = window.API_URL;  // встановлюється в HTML через Flask/Jinja2
const TOTAL = 250;
const POLL_INTERVAL = 1500;

// ── Стан ──
let lastOpenedStr = "";
let pollTimer = null;

// ── DOM refs ──
const gridEl     = document.getElementById('grid');
const countEl    = document.getElementById('count');
const remainEl   = document.getElementById('remain');
const progressEl = document.getElementById('progress');
const statusEl   = document.getElementById('status');

// ══════════════════════════
//   Побудова сітки
// ══════════════════════════
function createGrid() {
  gridEl.innerHTML = '';
  for (let i = 1; i <= TOTAL; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = i;
    cell.id = `c${i}`;
    gridEl.appendChild(cell);
  }
}

// ══════════════════════════
//   Застосувати стан
// ══════════════════════════
function applyState(data) {
  const opened = data.opened || [];

  // лічильники
  countEl.textContent  = opened.length;
  remainEl.textContent = TOTAL - opened.length;

  // прогрес-бар
  const pct = (opened.length / TOTAL) * 100;
  progressEl.style.width = pct + '%';

  // клітинки
  for (let i = 1; i <= TOTAL; i++) {
    document.getElementById(`c${i}`)?.classList.remove('opened');
  }
  opened.forEach(n => {
    document.getElementById(`c${n}`)?.classList.add('opened');
  });
}

// ══════════════════════════
//   Статус
// ══════════════════════════
function setStatus(type, text) {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
}

// ══════════════════════════
//   Запит до API
// ══════════════════════════
async function update() {
  try {
    const res = await fetch(API_URL, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const newStr = JSON.stringify([...(data.opened || [])].sort((a, b) => a - b));

    if (newStr !== lastOpenedStr) {
      lastOpenedStr = newStr;
      applyState(data);
    }

    setStatus('live', 'LIVE');
  } catch (e) {
    setStatus('dead', 'ПОМИЛКА ПІДКЛЮЧЕННЯ');
    console.error('[Safe250]', e);
  }
}

// ══════════════════════════
//   Старт
// ══════════════════════════
createGrid();
setStatus('connecting', 'ПІДКЛЮЧЕННЯ...');
update();
pollTimer = setInterval(update, POLL_INTERVAL);