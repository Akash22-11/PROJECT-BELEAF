const STORAGE_KEY = 'habit-tracker-data-v1';
    let habits = [];
    let days = [];

    function uid() {
      return Math.random().toString(36).slice(2, 9);
    }

    function formatDay(d) {
      return d.toISOString().slice(0, 10);
    }

    function generateDays() {
      const result = [];
      const today = new Date();
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek - 28);
      
      for (let i = 0; i < 35; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        result.push(d);
      }
      return result;
    }

    function loadHabits() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          habits = JSON.parse(raw);
        } else {
          habits = [
            { id: uid(), name: 'Drink water', logs: [] },
            { id: uid(), name: 'Study DSA', logs: [] },
            { id: uid(), name: 'Gym', logs: [] },
            { id: uid(), name: "Don't scroll at 2 AM", logs: [] }
          ];
        }
      } catch (e) {
        habits = [];
      }
    }

    function saveHabits() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }

    function addHabit() {
      const input = document.getElementById('habitInput');
      const name = input.value.trim();
      if (!name) return;
      
      habits.unshift({ id: uid(), name, logs: [] });
      input.value = '';
      saveHabits();
      render();
    }

    function removeHabit(id) {
      habits = habits.filter(h => h.id !== id);
      saveHabits();
      render();
    }

    function toggleLog(habitId, dateStr) {
      habits = habits.map(h => {
        if (h.id !== habitId) return h;
        const has = h.logs.includes(dateStr);
        return {
          ...h,
          logs: has ? h.logs.filter(d => d !== dateStr) : [...h.logs, dateStr]
        };
      });
      saveHabits();
      render();
    }

    function render() {
      const listEl = document.getElementById('habitsList');
      const calendarEl = document.getElementById('calendarArea');
      const today = formatDay(new Date());
      
      listEl.innerHTML = habits.map(h => `
        <div class="habit-item">
          <div class="habit-info">
            <div class="habit-name">${h.name}</div>
            <div class="habit-count">${h.logs.length} days</div>
          </div>
          <button class="remove-btn" onclick="removeHabit('${h.id}')">Remove</button>
        </div>
      `).join('');

      calendarEl.innerHTML = habits.map(h => `
        <div class="habit-row">
          <div class="habit-label">${h.name}</div>
          <div class="calendar-grid">
            ${days.map(day => {
              const ds = formatDay(day);
              const done = h.logs.includes(ds);
              const isToday = ds === today;
              return `
                <button 
                  class="day-cell ${done ? 'completed' : ''} ${isToday ? 'today' : ''}"
                  onclick="toggleLog('${h.id}', '${ds}')"
                  title="${day.toDateString()}"
                >
                  <span class="check">✓</span>
                  <div class="dot"></div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `).join('');
    }

    document.getElementById('habitInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addHabit();
    });

    days = generateDays();
    loadHabits();
    render();
