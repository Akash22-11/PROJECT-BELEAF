// Simple habit tracker with localStorage persistence and streaks.

const TARGETS = {
  water: 8,      // glasses
  read: 30,      // minutes
  run: 5         // km
};

const els = {
  // Water
  waterProgress: document.getElementById('water-progress'),
  waterCount: document.getElementById('water-count'),
  waterAdd: document.getElementById('water-add'),
  waterSub: document.getElementById('water-sub'),
  waterStreak: document.getElementById('water-streak'),
  waterLastlog: document.getElementById('water-lastlog'),

  // Read
  readProgress: document.getElementById('read-progress'),
  readMinutes: document.getElementById('read-minutes'),
  readInput: document.getElementById('read-input'),
  readAdd: document.getElementById('read-add'),
  readReset: document.getElementById('read-reset'),
  readStreak: document.getElementById('read-streak'),
  readLastlog: document.getElementById('read-lastlog'),

  // Run
  runProgress: document.getElementById('run-progress'),
  runKm: document.getElementById('run-km'),
  runInput: document.getElementById('run-input'),
  runAdd: document.getElementById('run-add'),
  runReset: document.getElementById('run-reset'),
  runStreak: document.getElementById('run-streak'),
  runLastlog: document.getElementById('run-lastlog'),

  // Day controls
  resetDay: document.getElementById('reset-day'),
  clearAll: document.getElementById('clear-all')
};

function todayKey() {
  const d = new Date();
  // ISO date without time for streak checks
  return d.toISOString().slice(0, 10);
}

function loadState() {
  const raw = localStorage.getItem('habit-state');
  if (!raw) {
    return {
      date: todayKey(),
      water: { value: 0, history: [], streak: 0, lastLog: null },
      read:  { value: 0, history: [], streak: 0, lastLog: null },
      run:   { value: 0, history: [], streak: 0, lastLog: null }
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      date: todayKey(),
      water: { value: 0, history: [], streak: 0, lastLog: null },
      read:  { value: 0, history: [], streak: 0, lastLog: null },
      run:   { value: 0, history: [], streak: 0, lastLog: null }
    };
  }
}

function saveState(state) {
  localStorage.setItem('habit-state', JSON.stringify(state));
}

function ensureToday(state) {
  const key = todayKey();
  if (state.date !== key) {
    // Advance day: evaluate streaks based on whether target met yesterday
    ['water', 'read', 'run'].forEach(habit => {
      const target = TARGETS[habit];
      const met = state[habit].value >= target;
      state[habit].streak = met ? (state[habit].streak + 1) : 0;
      // Reset daily values
      state[habit].value = 0;
      state[habit].history = [];
      state[habit].lastLog = null;
    });
    state.date = key;
    saveState(state);
  }
}

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString();
}

function render(state) {
  // Water
  const waterPct = Math.min(100, (state.water.value / TARGETS.water) * 100);
  els.waterProgress.style.width = `${waterPct}%`;
  els.waterCount.textContent = state.water.value.toString();
  els.waterStreak.textContent = state.water.streak.toString();
  els.waterLastlog.textContent = formatTime(state.water.lastLog);

  // Read
  const readPct = Math.min(100, (state.read.value / TARGETS.read) * 100);
  els.readProgress.style.width = `${readPct}%`;
  els.readMinutes.textContent = state.read.value.toString();
  els.readStreak.textContent = state.read.streak.toString();
  els.readLastlog.textContent = formatTime(state.read.lastLog);

  // Run
  const runPct = Math.min(100, (state.run.value / TARGETS.run) * 100);
  els.runProgress.style.width = `${runPct}%`;
  els.runKm.textContent = state.run.value.toString();
  els.runStreak.textContent = state.run.streak.toString();
  els.runLastlog.textContent = formatTime(state.run.lastLog);
}

function addLog(state, habit, amount) {
  if (amount <= 0 || !Number.isFinite(amount)) return;
  state[habit].value = +(state[habit].value + amount).toFixed(2);
  state[habit].history.push(amount);
  state[habit].lastLog = Date.now();
  saveState(state);
  render(state);
}

function undoLast(state, habit) {
  const last = state[habit].history.pop();
  if (last !== undefined) {
    state[habit].value = +(state[habit].value - last);
    if (state[habit].value < 0) state[habit].value = 0;
    state[habit].lastLog = Date.now();
    saveState(state);
    render(state);
  }
}

function resetToday(state) {
  ['water', 'read', 'run'].forEach(habit => {
    state[habit].value = 0;
    state[habit].history = [];
    state[habit].lastLog = null;
  });
  saveState(state);
  render(state);
}

function clearAllData() {
  localStorage.removeItem('habit-state');
  const fresh = loadState();
  render(fresh);
}

// Initialize
const state = loadState();
ensureToday(state);
render(state);

// Event bindings
els.waterAdd.addEventListener('click', () => addLog(state, 'water', 1));
els.waterSub.addEventListener('click', () => undoLast(state, 'water'));

els.readAdd.addEventListener('click', () => {
  const val = parseInt(els.readInput.value, 10);
  if (!Number.isFinite(val) || val <= 0) return;
  addLog(state, 'read', val);
  els.readInput.value = '';
});
els.readReset.addEventListener('click', () => undoLast(state, 'read'));

els.runAdd.addEventListener('click', () => {
  const val = parseFloat(els.runInput.value);
  if (!Number.isFinite(val) || val <= 0) return;
  addLog(state, 'run', val);
  els.runInput.value = '';
});
els.runReset.addEventListener('click', () => undoLast(state, 'run'));

els.resetDay.addEventListener('click', () => resetToday(state));
els.clearAll.addEventListener('click', clearAllData);

// Optional: update progress bar gradient threshold for completion
function pulseOnComplete() {
  ['water', 'read', 'run'].forEach(habit => {
    const el = {
      water: els.waterProgress,
      read: els.readProgress,
      run: els.runProgress
    }[habit];
    const pct = (state[habit].value / TARGETS[habit]) * 100;
    el.style.filter = pct >= 100 ? 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' : 'none';
  });
}
setInterval(pulseOnComplete, 500);
