function removeSearchShorts(container) {
  container.querySelectorAll("grid-shelf-view-model").forEach(shelf => {
    const header = shelf.querySelector("yt-section-header-view-model h2 span");
    if (header && header.textContent.trim().toLowerCase() === "shorts") {
      const count = shelf.querySelectorAll("ytd-reel-item-renderer, ytd-shorts-lockup-view-model, yt-lockup-view-model").length;
      shelf.remove();
      browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
    }
  });
}

browser.storage.local
  .get(["master", "ytEnabled", "searchshorts", "scheduleEnabled", "scheduleFrom", "scheduleTo", "scheduleDays"])
  .then((opts) => {
    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (!isScheduleActive(opts)) return;

    if (opts.searchshorts !== false) {
      waitForElm("ytd-search div#contents")
        .then((searchContents) => {
          removeSearchShorts(searchContents);

          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeName === "GRID-SHELF-VIEW-MODEL") {
                  const header = node.querySelector("yt-section-header-view-model h2 span");
                  if (header && header.textContent.trim().toLowerCase() === "shorts") {
                    const count = node.querySelectorAll("ytd-reel-item-renderer, ytd-shorts-lockup-view-model, yt-lockup-view-model").length;
                    node.remove();
                    browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
                  }
                }
              });
            });
          });

          observer.observe(searchContents, { childList: true, subtree: true });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.error(err));
