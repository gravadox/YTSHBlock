function removeWatchShorts(container) {
  container.querySelectorAll("ytd-reel-shelf-renderer").forEach(shelf => {
    const titleSpan = shelf.querySelector("#title-container h2 #title");
    if (titleSpan && titleSpan.textContent.trim().toLowerCase().includes("shorts")) {
      const count = shelf.querySelectorAll("ytd-reel-item-renderer").length;
      shelf.remove();
      browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
    }
  });
}

browser.storage.local
  .get(["master", "ytEnabled", "watchshorts", "scheduleEnabled", "scheduleFrom", "scheduleTo", "scheduleDays"])
  .then((opts) => {
    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (!isScheduleActive(opts)) return;

    if (opts.watchshorts !== false) {
      waitForElm("ytd-watch-flexy #secondary #related").then((relatedContainer) => {
        removeWatchShorts(relatedContainer);

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === "YTD-REEL-SHELF-RENDERER") {
                const titleSpan = node.querySelector("#title-container h2 #title");
                if (titleSpan && titleSpan.textContent.trim().toLowerCase().includes("shorts")) {
                  const count = node.querySelectorAll("ytd-reel-item-renderer").length;
                  node.remove();
                  browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
                }
              }
            });
          });
        });

        observer.observe(relatedContainer, { childList: true, subtree: true });
      }).catch(err => console.error(err));
    }
  })
  .catch(err => console.error(err));
