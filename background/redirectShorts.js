function isScheduleActive(opts) {
  if (!opts.scheduleEnabled) return true;
  const now = new Date();
  const day = now.getDay();
  const days = Array.isArray(opts.scheduleDays) ? opts.scheduleDays : [1,2,3,4,5];
  if (!days.includes(day)) return false;
  const parse = t => { const [h,m] = (t || '09:00').split(':').map(Number); return h*60+m; };
  const cur = now.getHours()*60 + now.getMinutes();
  const from = parse(opts.scheduleFrom), to = parse(opts.scheduleTo);
  return from <= to ? cur >= from && cur <= to : cur >= from || cur <= to;
}

async function handleUpdated(tabId, changeInfo) {
  if (!changeInfo.url) return;

  const re = /(?:http|https):\/\/www.youtube.com\/shorts\/([a-zA-Z0-9_-]{11})/;
  const found = changeInfo.url.match(re);

  if (found && found[1]) {
    const opts = await browser.storage.local.get([
      'master', 'ytEnabled', 'redirect',
      'scheduleEnabled', 'scheduleFrom', 'scheduleTo', 'scheduleDays',
    ]);

    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (opts.redirect === false) return;
    if (!isScheduleActive(opts)) return;

    const redirectUrl = `https://www.youtube.com/watch?v=${found[1]}`;

    try {
      await browser.tabs.update(tabId, { url: redirectUrl });
      browser.runtime.sendMessage({ type: 'BLOCKED', count: 1 }).catch(() => {});
    } catch (err) {
      console.error("Failed to redirect Shorts:", err);
    }
  }
}

browser.tabs.onUpdated.addListener(handleUpdated, {
  urls: ["*://www.youtube.com/shorts/*"],
});
