/* Popup logic */

// UI key → storage key(s)
const OPT_MAP = {
  homefeed:        ['homefeed'],
  subs:            ['subs'],
  sidebar:         ['nav', 'channel'],
  redirect:        ['redirect'],
  search:          ['searchshorts'],
  watch:           ['watchshorts'],
  master:          ['master'],
  ytEnabled:       ['ytEnabled'],
  scheduleEnabled: ['scheduleEnabled'],
};

const LOAD_KEYS = [
  'master', 'ytEnabled', 'theme',
  'statsEnabled', 'statsToday', 'statsWeek',
  'homefeed', 'subs', 'nav', 'channel', 'redirect', 'searchshorts', 'watchshorts',
  'scheduleEnabled', 'scheduleConfigured', 'scheduleFrom', 'scheduleTo', 'scheduleDays',
];

let st = {
  master: true, ytEnabled: true, theme: 'dark',
  statsEnabled: false, statsToday: 0, statsWeek: 0,
  homefeed: true, subs: true, sidebar: true, redirect: true, search: true, watch: true,
  scheduleEnabled: false, scheduleConfigured: false,
  scheduleFrom: '09:00', scheduleTo: '17:00', scheduleDays: [1,2,3,4,5],
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Bind theme toggle immediately (no async needed)
  document.getElementById('themeBtn').onclick = () => {
    const t = st.theme === 'dark' ? 'light' : 'dark';
    st.theme = t;
    applyTheme(t);
    browser.storage.local.set({ theme: t });
  };

  // Load state then bind everything else
  browser.storage.local.get(LOAD_KEYS).then(s => {
    st = {
      master:            s.master !== false,
      ytEnabled:         s.ytEnabled !== false,
      theme:             s.theme || 'dark',
      statsEnabled:      !!s.statsEnabled,
      statsToday:        s.statsToday || 0,
      statsWeek:         s.statsWeek  || 0,
      homefeed:          s.homefeed  !== false,
      subs:              s.subs      !== false,
      sidebar:           s.nav       !== false && s.channel !== false,
      redirect:          s.redirect  !== false,
      search:            !!s.searchshorts,
      watch:             s.watchshorts !== false,
      scheduleEnabled:   !!s.scheduleEnabled,
      scheduleConfigured:!!s.scheduleConfigured,
      scheduleFrom:      s.scheduleFrom || '09:00',
      scheduleTo:        s.scheduleTo   || '17:00',
      scheduleDays:      s.scheduleDays || [1,2,3,4,5],
    };

    applyTheme(st.theme);
    render();
    bind();
  }).catch(err => console.error('options init error:', err));
});

/* ── Theme ── */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  icon.innerHTML = t === 'dark'
    ? '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
    : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>';
}

/* ── Render ── */
function render() {
  setSw('masterSw', st.master);
  setSw('ytSw', st.ytEnabled);

  // Stats hero
  const hero = document.getElementById('hero');
  if (st.statsEnabled) {
    hero.style.display = 'flex';
    document.getElementById('dot').className = 'status-dot' + (st.master ? '' : ' off');
    const stTxt = document.getElementById('statusTxt');
    stTxt.textContent = st.master ? 'Active on this site' : 'Paused';
    stTxt.style.color  = st.master ? 'var(--text)' : 'var(--text-2)';
    const wn = document.getElementById('weekNum');
    wn.textContent    = st.statsWeek.toLocaleString();
    wn.style.color    = st.master ? 'var(--text)' : 'var(--text-3)';
    document.getElementById('todayNum').textContent = '+' + st.statsToday;
  } else {
    hero.style.display = 'none';
  }

  // Paused note — visible when master is off and stats hero isn't showing status
  const pausedNote = document.getElementById('pausedNote');
  if (pausedNote) pausedNote.style.display = (!st.master && !st.statsEnabled) ? 'block' : 'none';

  // YouTube controls dim when master off OR youtube platform off
  const active = st.master && st.ytEnabled;
  const ctrl = document.getElementById('ytControls');
  ctrl.style.opacity       = active ? '1' : '0.4';
  ctrl.style.pointerEvents = active ? 'auto' : 'none';
  ctrl.style.transition    = 'opacity .2s';

  // Individual option toggles
  setSw('homefeedSw', st.homefeed);
  setSw('subsSw',     st.subs);
  setSw('sidebarSw',  st.sidebar);
  setSw('redirectSw', st.redirect);
  setSw('searchSw',   st.search);
  setSw('watchSw',    st.watch);

  // Schedule
  setSw('schedSw', st.scheduleEnabled);
  document.getElementById('schedSumm').textContent = st.scheduleEnabled
    ? fmtSched(st.scheduleFrom, st.scheduleTo, st.scheduleDays)
    : 'Always on';
}

function setSw(id, on) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('aria-checked', String(!!on));
}

function fmtSched(from, to, days) {
  const fmt = t => {
    const [h, m] = t.split(':').map(Number);
    const ap = h < 12 ? 'am' : 'pm';
    const hh = h % 12 || 12;
    return m ? `${hh}:${String(m).padStart(2,'0')}${ap}` : `${hh}${ap}`;
  };
  const D = ['S','M','T','W','T','F','S'];
  const d = (days || []).slice().sort((a,b) => a-b);
  let dl;
  if (d.length === 7)              dl = 'Every day';
  else if (d.join() === '1,2,3,4,5') dl = 'Weekdays';
  else if (d.join() === '0,6')       dl = 'Weekends';
  else dl = d.map(i => D[i]).join(' ');
  return `${fmt(from)} – ${fmt(to)} · ${dl}`;
}

/* ── Storage write helper ── */
async function toggle(key, val) {
  st[key] = val;
  const keys = OPT_MAP[key] || [key];
  const patch = {};
  keys.forEach(k => { patch[k] = val; });
  await browser.storage.local.set(patch);
  if ((key === 'ytEnabled' || key === 'master') && val === true) {
    browser.tabs.query({ url: '*://www.youtube.com/*' })
      .then(tabs => tabs.forEach(tab => browser.tabs.reload(tab.id)))
      .catch(() => {});
  }
  render();
}

/* ── Bind events ── */
function bind() {
  document.getElementById('masterSw').onclick   = () => toggle('master',   !st.master);
  document.getElementById('ytSw').onclick       = () => toggle('ytEnabled',!st.ytEnabled);
  document.getElementById('homefeedSw').onclick = () => toggle('homefeed', !st.homefeed);
  document.getElementById('subsSw').onclick     = () => toggle('subs',     !st.subs);
  document.getElementById('sidebarSw').onclick  = () => toggle('sidebar',  !st.sidebar);
  document.getElementById('redirectSw').onclick = () => toggle('redirect', !st.redirect);
  document.getElementById('searchSw').onclick   = () => toggle('search',   !st.search);
  document.getElementById('watchSw').onclick    = () => toggle('watch',    !st.watch);

  document.getElementById('schedSw').onclick = async () => {
    const newVal = !st.scheduleEnabled;
    st.scheduleEnabled = newVal;
    await browser.storage.local.set({ scheduleEnabled: newVal });

    if (newVal && !st.scheduleConfigured) {
      // No schedule configured yet — send user to settings schedule panel
      await browser.storage.local.set({ settingsOpenPanel: 'schedule' });
      browser.runtime.openOptionsPage();
    }

    render();
  };

  document.getElementById('settingsBtn').onclick = () => browser.runtime.openOptionsPage();
}
