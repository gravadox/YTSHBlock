/* onboarding.js — first-run flow  (external file required by MV3 CSP) */

const TOTAL = 4;
let step = 0;
let theme = 'dark';
let statsChoice = false;

let opts = { homefeed: true, watch: true, subs: true, sidebar: true, redirect: true, search: true };

/* ── Render current step ── */
function renderStep() {
  const el = document.getElementById('stepContent');
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = '';

  if      (step === 0) el.innerHTML = htmlWelcome();
  else if (step === 1) { el.innerHTML = htmlChoose(); bindChoose(); }
  else if (step === 2) { el.innerHTML = htmlStats();  bindStats(); }
  else if (step === 3) el.innerHTML = htmlDone();

  /* Progress dots */
  const dots = document.getElementById('dots');
  dots.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('span');
    d.className = 'dot-pip ' + (i === step ? 'active' : 'inactive');
    dots.appendChild(d);
  }

  document.getElementById('backBtn').style.display = step > 0 ? '' : 'none';
  document.getElementById('skipBtn').style.display = step < TOTAL - 1 ? '' : 'none';

  const arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const nxt = document.getElementById('nextBtn');
  if (step === TOTAL - 1)    nxt.innerHTML = 'Open YouTube ' + arrow;
  else if (step === 0)       nxt.innerHTML = 'Get started '  + arrow;
  else                       nxt.innerHTML = 'Continue '     + arrow;
}

/* ── Step HTML ── */
function htmlWelcome() {
  return '<div class="welcome">' +
    '<div class="welcome-logo"><img src="../icons/icon-128.png" width="52" height="52" style="border-radius:14px" alt=""></div>' +
    '<h1>Take back your feed.</h1>' +
    '<p>YTSHBlock removes Shorts from the sites you visit — so a quick search doesn\'t turn into an hour of scrolling.</p>' +
    '</div>';
}

function htmlChoose() {
  const rows = [
    ['homefeed', homeIc(),    'Hide Shorts on Home',          'The Shorts shelf on the Home feed'],
    ['watch',    watchIc(),   'Hide Shorts on watch page',    'The Shorts shelf on video pages'],
    ['subs',     subsIc(),    'Hide Shorts in Subscriptions', 'Shorts in your subscription feed'],
    ['sidebar',  sidebarIc(), 'Hide Shorts tab',              'In the sidebar and bottom bar'],
    ['redirect', redirectIc(),'Redirect Shorts links',        'Open them in the normal player'],
    ['search',   searchIc(),  'Filter search results',        'Keep search Shorts-free'],
  ];
  return '<div class="choose">' +
    '<h1>What should YTSHBlock hide?</h1>' +
    '<p>We\'ve turned on the essentials. Adjust any time in settings.</p>' +
    '<div class="card" style="padding:4px 18px">' +
    rows.map(([k, ic, t, d]) =>
      '<div class="row">' +
        '<div class="ricon">' + ic + '</div>' +
        '<div class="meta"><div class="t">' + t + '</div><div class="d">' + d + '</div></div>' +
        '<button class="sw ob-sw" role="switch" data-key="' + k + '" aria-checked="' + opts[k] + '"></button>' +
      '</div>'
    ).join('') +
    '</div></div>';
}

function htmlStats() {
  return '<div class="stats-opt">' +
    '<h1>Want to track your progress?</h1>' +
    '<p class="sub">YTSHBlock can count how many Shorts it blocks. All data stays on your device — nothing is shared.</p>' +
    '<div class="opt-cards">' +
    '<div class="opt-card ' + (statsChoice ? 'selected' : '') + '" data-choice="yes">' +
      '<div class="oc-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><rect x="5" y="11" width="3.2" height="7" rx="1"/><rect x="10.4" y="6" width="3.2" height="12" rx="1"/><rect x="15.8" y="13" width="3.2" height="5" rx="1"/></svg></div>' +
      '<div class="oc-title">Yes, count Shorts</div>' +
      '<div class="oc-desc">See weekly and all-time stats in the Stats panel.</div>' +
    '</div>' +
    '<div class="opt-card ' + (!statsChoice ? 'selected' : '') + '" data-choice="no">' +
      '<div class="oc-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></svg></div>' +
      '<div class="oc-title">No thanks</div>' +
      '<div class="oc-desc">Run silently with no tracking. Enable later in Settings → General.</div>' +
    '</div>' +
    '</div></div>';
}

function htmlDone() {
  const count = Object.values(opts).filter(Boolean).length;
  return '<div class="done">' +
    '<div class="done-check"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div>' +
    '<h1>You\'re all set.</h1>' +
    '<p>YTSHBlock is watching ' + count + ' ' + (count === 1 ? 'place' : 'places') + ' on YouTube. Pin the extension for quick access.</p>' +
    '<div class="done-hint card"><div class="ricon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/></svg></div>' +
    '<p>Click the puzzle icon <strong>&#9658;</strong> in your toolbar, then pin <strong>YTSHBlock</strong>.</p></div>' +
    '</div>';
}

/* ── Step-specific bindings ── */
function bindChoose() {
  document.querySelectorAll('.ob-sw').forEach(sw => {
    sw.onclick = () => {
      const k = sw.dataset.key;
      opts[k] = !opts[k];
      sw.setAttribute('aria-checked', String(opts[k]));
    };
  });
}

function bindStats() {
  document.querySelectorAll('.opt-card').forEach(card => {
    card.onclick = () => {
      statsChoice = card.dataset.choice === 'yes';
      document.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    };
  });
}

/* ── Navigation ── */
document.getElementById('nextBtn').onclick = async () => {
  if (step === TOTAL - 1) { await finish(); return; }
  if (step === 0) await browser.storage.local.set({ master: true });
  step++;
  renderStep();
};

document.getElementById('backBtn').onclick = () => {
  if (step > 0) { step--; renderStep(); }
};

document.getElementById('skipBtn').onclick = finish;

/* ── Finish ── */
async function finish() {
  await browser.storage.local.set({
    onboardingDone:  true,
    master:          true,
    statsEnabled:    statsChoice,
    homefeed:        opts.homefeed,
    watchshorts:     opts.watch,
    subs:            opts.subs,
    nav:             opts.sidebar,
    channel:         opts.sidebar,
    redirect:        opts.redirect,
    searchshorts:    opts.search,
  });
  browser.tabs.create({ url: 'https://www.youtube.com' });
  browser.tabs.getCurrent()
    .then(tab => browser.tabs.remove(tab.id))
    .catch(() => window.close());
}

/* ── Theme ── */
function applyTheme(t) {
  theme = t;
  document.documentElement.dataset.theme = t;
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  icon.innerHTML = t === 'dark'
    ? '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
    : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>';
}

document.getElementById('themeBtn').onclick = () =>
  applyTheme(theme === 'dark' ? 'light' : 'dark');

/* ── Icon helpers ── */
function homeIc()    { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18M3 15h18M9 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'; }
function watchIc()   { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M14 9.5l4 2.5-4 2.5z"/></svg>'; }
function subsIc()    { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6H3M16 12H3M11 18H3"/></svg>'; }
function sidebarIc() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/><path d="M5.5 9h1.5M5.5 12h1.5"/></svg>'; }
function redirectIc(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11a4 4 0 0 1 0 8h-3"/><path d="M9 6l-5 4 5 4"/></svg>'; }
function searchIc()  { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>'; }

/* ── Bootstrap: DOM ready, load saved theme then render first step ── */
browser.storage.local.get('theme').then(s => {
  if (s.theme) applyTheme(s.theme);
  renderStep();
}).catch(() => renderStep());
