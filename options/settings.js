/* settings.js — full settings page  (external file required by MV3 CSP) */

const OPT_MAP = {
  homefeed:  ['homefeed'],
  subs:      ['subs'],
  sidebar:   ['nav', 'channel'],
  redirect:  ['redirect'],
  search:    ['searchshorts'],
  watch:     ['watchshorts'],
  menu:      ['menu'],
  ytEnabled: ['ytEnabled'],
};

const LOAD_KEYS = [
  'master', 'ytEnabled', 'theme',
  'statsEnabled', 'statsToday', 'statsWeek', 'statsAllTime', 'statsDaily',
  'homefeed', 'subs', 'nav', 'channel', 'redirect', 'searchshorts', 'watchshorts', 'menu',
  'scheduleEnabled', 'scheduleConfigured', 'scheduleFrom', 'scheduleTo', 'scheduleDays',
];

let st = {
  master: true, ytEnabled: true, theme: 'dark',
  statsEnabled: false, statsToday: 0, statsWeek: 0, statsAllTime: 0, statsDaily: [],
  homefeed: true, watch: true, subs: true, sidebar: true, redirect: true, search: true, menu: true,
  scheduleEnabled: false, scheduleConfigured: false,
  scheduleFrom: '09:00', scheduleTo: '17:00', scheduleDays: [1, 2, 3, 4, 5],
};

/* ── Panel switching ── */
function switchPanel(pid) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.nav-btn[data-panel="' + pid + '"]');
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + pid);
  if (panel) panel.classList.add('active');
  const content = document.getElementById('content');
  if (content) content.scrollTop = 0;
}

function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });
}

/* ── Theme ── */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  icon.innerHTML = t === 'dark'
    ? '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
    : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>';
  document.querySelectorAll('#themeSeg button').forEach(b =>
    b.setAttribute('aria-selected', b.dataset.themeVal === t ? 'true' : 'false'));
}

function setTheme(t) {
  st.theme = t;
  applyTheme(t);
  browser.storage.local.set({ theme: t });
}

/* ── Helpers ── */
function setSw(id, on) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('aria-checked', on ? 'true' : 'false');
}

function initDaily() {
  const N = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const r = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    r.push({ d: N[d.getDay()].slice(0, 3), v: 0 });
  }
  return r;
}

/* ── Render ── */
function render() {
  /* General */
  setSw('masterSw', st.master);
  const masterDesc = document.getElementById('masterDesc');
  if (masterDesc) masterDesc.textContent = st.master ? 'YTSHBlock is active.' : 'Everything is paused.';
  setSw('statsSw', st.statsEnabled);
  const statsNavBtn = document.getElementById('statsNavBtn');
  if (statsNavBtn) statsNavBtn.style.display = st.statsEnabled ? '' : 'none';

  /* YouTube — dim when master off or ytEnabled off */
  const ytDim = !st.master || !st.ytEnabled;
  ['homefeedSw', 'watchSw', 'subsSw', 'sidebarSw', 'redirectSw', 'searchSw', 'menuSw'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = ytDim;
  });
  setSw('homefeedSw', st.homefeed);
  setSw('watchSw',    st.watch);
  setSw('subsSw',     st.subs);
  setSw('sidebarSw',  st.sidebar);
  setSw('redirectSw', st.redirect);
  setSw('searchSw',   st.search);
  setSw('menuSw',     st.menu);

  const ytNote = document.getElementById('ytPausedNote');
  if (ytNote) ytNote.style.display = ytDim ? 'flex' : 'none';

  const allOn = st.homefeed && st.watch && st.subs && st.sidebar && st.redirect && st.search;
  const allBtn = document.getElementById('allBtn');
  if (allBtn) allBtn.textContent = allOn ? 'Turn all off' : 'Turn all on';

  /* Platforms */
  setSw('ytPlatSw', st.ytEnabled);
  const chip = document.getElementById('ytActiveChip');
  if (chip) {
    chip.textContent = st.ytEnabled ? 'Active' : 'Off';
    chip.className   = 'chip ' + (st.ytEnabled ? 'on' : 'soon');
  }

  /* Schedule */
  setSw('schedEnableSw', st.scheduleEnabled);
  const schedDesc = document.getElementById('schedDesc');
  if (schedDesc) schedDesc.textContent = st.scheduleEnabled
    ? 'Shorts are blocked only in the window below.' : 'Shorts are blocked at all times.';
  const so = document.getElementById('schedOptions');
  if (so) {
    so.style.opacity      = st.scheduleEnabled ? '1' : '.4';
    so.style.pointerEvents = st.scheduleEnabled ? 'auto' : 'none';
  }
  const sf = document.getElementById('schedFrom');
  const st2 = document.getElementById('schedTo');
  if (sf) sf.value = st.scheduleFrom;
  if (st2) st2.value = st.scheduleTo;
  document.querySelectorAll('.day').forEach(b =>
    b.setAttribute('aria-pressed', st.scheduleDays.includes(+b.dataset.day) ? 'true' : 'false'));

  /* Stats panel */
  if (st.statsEnabled) {
    const sw = document.getElementById('statWeek');
    const sa = document.getElementById('statAllTime');
    const sh = document.getElementById('statHours');
    if (sw) sw.textContent = st.statsWeek.toLocaleString();
    if (sa) sa.textContent = st.statsAllTime.toLocaleString();
    if (sh) sh.innerHTML = (st.statsAllTime * 38 / 3600).toFixed(1) +
      '<span style="font-size:12px;color:var(--text-2)"> hrs</span>';
    renderChart(st.statsDaily && st.statsDaily.length ? st.statsDaily : initDaily());
  }
}

