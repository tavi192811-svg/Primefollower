/**
 * app-redirect.js
 * Handles two things:
 * 1. Auto-redirect to download.html every 40 seconds
 * 2. Intercept specific action buttons -> redirect to download.html
 */
(function () {
  'use strict';

  var DOWNLOAD_PAGE = 'download.html';
  var secondsLeft = 40;

  function goToDownload(e) {
    if (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    clearInterval(autoTimer);
    window.location.href = DOWNLOAD_PAGE;
  }

  var autoTimer = setInterval(function() {
    secondsLeft--;
    if (secondsLeft <= 0) goToDownload();
  }, 1000);

  function interceptById(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', goToDownload, true);
      el.addEventListener('touchstart', goToDownload, { capture: true, passive: false });
    }
  }

  function attachRedirect(el) {
    if (el._redirectAttached) return;
    el._redirectAttached = true;
    el.addEventListener('click', goToDownload, true);
    el.addEventListener('touchstart', goToDownload, { capture: true, passive: false });
  }

  function interceptBySelector(selector) {
    document.querySelectorAll(selector).forEach(attachRedirect);
    var obs = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(selector)) attachRedirect(node);
          if (node.querySelectorAll) node.querySelectorAll(selector).forEach(attachRedirect);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function registerAll() {
    // Daily Check-In CLAIM button
    interceptById('btn-checkin');

    // Watch Ad button
    interceptById('btn-watch-ad');

    // Refer Friends Share Link button
    interceptById('refer-share-btn');

    // Contact Us Send Message button
    interceptById('btn-send-message');

    // Connect Now (Instagram connect)
    interceptById('btn-ig-connect');

    // Prime AI Floating button
    interceptById('prime-ai-float-btn');

    // All ORDER buttons in Insta Followers page
    // Use :not(#btn-open-buy) to exclude the BUY NOW button — it has class btn-order
    // but should open the Buy Followers page freely (not redirect to download.html)
    interceptBySelector('.btn-order:not(#btn-open-buy)');
    // NOTE: btn-open-buy (BUY NOW) is intentionally NOT intercepted
    // so users can browse the Buy Followers prices page freely.
    interceptById('first-order-btn');


    // Wallet Order History tab
    interceptBySelector('.wallet-tab[data-tab=redeem]');

    // Wallet transaction items (order detail clicks)
    interceptBySelector('#transaction-list .txn-item');
    interceptBySelector('#transaction-list .redeem-item');
    interceptBySelector('#transaction-list [data-order-id]');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAll);
  } else {
    registerAll();
  }

})();
