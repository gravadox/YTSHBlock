function removeWatchShorts(container) {
  // Remove entire Shorts shelf from watch pages
  container.querySelectorAll("ytd-reel-shelf-renderer").forEach(shelf => {
    const titleSpan = shelf.querySelector("#title-container h2 #title");
    if (titleSpan && titleSpan.textContent.trim().toLowerCase().includes("shorts")) {
      shelf.remove();
    }
  });
}

browser.storage.local.get(["watchshorts"]).then((options) => {
  if (options.watchshorts) {
    waitForElm("ytd-watch-flexy #secondary #related").then((relatedContainer) => {
      // Initial remove
      removeWatchShorts(relatedContainer);

      // Observe for dynamically loaded shelves
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "YTD-REEL-SHELF-RENDERER") {
              const titleSpan = node.querySelector("#title-container h2 #title");
              if (titleSpan && titleSpan.textContent.trim().toLowerCase().includes("shorts")) {
                node.remove();
              }
            }
          });
        });
      });

      observer.observe(relatedContainer, { childList: true, subtree: true });
    }).catch(err => console.error(err));
  }
}).catch(err => console.error(err));
