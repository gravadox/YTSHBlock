function removeShortTab(tabList) {
  const tabs = tabList.querySelectorAll("div.tab-title");
  tabs.forEach((tab) => {
    if (tab.textContent.trim() === "Shorts") {
      tab.closest("tp-yt-paper-tab").remove();
      browser.runtime.sendMessage({ type: 'BLOCKED', count: 1 }).catch(() => {});
    }
  });
}

browser.storage.local
  .get(["master", "ytEnabled", "channel", "scheduleEnabled", "scheduleFrom", "scheduleTo", "scheduleDays"])
  .then((opts) => {
    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (!isScheduleActive(opts)) return;

    if (opts.channel !== false) {
      waitForElm("tp-yt-paper-tabs div#tabsContent")
        .then((tabList) => {
          removeShortTab(tabList);
          const observer = new MutationObserver(() => removeShortTab(tabList));
          observer.observe(tabList, { childList: true });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.log(err));
