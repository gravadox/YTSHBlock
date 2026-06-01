function firstLoadRemove(subContents) {
  subContents.querySelectorAll("ytd-grid-renderer").forEach(removeFromGridRenderer);
  const seen = new Set();
  subContents
    .querySelectorAll("ytd-shelf-renderer ytd-video-renderer ytd-thumbnail a[href^='/shorts']")
    .forEach((video) => {
      const shelf = video.closest("ytd-shelf-renderer");
      if (shelf && !seen.has(shelf)) {
        seen.add(shelf);
        const count = shelf.querySelectorAll("ytd-video-renderer").length;
        shelf.remove();
        browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
      }
    });
}

function checkIfShelfVideoIsShort(elem) {
  const a = elem.querySelector("ytd-thumbnail a[href^='/shorts']");
  if (a) {
    const shelf = a.closest("ytd-shelf-renderer");
    if (shelf) {
      const count = shelf.querySelectorAll("ytd-video-renderer").length;
      shelf.remove();
      browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
    }
  }
}

function removeFromGridRenderer(renderer) {
  const removed = renderer.querySelectorAll(
    "ytd-grid-video-renderer ytd-thumbnail a[href^='/shorts']"
  );
  removed.forEach((video) => {
    video.closest("ytd-grid-video-renderer").remove();
  });
  if (removed.length) {
    browser.runtime.sendMessage({ type: 'BLOCKED', count: removed.length }).catch(() => {});
  }
}

browser.storage.local
  .get(["master", "ytEnabled", "subs", "scheduleEnabled", "scheduleFrom", "scheduleTo", "scheduleDays"])
  .then((opts) => {
    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (!isScheduleActive(opts)) return;

    if (opts.subs !== false) {
      waitForElm("ytd-section-list-renderer[page-subtype='subscriptions'] div#contents")
        .then((subContents) => {
          firstLoadRemove(subContents);

          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeName === "YTD-ITEM-SECTION-RENDERER") {
                  if (!node.querySelector("ytd-grid-renderer")) {
                    checkIfShelfVideoIsShort(node);
                  }
                } else if (node.nodeName === "YTD-CONTINUATION-ITEM-RENDERER") {
                  const grids = subContents.querySelectorAll("ytd-grid-renderer");
                  if (grids.length) {
                    grids.forEach(removeFromGridRenderer);
                  } else {
                    const seen = new Set();
                    subContents
                      .querySelectorAll("ytd-shelf-renderer ytd-video-renderer ytd-thumbnail a[href^='/shorts']")
                      .forEach((video) => {
                        const shelf = video.closest("ytd-shelf-renderer");
                        if (shelf && !seen.has(shelf)) {
                          seen.add(shelf);
                          const count = shelf.querySelectorAll("ytd-video-renderer").length;
                          shelf.remove();
                          browser.runtime.sendMessage({ type: 'BLOCKED', count: count || 1 }).catch(() => {});
                        }
                      });
                  }
                }
              });
            });
          });

          observer.observe(subContents, { childList: true });
        })
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.log(err));
