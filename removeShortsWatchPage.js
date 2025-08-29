function waitForElm(selector) {
  return new Promise((resolve) => {
    const elm = document.querySelector(selector)
    if (elm) return resolve(elm)

    const observer = new MutationObserver(() => {
      const elm = document.querySelector(selector)
      if (elm) {
        observer.disconnect()
        resolve(elm)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  })
}

function removeShorts(container = document) {
  const selectors = [
    "ytd-reel-shelf-renderer",
    // "[is-shorts]",
    // "a[href^='/shorts']",
    // "[href*='/shorts/']",
    // "ytd-compact-video-renderer:has(a[href^='/shorts'])",
    // "ytd-video-renderer:has(a[href^='/shorts'])",
    // "ytd-rich-item-renderer:has(a[href^='/shorts'])",
    // "[aria-label*='Shorts']",
    // "[title*='Shorts']",
  ]

  selectors.forEach((sel) => {
    container.querySelectorAll(sel).forEach((el) => el.remove())
  })
}

function observeContainer(container) {

  removeShorts(container)

  const obs = new MutationObserver(() => removeShorts(container))
  obs.observe(container, { childList: true, subtree: true })
  return obs
}

function handlePage() {
  if (window.location.pathname !== "/watch") return

  waitForElm("#secondary #secondary-inner").then((container) => {
    observeContainer(container)
  })
}

// Hook into YouTube’s SPA navigation
function setupNavigationObserver() {
  const trigger = () => setTimeout(handlePage, 200)

  ["pushState", "replaceState"].forEach((fn) => {
    const orig = history[fn]
    history[fn] = function (...args) {
      orig.apply(this, args)
      trigger()
    }
  })

  window.addEventListener("popstate", trigger)
  document.addEventListener("yt-navigate-finish", trigger)
}

function init() {
    setupNavigationObserver()
    handlePage()
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init)
  } else {
    init()
  }