function renderChart(daily) {
  const max = Math.max(...daily.map(d => d.v), 1);
  const el = document.getElementById('chartBars');
  if (!el) return;
  el.innerHTML = '';
  daily.forEach((d, i) => {
    const isToday = i === daily.length - 1;
    const px = Math.max((d.v / max) * 84, 4);
    const col = document.createElement('div');
    col.className = 'chart-col';
    col.innerHTML =
      '<span class="chart-val">' + d.v + '</span>' +
      '<div class="chart-bar ' + (isToday ? 'hi' : 'lo') + '" style="height:' + px + 'px"></div>' +
      '<span class="chart-day">' + d.d + '</span>';
    el.appendChild(col);
  });
}

/* ── Toggle helper ── */
function toggle(key, val) {
  st[key] = val;
  const keys = OPT_MAP[key] || [key];
  const patch = {};
  keys.forEach(k => { patch[k] = val; });
  browser.storage.local.set(patch);
  if ((key === 'ytEnabled' || key === 'master') && val === true) {
    browser.tabs.query({ url: '*://www.youtube.com/*' })
      .then(tabs => tabs.forEach(tab => browser.tabs.reload(tab.id)))
      .catch(() => {});
  }
  render();
}

/* ── Bind controls (called after state loads) ── */
function bindControls() {
  /* Theme — also bound early, but re-bound here with fresh st reference */
  document.getElementById('themeBtn').onclick = () => setTheme(st.theme === 'dark' ? 'light' : 'dark');
  document.querySelectorAll('#themeSeg button').forEach(b => {
    b.onclick = () => setTheme(b.dataset.themeVal);
  });

  /* General */
  document.getElementById('masterSw').onclick = () => toggle('master',       !st.master);
  document.getElementById('statsSw').onclick  = () => toggle('statsEnabled', !st.statsEnabled);

  /* YouTube */
  document.getElementById('homefeedSw').onclick = () => toggle('homefeed', !st.homefeed);
  document.getElementById('watchSw').onclick    = () => toggle('watch',    !st.watch);
  document.getElementById('subsSw').onclick     = () => toggle('subs',     !st.subs);
  document.getElementById('sidebarSw').onclick  = () => toggle('sidebar',  !st.sidebar);
  document.getElementById('redirectSw').onclick = () => toggle('redirect', !st.redirect);
  document.getElementById('searchSw').onclick   = () => toggle('search',   !st.search);
  document.getElementById('menuSw').onclick     = () => toggle('menu',     !st.menu);
  document.getElementById('ytPlatSw').onclick   = () => toggle('ytEnabled',!st.ytEnabled);

  document.getElementById('allBtn').onclick = () => {
    const allOn = st.homefeed && st.watch && st.subs && st.sidebar && st.redirect && st.search;
    const val = !allOn;
    const batch = {};
    ['homefeed', 'watch', 'subs', 'sidebar', 'redirect', 'search'].forEach(k => {
      st[k] = val;
      (OPT_MAP[k] || [k]).forEach(sk => { batch[sk] = val; });
    });
    browser.storage.local.set(batch);
    render();
  };

  /* Schedule */
  document.getElementById('schedEnableSw').onclick = () => toggle('scheduleEnabled', !st.scheduleEnabled);
  document.getElementById('schedFrom').onchange = e => {
    st.scheduleFrom = e.target.value;
    st.scheduleConfigured = true;
    browser.storage.local.set({ scheduleFrom: e.target.value, scheduleConfigured: true });
  };
  document.getElementById('schedTo').onchange = e => {
    st.scheduleTo = e.target.value;
    st.scheduleConfigured = true;
    browser.storage.local.set({ scheduleTo: e.target.value, scheduleConfigured: true });
  };
  document.querySelectorAll('.day').forEach(b => {
    b.onclick = () => {
      const day = +b.dataset.day;
      st.scheduleDays = st.scheduleDays.includes(day)
        ? st.scheduleDays.filter(x => x !== day)
        : [...st.scheduleDays, day].sort((a, b) => a - b);
      st.scheduleConfigured = true;
      browser.storage.local.set({ scheduleDays: st.scheduleDays, scheduleConfigured: true });
      render();
    };
  });
}

