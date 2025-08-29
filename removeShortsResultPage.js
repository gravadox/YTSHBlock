function removeSearchShorts(container) {
  // Remove entire Shorts shelf from search results
  container.querySelectorAll("grid-shelf-view-model").forEach(shelf => {
    const header = shelf.querySelector("yt-section-header-view-model h2 span");
    if (header && header.textContent.trim().toLowerCase() === "shorts") {
      shelf.remove();
    }
  });
}

browser.storage.local.get(["searchshorts"]).then((options) => {
  if (options.searchshorts) {
    waitForElm("ytd-search div#contents")
      .then((searchContents) => {
        // Initial remove
        removeSearchShorts(searchContents);

        // Watch for dynamically loaded search results
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === "GRID-SHELF-VIEW-MODEL") {
                // If it's a Shorts shelf, remove it
                const header = node.querySelector("yt-section-header-view-model h2 span");
                if (header && header.textContent.trim().toLowerCase() === "shorts") {
                  node.remove();
                }
              }
            });
          });
        });

        observer.observe(searchContents, { childList: true, subtree: true });
      })
      .catch((err) => console.error(err));
  }
}).catch((err) => console.error(err));