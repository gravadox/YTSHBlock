browser.storage.local
  .get(['master', 'ytEnabled', 'redirect', 'scheduleEnabled', 'scheduleFrom', 'scheduleTo', 'scheduleDays'])
  .then(opts => {
    if (opts.master === false) return;
    if (opts.ytEnabled === false) return;
    if (opts.redirect === false) return;
    if (!isScheduleActive(opts)) return;

    function convertLink(a) {
      if (a.href.includes("/shorts/")) {
        const id = a.href.split("/shorts/")[1].split(/[?&]/)[0];
        a.href = `https://www.youtube.com/watch?v=${id}`;
      }
    }

    document.querySelectorAll('a[href*="/shorts/"]').forEach(convertLink);

    new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            if (node.tagName === "A") convertLink(node);
            else node.querySelectorAll?.('a[href*="/shorts/"]').forEach(convertLink);
          }
        }
        if (m.type === "attributes" && m.target.tagName === "A") convertLink(m.target);
      }
    }).observe(document.body, {
      childList: true, subtree: true, attributes: true, attributeFilter: ["href"],
    });
  })
  .catch(() => {});