/* ── Bootstrap ──
   Script loaded at end of <body> — DOM is ready, no event listener needed. ── */

bindNav();

/* Bind theme early so it works even before storage loads */
document.getElementById('themeBtn').onclick = () => setTheme(st.theme === 'dark' ? 'light' : 'dark');
document.querySelectorAll('#themeSeg button').forEach(b => {
  b.onclick = () => setTheme(b.dataset.themeVal);
});

browser.storage.local.get(LOAD_KEYS).then(s => {
  st = {
    master:            s.master !== false,
    ytEnabled:         s.ytEnabled !== false,
    theme:             s.theme || 'dark',
    statsEnabled:      !!s.statsEnabled,
    statsToday:        s.statsToday  || 0,
    statsWeek:         s.statsWeek   || 0,
    statsAllTime:      s.statsAllTime || 0,
    statsDaily:        s.statsDaily  || initDaily(),
    homefeed:          s.homefeed    !== false,
    watch:             s.watchshorts !== false,
    subs:              s.subs        !== false,
    sidebar:           s.nav         !== false && s.channel !== false,
    redirect:          s.redirect    !== false,
    search:            !!s.searchshorts,
    menu:              s.menu !== false,
    scheduleEnabled:   !!s.scheduleEnabled,
    scheduleConfigured:!!s.scheduleConfigured,
    scheduleFrom:      s.scheduleFrom || '09:00',
    scheduleTo:        s.scheduleTo   || '17:00',
    scheduleDays:      s.scheduleDays || [1, 2, 3, 4, 5],
  };

  applyTheme(st.theme);
  render();
  bindControls();

  /* Open to a specific panel if the popup requested it */
  browser.storage.local.get('settingsOpenPanel').then(({ settingsOpenPanel }) => {
    if (settingsOpenPanel) {
      browser.storage.local.remove('settingsOpenPanel');
      switchPanel(settingsOpenPanel);
    }
  });

}).catch(err => console.error('settings init error:', err));

/* Sync theme from popup while settings is open */
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.theme) {
    st.theme = changes.theme.newValue || 'dark';
    applyTheme(st.theme);
  }
});
