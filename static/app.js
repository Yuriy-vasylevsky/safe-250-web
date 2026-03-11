// // ── Конфіг ──
// const API_URL = window.API_URL;  // встановлюється в HTML через Flask/Jinja2
// const TOTAL = 250;
// const POLL_INTERVAL = 1500;

// // ── Стан ──
// let lastOpenedStr = "";
// let pollTimer = null;

// // ── DOM refs ──
// const gridEl     = document.getElementById('grid');
// const countEl    = document.getElementById('count');
// const remainEl   = document.getElementById('remain');
// const progressEl = document.getElementById('progress');
// const statusEl   = document.getElementById('status');

// // ══════════════════════════
// //   Побудова сітки
// // ══════════════════════════
// function createGrid() {
//   gridEl.innerHTML = '';
//   for (let i = 1; i <= TOTAL; i++) {
//     const cell = document.createElement('div');
//     cell.className = 'cell';
//     cell.textContent = i;
//     cell.id = `c${i}`;
//     gridEl.appendChild(cell);
//   }
// }

// // ══════════════════════════
// //   Застосувати стан
// // ══════════════════════════
// function applyState(data) {
//   const opened = data.opened || [];

//   // лічильники
//   countEl.textContent  = opened.length;
//   remainEl.textContent = TOTAL - opened.length;

//   // прогрес-бар
//   const pct = (opened.length / TOTAL) * 100;
//   progressEl.style.width = pct + '%';

//   // клітинки
//   for (let i = 1; i <= TOTAL; i++) {
//     document.getElementById(`c${i}`)?.classList.remove('opened');
//   }
//   opened.forEach(n => {
//     document.getElementById(`c${n}`)?.classList.add('opened');
//   });
// }

// // ══════════════════════════
// //   Статус
// // ══════════════════════════
// function setStatus(type, text) {
//   statusEl.textContent = text;
//   statusEl.className = `status ${type}`;
// }

// // ══════════════════════════
// //   Запит до API
// // ══════════════════════════
// async function update() {
//   try {
//     const res = await fetch(API_URL, {
//       headers: { 'ngrok-skip-browser-warning': 'true' }
//     });

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = await res.json();
//     const newStr = JSON.stringify([...(data.opened || [])].sort((a, b) => a - b));

//     if (newStr !== lastOpenedStr) {
//       lastOpenedStr = newStr;
//       applyState(data);
//     }

//     setStatus('live', 'LIVE');
//   } catch (e) {
//     setStatus('dead', 'ПОМИЛКА ПІДКЛЮЧЕННЯ');
//     console.error('[Safe250]', e);
//   }
// }

// // ══════════════════════════
// //   Старт
// // ══════════════════════════
// createGrid();
// setStatus('connecting', 'ПІДКЛЮЧЕННЯ...');
// update();
// pollTimer = setInterval(update, POLL_INTERVAL);

// ── Конфіг ──
const API_URL = window.API_URL;
const TOTAL = 250;
const POLL_INTERVAL = 1500;

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

// 🔥 РЕНДЕР ЛІДЕРБОРДУ
function renderLeaderboard(users) {
  if (!users || Object.keys(users).length === 0) {
    leaderboardEl.innerHTML = `<div class="leader-item" style="justify-content:center;color:#6b5a8a;">Ще ніхто не відкривав клітинки...</div>`;
    return;
  }

  const sorted = Object.entries(users)
    .map(([id, u]) => ({...u, count: u.count || 0}))
    .sort((a, b) => b.count - a.count);

  let html = '';
  sorted.forEach((user, i) => {
    const percent = ((user.count / TOTAL) * 100).toFixed(1);
    const top1 = i === 0 ? 'top1' : '';
    html += `
      <div class="leader-item ${top1}">
        <div class="leader-rank">#${i+1}</div>
        <div class="leader-name">${user.display_name}</div>
        <div class="leader-stats">
          <div class="leader-count">${user.count} <span style="font-size:0.85rem;color:#6b5a8a">кл.</span></div>
          <div class="leader-percent">${percent}%</div>
          <div class="leader-progress"><div class="leader-progress-fill" style="width:${percent}%"></div></div>
        </div>
      </div>`;
  });
  leaderboardEl.innerHTML = html;
}

// Статус і update (зміни тільки в update)
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