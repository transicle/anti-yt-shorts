// ==UserScript==
// @name        anti-yt-shorts
// @namespace   https://github.com/transicle/anti-yt-shorts
// @match       https://www.youtube.com/
// @grant       none
// @version     1.0
// @author      transicle
// @description Avoid distractions by completely removing the YouTube Shorts feature from YouTube.
// ==/UserScript==

// 500 Google searches later and it's done! :3
// lily.transgirls.win

// DM me on Discord (@transicle) if the script doesn't work for you,
// OR the script doesn't work in general!!

// Love you <3

// If the script works flawlessly please consider starring the repository :)

(async() => {
  var slopObserver;
  var observerSettings = {
    childList: true,
  }

  function removeSlop() {
    var body = document.querySelector("ytd-app");
    var ytdAppContent = body.querySelector("#content");
    var pageManager = ytdAppContent.querySelector("#page-manager");
    var ytdBrowse = pageManager.querySelector("ytd-browse"); // Is an annoying little ass wipe

    function pleaseJustDelete(localYtdBrowse) {
      var ytdBlahBlahBlah = localYtdBrowse.querySelector("ytd-two-column-browse-results-renderer");
      var primary = ytdBlahBlahBlah.querySelector("#primary");
      var ytdRichGridRenderer = primary.querySelector("ytd-rich-grid-renderer");
      var contents = ytdRichGridRenderer.querySelector("#contents");

      var contentsChildren = contents.children;

      if (!slopObserver) {
        slopObserver = new MutationObserver((mutationRecords) => {
          var sections = contents.querySelectorAll('ytd-rich-section-renderer');
          sections.forEach(node => node.remove());
        });
        slopObserver.observe(contents, observerSettings);
      }

      return true;
    }

    if (!ytdBrowse) {
      var observer = new MutationObserver(() => {
        pleaseJustDelete(pageManager.querySelector("ytd-browse"));
        // observer.disconnect();
      }).observe(pageManager, observerSettings);
    } else pleaseJustDelete(ytdBrowse);
  }

  window.addEventListener("load", function() {
    console.log("YouTube loaded");
    removeSlop();
  }, false);
})();
