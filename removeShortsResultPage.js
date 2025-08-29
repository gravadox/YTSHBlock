function waitForElm(selector, root = document) {
  return new Promise(resolve => {
    const el = root.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = root.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(root, { childList: true, subtree: true });
  });
}

function removeShortsFromNode(node) {
  if (node.nodeType !== 1) return 0;
  let removed = 0;

  const selectors = [
    "grid-shelf-view-model",
    "ytd-reel-shelf-renderer",
    
    // 'ytd-shelf-renderer:has([title*="Shorts"])',           // this is one is over
    // "ytm-shorts-lockup-view-model-v2",                     // this is one is over
    // "ytm-shorts-lockup-view-model",                        // this is one is over
    // "ytd-compact-video-renderer:has(a[href^='/shorts'])",
    // "ytd-video-renderer:has(a[href^='/shorts'])",
    // "ytd-rich-item-renderer:has(a[href^='/shorts'])"
  ];

  selectors.forEach(sel => {
    node.querySelectorAll(sel).forEach(el => {
      el.remove();
      removed++;
    });
  });

  if (selectors.some(sel => node.matches(sel))) {
    node.remove();
    removed++;
  }

  return removed;
}

function observeContainer(container) {
  const observer = new MutationObserver(muts => {
    let totalRemoved = 0;
    muts.forEach(m => {
      m.addedNodes.forEach(node => totalRemoved += removeShortsFromNode(node));
    });
  });

  observer.observe(container, { childList: true, subtree: true });
  removeShortsFromNode(container);
  return observer;
}

function handleSearchPage() {
  if (!window.location.pathname.startsWith("/results")) return;

  waitForElm("ytd-section-list-renderer#contents").then(container => {
    observeContainer(container);
  });
}

function setupNavigationObserver() {
  const trigger = () => setTimeout(handleSearchPage, 300);

  ["pushState", "replaceState"].forEach(fn => {
    const orig = history[fn];
    history[fn] = function (...args) {
      orig.apply(this, args);
      trigger();
    };
  });

  window.addEventListener("popstate", trigger);
  document.addEventListener("yt-navigate-finish", trigger);
}

function init() {
  removeShortsFromNode(document.body);
  observeContainer(document.body);
  setupNavigationObserver();
  handleSearchPage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
