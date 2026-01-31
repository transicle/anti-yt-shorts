// ==UserScript==
// @name        anti-yt-shorts
// @namespace   https://github.com/transicle/anti-yt-shorts
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.1.0
// @author      transicle
// @description Avoid distractions by completely removing the YouTube Shorts feature from YouTube.
// ==/UserScript==

// 500 Google searches later and it's done! :3
// lily.transgirls.win

// DM me on Discord (@transicle) if the script doesn't work for you,
// OR the script doesn't work in general!!

// Love you <3

// If the script works flawlessly please consider starring the repository :

(async() => {
  if (window.location.pathname.startsWith('/shorts/')) {
    const videoId = window.location.pathname.replace('/shorts/', '').split('/')[0];
    const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
    window.location.replace(newUrl);
    return;
  }

  let lastPath = window.location.pathname;

  const checkAndRedirect = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      if (currentPath.startsWith('/shorts/')) {
        const videoId = currentPath.replace('/shorts/', '').split('/')[0];
        window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(checkAndRedirect, 0);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(checkAndRedirect, 0);
  };

  window.addEventListener('popstate', checkAndRedirect);
  window.addEventListener('yt-navigate-finish', checkAndRedirect);

  setInterval(checkAndRedirect, 500);

  const style = document.createElement('style');
  style.textContent = `
    /* Hide feed content */
    ytd-rich-section-renderer,
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-rich-item-renderer:has(yt-collection-thumbnail-view-model),
    ytd-rich-item-renderer:has(a[href*="start_radio=1"]),
    /* Hide Shorts in full sidebar */
    ytd-guide-entry-renderer:has(a[title="Shorts"]),
    /* Hide Shorts in mini sidebar */
    ytd-mini-guide-entry-renderer:has(a[title="Shorts"]) {
      display: none !important;
    }
  `;
  document.documentElement.appendChild(style);

  let feedObserver;
  let sidebarObserver;
  let miniGuideObserver;

  const removeUnwantedFeedContent = contents => {
    const unwantedSelectors = [
      'ytd-rich-section-renderer',
      'ytd-rich-item-renderer:has(ytd-ad-slot-renderer)',
      'ytd-rich-item-renderer:has(yt-collection-thumbnail-view-model)',
      'ytd-rich-item-renderer:has(a[href*="start_radio=1"])'
    ];

    const elementsToRemove = contents.querySelectorAll(unwantedSelectors.join(','));
    if (elementsToRemove.length > 0) {
      elementsToRemove.forEach(el => el.remove());
    }
  }

  const removeShortsFromSidebar = () => {
    const shortsEntry = document.querySelector('ytd-guide-entry-renderer:has(a[title="Shorts"])');
    if (shortsEntry) {
      shortsEntry.remove();
    }
  }

  const removeShortsFromMiniGuide = () => {
    const miniShortsEntry = document.querySelector('ytd-mini-guide-entry-renderer:has(a[title="Shorts"])');
    if (miniShortsEntry) {
      miniShortsEntry.remove();
    }
  }

  const initFeed = () => {
    const contents = document.querySelector(
      'ytd-app #content #page-manager ytd-browse ytd-two-column-browse-results-renderer #primary ytd-rich-grid-renderer #contents'
    );

    if (!contents) return false;

    removeUnwantedFeedContent(contents);

    if (!feedObserver) {
      feedObserver = new MutationObserver((mutations) => {
        let hasAdditions = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            hasAdditions = true;
            break;
          }
        }

        if (hasAdditions) {
          removeUnwantedFeedContent(contents);
        }
      });

      feedObserver.observe(contents, {
        childList: true,
        subtree: false
      });
    }

    return true;
  }

  const initSidebar = () => {
    const guideRenderer = document.querySelector('ytd-guide-renderer');

    if (!guideRenderer) return false;

    removeShortsFromSidebar();

    if (!sidebarObserver) {
      sidebarObserver = new MutationObserver(() => {
        removeShortsFromSidebar();
      });

      sidebarObserver.observe(guideRenderer, {
        childList: true,
        subtree: true
      });
    }

    return true;
  }

  const initMiniGuide = () => {
    const miniGuide = document.querySelector('ytd-mini-guide-renderer');

    if (!miniGuide) return false;

    removeShortsFromMiniGuide();

    if (!miniGuideObserver) {
      miniGuideObserver = new MutationObserver(() => {
        removeShortsFromMiniGuide();
      });

      miniGuideObserver.observe(miniGuide, {
        childList: true,
        subtree: true
      });
    }

    return true;
  }

  const waitForPage = () => {
    const pageManager = document.querySelector('ytd-app #content #page-manager');

    if (pageManager) {
      if (!initFeed()) {
        const navObserver = new MutationObserver(() => {
          if (initFeed()) {
            navObserver.disconnect();
          }
        });
        navObserver.observe(pageManager, { childList: true, subtree: true });
      }
    } else {
      const rootObserver = new MutationObserver(() => {
        if (document.querySelector('ytd-app #content #page-manager')) {
          rootObserver.disconnect();
          waitForPage();
        }
      });
      rootObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  const waitForSidebar = () => {
    if (!initSidebar()) {
      const sidebarWatcher = new MutationObserver(() => {
        if (initSidebar()) {
          sidebarWatcher.disconnect();
        }
      });
      sidebarWatcher.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  const waitForMiniGuide = () => {
    if (!initMiniGuide()) {
      const miniGuideWatcher = new MutationObserver(() => {
        if (initMiniGuide()) {
          miniGuideWatcher.disconnect();
        }
      });
      miniGuideWatcher.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForPage();
      waitForSidebar();
      waitForMiniGuide();
    });
  } else {
    waitForPage();
    waitForSidebar();
    waitForMiniGuide();
  }
})();
