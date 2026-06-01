// read addon options
let addonOptions;
const optionList = ["nav", "homefeed", "channel", "subs", "menu", "searchshorts", "watchshorts"];

browser.storage.local
  .get(optionList)
  .then((options) => {
    if (
      options.nav === undefined ||
      !optionList.every((option) => options.hasOwnProperty(option))
    ) {
      // First run: initialize all defaults including new keys
      addonOptions = {
        nav: true, homefeed: true, channel: true, subs: true,
        menu: true, searchshorts: true, watchshorts: true,
        master: true, ytEnabled: true, redirect: true, theme: 'dark',
        statsEnabled: false, onboardingDone: false,
        scheduleEnabled: false, scheduleConfigured: false,
        scheduleFrom: '09:00', scheduleTo: '17:00', scheduleDays: [1, 2, 3, 4, 5],
      };
      browser.storage.local.set(addonOptions);
    } else {
      addonOptions = options;
      // Upgrade path: ensure new keys exist for users updating from older versions
      browser.storage.local.get(['master', 'ytEnabled', 'redirect', 'theme', 'statsEnabled', 'onboardingDone', 'scheduleConfigured'])
        .then((newKeys) => {
          const patch = {};
          if (newKeys.master            === undefined) patch.master            = true;
          if (newKeys.ytEnabled         === undefined) patch.ytEnabled         = true;
          if (newKeys.redirect          === undefined) patch.redirect          = true;
          if (newKeys.theme             === undefined) patch.theme             = 'dark';
          if (newKeys.statsEnabled      === undefined) patch.statsEnabled      = false;
          if (newKeys.onboardingDone    === undefined) patch.onboardingDone    = false;
          if (newKeys.scheduleConfigured=== undefined) patch.scheduleConfigured= false;
          if (Object.keys(patch).length) browser.storage.local.set(patch);
        });
    }

    // Initialize menu for the current tab on extension load/reload
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length && tabs[0].url) updateContextMenu(tabs[0].url);
    }).catch(() => {});
  })
  .catch((err) => console.error(err));

// Open onboarding on first install
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    browser.tabs.create({ url: browser.runtime.getURL('options/onboarding.html') });
  }
});

// Also check on each startup in case onboarding wasn't completed
// (covers developer reloads and edge cases where install event was missed)
browser.storage.local.get('onboardingDone').then(({ onboardingDone }) => {
  if (!onboardingDone) {
    browser.tabs.create({ url: browser.runtime.getURL('options/onboarding.html') });
  }
}).catch(() => {});

// format context menu
function onCreated() {
  if (browser.runtime.lastError) {
    console.log("error creating item:", browser.runtime.lastError);
  } else {
    console.log("item created successfully");
  }
}

function createContextMenu() {
  browser.menus.create(
    {
      id: "reminder",
      title: "Refresh is required to apply changes",
      contexts: ["all"],
      enabled: false,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "separator-1",
      type: "separator",
      contexts: ["all"],
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-nav",
      type: "checkbox",
      title: "Hide Shorts tab in navigation tab",
      contexts: ["all"],
      checked: addonOptions.nav,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-homefeed",
      type: "checkbox",
      title: "Hide Shorts section in Home feed",
      contexts: ["all"],
      checked: addonOptions.homefeed,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-channel",
      type: "checkbox",
      title: "Hide Shorts tab in channel page",
      contexts: ["all"],
      checked: addonOptions.channel,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-subs",
      type: "checkbox",
      title: "Hide Shorts from Subscriptions page",
      contexts: ["all"],
      checked: addonOptions.subs,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-searchshorts",
      type: "checkbox",
      title: "Hide Shorts in Search results",
      contexts: ["all"],
      checked: addonOptions.searchshorts,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-watchshorts",
      type: "checkbox",
      title: "Hide Shorts in Watch page",
      contexts: ["all"],
      checked: addonOptions.watchshorts,
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "separator-2",
      type: "separator",
      contexts: ["all"],
    },
    onCreated
  );

  browser.menus.create(
    {
      id: "check-menu",
      type: "checkbox",
      title: "Enable context menu",
      contexts: ["all"],
      checked: addonOptions.menu,
    },
    onCreated
  );
}

// initialize state
let contextMenuState = false;

function removeContextMenu() {
  browser.menus
    .removeAll()
    .then(console.log("items removed successfully"))
    .catch((err) => console.error(err));
  contextMenuState = false;
}

function updateContextMenu(currentTabUrl) {
  if (!addonOptions) return;
  const re = /(?:http|https):\/\/www.youtube.com\/.*/;
  const found = currentTabUrl.match(re);
  if (contextMenuState && !found) {
    // if menu is shown, and new tab is not in YouTube domain, remove context menu
    removeContextMenu();
  } else if (!contextMenuState && found && addonOptions.menu) {
    // if menu is not shown, and new tab is in YouTube domain, and context menu is enabled, create context menu
    createContextMenu();
    contextMenuState = true;
  }
}

// handle url change in active tab
function handleCurrentTabUpdate(_tabId, changeInfo, tabInfo) {
  if (tabInfo.active) updateContextMenu(changeInfo.url);
}

browser.tabs.onUpdated.addListener(handleCurrentTabUpdate, {
  properties: ["url"],
});

// handle tab change
function handleTabChange(_activeInfo) {
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      if (tabs[0].url !== "about:blank") updateContextMenu(tabs[0].url);
    })
    .catch((err) => console.error(err));
}

browser.tabs.onActivated.addListener(handleTabChange);

// handle menu options on click
function handleContextMenuClick(info, _tab) {
  // get option type
  const type = info.menuItemId.split("-")[1];

  // update option
  addonOptions[type] = info.checked;

  // update local storage
  let updateOption = {};
  updateOption[type] = info.checked;

  browser.storage.local
    .set(updateOption)
    .then(() => {
      console.log("success");
    })
    .catch((err) => console.error(err));

  // if menu option unchecked, remove context menu
  if (type === "menu" && !info.checked) removeContextMenu();
}

browser.menus.onClicked.addListener(handleContextMenuClick);

function handleLocalStorageChange(changes) {
  const changedItems = Object.keys(changes);
  for (const item of changedItems) {
    if (changes[item].oldValue !== changes[item].newValue) {
      addonOptions[item] = changes[item].newValue;
    }
  }
}

browser.storage.local.onChanged.addListener(handleLocalStorageChange);
