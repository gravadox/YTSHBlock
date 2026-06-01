/* Stats accumulator — listens for BLOCKED messages from content/background scripts */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function makeDailyArray() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push({ d: DAY_NAMES[d.getDay()].slice(0, 3), v: 0 });
  }
  return arr;
}

async function handleBlocked(count) {
  const stored = await browser.storage.local.get([
    'statsEnabled', 'statsDate', 'statsToday',
    'statsWeek', 'statsAllTime', 'statsDaily',
  ]);

  if (!stored.statsEnabled) return;

  const today = todayISO();
  let statsDate  = stored.statsDate  || today;
  let statsToday = stored.statsToday || 0;
  let statsAllTime = stored.statsAllTime || 0;
  let statsDaily = stored.statsDaily  || makeDailyArray();

  // Roll over if the date has changed
  if (statsDate !== today) {
    const msPerDay = 86_400_000;
    const daysDiff = Math.round((new Date(today) - new Date(statsDate)) / msPerDay);
    statsDate  = today;
    statsToday = 0;

    if (daysDiff >= 7) {
      statsDaily = makeDailyArray();
    } else {
      for (let i = 0; i < daysDiff; i++) {
        statsDaily.shift();
        const d = new Date(today);
        d.setDate(d.getDate() - (daysDiff - 1 - i));
        statsDaily.push({ d: DAY_NAMES[d.getDay()].slice(0, 3), v: 0 });
      }
    }
  }

  // Accumulate
  statsToday += count;
  statsAllTime += count;
  statsDaily[statsDaily.length - 1].v += count;
  const statsWeek = statsDaily.reduce((a, b) => a + b.v, 0);

  await browser.storage.local.set({
    statsDate, statsToday, statsWeek, statsAllTime, statsDaily,
  });
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'BLOCKED') {
    handleBlocked(msg.count || 1);
  }
});
