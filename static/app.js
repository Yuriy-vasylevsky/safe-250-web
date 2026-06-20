
const API_URL = window.API_URL;
const TOTAL = 250;
const POLL_INTERVAL = 1500;

// 🔥 НОВІ ЗМІННІ (можеш змінювати)
const TOP_N = 5;          // скільки топ-гравців отримують призовий фонд
const PRIZE_POOL = 1000;  // загальний призовий фонд у гривнях

// ── Стан ──
let lastOpenedStr = "";
let lastUsersStr = "";
let pollTimer = null;

// ── DOM refs ──
const gridEl       = document.getElementById('grid');
const countEl      = document.getElementById('count');
const remainEl     = document.getElementById('remain');
const progressEl   = document.getElementById('progress');
const statusEl     = document.getElementById('status');
const leaderboardEl = document.getElementById('leaderboard');

// Побудова сітки (без змін)
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

// Застосувати стан клітинок
function applyState(data) {
  const opened = data.opened || [];
  countEl.textContent  = opened.length;
  remainEl.textContent = TOTAL - opened.length;
  const pct = (opened.length / TOTAL) * 100;
  progressEl.style.width = pct + '%';

  for (let i = 1; i <= TOTAL; i++) {
    document.getElementById(`c${i}`)?.classList.remove('opened');
  }
  opened.forEach(n => document.getElementById(`c${n}`)?.classList.add('opened'));
}

// 🔥 РЕНДЕР ЛІДЕРБОРДУ — ОНОВЛЕНА ВЕРСІЯ
// Тепер замість % від 250 клітинок показуємо суму виграшу з фонду 1000 грн
// (розподіляється тільки між топ-TOP_N гравцями пропорційно їх клітинкам)
function renderLeaderboard(users) {
  if (!users || Object.keys(users).length === 0) {
    leaderboardEl.innerHTML = `<div class="leader-item" style="justify-content:center;color:#6b5a8a;">Ще ніхто не відкривав клітинки...</div>`;
    return;
  }

  // Сортуємо всіх гравців за кількістю клітинок
  const sorted = Object.entries(users)
    .map(([id, u]) => ({ id, ...u, count: u.count || 0 }))
    .sort((a, b) => b.count - a.count);

  // ── Розрахунок призів ──
  const activeUsers = sorted.filter(u => u.count > 0);
  const numTop = Math.min(TOP_N, activeUsers.length);
  const topPlayers = activeUsers.slice(0, numTop);
  const totalTopCells = topPlayers.reduce((acc, p) => acc + p.count, 0) || 1;

  const prizeMap = {};
  topPlayers.forEach(p => {
    const share = p.count / totalTopCells;
    let prize = share * PRIZE_POOL;
    prize = Math.round(prize);           // округлюємо до цілих гривень
    prizeMap[p.id] = prize;
  });

  // Корекція округлення — щоб сума точно дорівнювала PRIZE_POOL
  let totalPrizeAssigned = Object.values(prizeMap).reduce((a, b) => a + b, 0);
  const diff = PRIZE_POOL - totalPrizeAssigned;
  if (diff !== 0 && topPlayers.length > 0) {
    const lastId = topPlayers[topPlayers.length - 1].id;
    prizeMap[lastId] = (prizeMap[lastId] || 0) + diff;
  }

  // ── Генерація HTML ──
  let html = '';
  sorted.forEach((user, i) => {
    const prize = prizeMap[user.id] || 0;
    const top1 = i === 0 ? 'top1' : '';

    html += `
      <div class="leader-item ${top1}">
        <div class="leader-rank">#${i+1}</div>
        <div class="leader-name">${user.display_name}</div>
        <div class="leader-stats">
          <div class="leader-count">
            ${user.count} кл. 
            <span class="leader-percent">• ${prize} грн</span>
          </div>
          <div class="leader-progress">
            <div class="leader-progress-fill" style="width:${(prize / PRIZE_POOL * 100)}%"></div>
          </div>
        </div>
      </div>`;
  });
  leaderboardEl.innerHTML = html;
}

// Статус і update (без змін)
function setStatus(type, text) {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
}

async function update() {
  try {
    const res = await fetch(API_URL, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    if (!res.ok) throw new Error();

    const data = await res.json();

    // клітинки
    const openedStr = JSON.stringify([...(data.opened || [])].sort((a,b)=>a-b));
    if (openedStr !== lastOpenedStr) {
      lastOpenedStr = openedStr;
      applyState(data);
    }

    // лідерборд
    const usersStr = JSON.stringify(data.users || {});
    if (usersStr !== lastUsersStr) {
      lastUsersStr = usersStr;
      renderLeaderboard(data.users);
    }

    setStatus('live', 'LIVE');
  } catch (e) {
    setStatus('dead', 'ПОМИЛКА ПІДКЛЮЧЕННЯ');
  }
}

// Старт
createGrid();
setStatus('connecting', 'ПІДКЛЮЧЕННЯ...');
update();
pollTimer = setInterval(update, POLL_INTERVAL);