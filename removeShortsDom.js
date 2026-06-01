const style = document.createElement("style");

browser.storage.local
  .get(["master", "ytEnabled", "nav", "homefeed", "scheduleEnabled", "scheduleFrom", "scheduleTo", "scheduleDays"])
  .then((opts) => {
    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (!isScheduleActive(opts)) return;

    if (opts.nav !== false) {
      style.appendChild(
        document.createTextNode(`
      ytd-guide-section-renderer a[title=Shorts] {
        display: none !important;
      }

      ytd-mini-guide-entry-renderer[aria-label=Shorts] {
        display: none !important;
      }`)
      );
    }

    if (opts.homefeed !== false) {
      style.appendChild(
        document.createTextNode(`
      ytd-rich-shelf-renderer[is-shorts] {
        display: none !important;
      }
      `)
      );

      // CSS hides the shelves; this observer counts individual videos inside for stats
      const counted = new WeakSet();
      const countNew = root => {
        let n = 0;
        root.querySelectorAll('ytd-rich-shelf-renderer[is-shorts]').forEach(shelf => {
          if (!counted.has(shelf)) {
            counted.add(shelf);
            const videos = shelf.querySelectorAll('ytd-reel-item-renderer').length;
            n += videos || 1;
          }
        });
        if (n > 0) browser.runtime.sendMessage({ type: 'BLOCKED', count: n }).catch(() => {});
      };
      waitForElm('ytd-rich-grid-renderer').then(grid => {
        countNew(grid);
        new MutationObserver(() => countNew(grid)).observe(grid, { childList: true, subtree: true });
      }).catch(() => {});
    }
  })
  .catch((err) => console.log(err));

const head = document.getElementsByTagName("head")[0];
head.appendChild(style);
