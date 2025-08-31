async function handleUpdated(tabId, changeInfo, tab) {
  if (!changeInfo.url) return;

  // Match YouTube Shorts URLs
  const re = /(?:http|https):\/\/www.youtube.com\/shorts\/([a-zA-Z0-9_-]{11})/;
  const found = changeInfo.url.match(re);

  if (found && found[1]) {
    const redirectUrl = `https://www.youtube.com/watch?v=${found[1]}`;

    try {
      await browser.tabs.update(tabId, {
        url: redirectUrl,
        loadReplace: true
      });
      console.log("Redirecting Shorts...", redirectUrl);
    } catch (err) {
      console.error("Failed to redirect Shorts:", err);
    }
  }
}

// Listen to URL changes
browser.tabs.onUpdated.addListener(handleUpdated, {
  urls: ["*://www.youtube.com/shorts/*"],
});
