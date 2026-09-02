/* ============================================================
   DC BEATS — Free Beats Widget   |   js/free-beats-widget.js
   ============================================================
   Adds two components to whichever page includes this script:

   1. STICKY TAB — a persistent left-side tab linking to the
      free beats landing page. Dismissable for the session.

   2. EXIT-INTENT POPUP — appears when the user moves the
      cursor toward the browser chrome (desktop) or after a
      timed delay on mobile. Shows once per session.

   ── To enable on a page, add before </body>: ──────────────
   <script src="../js/free-beats-widget.js"></script>   (subpages)
   <script src="js/free-beats-widget.js"></script>      (root)
============================================================ */

(function () {
  'use strict';

  /* ── Admin kill-switch ────────────────────────────────────
     js/remote-config.js sets this synchronously (from cache,
     before this script runs) when the admin disables the widget.
     Fail-open: undefined/missing → widget still works.        */
  if (window.__DC_CONFIG__ && window.__DC_CONFIG__.freeBeatsWidgetEnabled === false) return;

  /* ── URL to the landing page ──────────────────────────────
     Automatically resolves for root (index.html) vs /pages/  */
  var IN_PAGES = window.location.pathname.indexOf('/pages/') !== -1;
  var LANDING  = IN_PAGES ? 'free-beats-landing.html' : 'pages/free-beats-landing.html';

  /* ── Session flags ────────────────────────────────────────
     fb_dismissed  → user closed the tab; skip popup too.
     fb_popup_seen → popup already shown this session.       */
  var DISMISSED_KEY  = 'fb_dismissed';
  var POPUP_SEEN_KEY = 'fb_popup_seen';

  function isDismissed()  { return sessionStorage.getItem(DISMISSED_KEY)  === '1'; }
  function isPopupSeen()  { return sessionStorage.getItem(POPUP_SEEN_KEY) === '1'; }
  function setDismissed() { sessionStorage.setItem(DISMISSED_KEY,  '1'); }
  function setPopupSeen() { sessionStorage.setItem(POPUP_SEEN_KEY, '1'); }


  /* ══════════════════════════════════════════════════════════
     STYLES (injected once — scoped to fb- prefix)
  ══════════════════════════════════════════════════════════ */
  var CSS = [
    /* ── Sticky tab ── */
    '#fb-tab{',
      'position:fixed;left:0;top:50%;transform:translateY(-50%);',
      'z-index:900;display:flex;align-items:center;',
      'transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .3s;',
    '}',
    '#fb-tab.fb-hidden{opacity:0;pointer-events:none;}',

    '.fb-tab-inner{',
      'display:flex;align-items:center;gap:0;',
      'background:#c8a96e;color:#0a0a0a;',
      'border-radius:0 6px 6px 0;',
      'overflow:hidden;',
      'box-shadow:0 4px 24px rgba(200,169,110,.25);',
    '}',

    '.fb-tab-icon{',
      'display:flex;align-items:center;justify-content:center;',
      'width:44px;height:44px;flex-shrink:0;font-size:1.2rem;',
      'background:rgba(0,0,0,.12);',
    '}',

    '.fb-tab-label{',
      'max-width:0;overflow:hidden;white-space:nowrap;',
      'font-family:"JetBrains Mono",monospace;font-size:.68rem;',
      'font-weight:600;letter-spacing:.1em;text-transform:uppercase;',
      'transition:max-width .35s cubic-bezier(.16,1,.3,1),padding .35s;',
      'padding:0;',
    '}',

    '#fb-tab:hover .fb-tab-label{max-width:160px;padding:0 14px 0 8px;}',

    '.fb-tab-dismiss{',
      'position:absolute;top:-6px;right:-6px;',
      'width:18px;height:18px;border-radius:50%;',
      'background:#0a0a0a;color:#c8a96e;',
      'font-size:.65rem;line-height:18px;text-align:center;',
      'cursor:pointer;opacity:0;transition:opacity .2s;',
      'border:1px solid rgba(200,169,110,.4);',
    '}',
    '#fb-tab:hover .fb-tab-dismiss{opacity:1;}',

    /* ── Exit popup overlay ── */
    '#fb-overlay{',
      'position:fixed;inset:0;z-index:9999;',
      'background:rgba(0,0,0,.75);backdrop-filter:blur(6px);',
      'display:flex;align-items:center;justify-content:center;',
      'padding:1.5rem;',
      'opacity:0;pointer-events:none;',
      'transition:opacity .3s ease;',
    '}',
    '#fb-overlay.fb-visible{opacity:1;pointer-events:auto;}',

    '#fb-modal{',
      'position:relative;width:100%;max-width:460px;',
      'background:#111111;',
      'border:1px solid rgba(255,255,255,.08);border-radius:6px;',
      'padding:2.5rem 2rem 2rem;',
      'text-align:center;',
      'transform:translateY(20px);transition:transform .35s cubic-bezier(.16,1,.3,1);',
    '}',
    '#fb-modal::before{',
      'content:"";position:absolute;top:0;left:0;right:0;height:2px;',
      'background:linear-gradient(90deg,transparent,#c8a96e,transparent);',
    '}',
    '#fb-overlay.fb-visible #fb-modal{transform:translateY(0);}',

    '#fb-close{',
      'position:absolute;top:.9rem;right:.9rem;',
      'background:none;border:none;cursor:pointer;',
      'color:rgba(255,255,255,.3);font-size:1.2rem;line-height:1;',
      'transition:color .2s;padding:4px;',
    '}',
    '#fb-close:hover{color:rgba(255,255,255,.7);}',

    '.fb-modal-icon{font-size:2.4rem;margin-bottom:1rem;display:block;}',

    '.fb-modal-tag{',
      'display:inline-block;',
      'font-family:"JetBrains Mono",monospace;font-size:.6rem;',
      'letter-spacing:.2em;text-transform:uppercase;',
      'color:#c8a96e;background:rgba(200,169,110,.1);',
      'padding:3px 10px;border-radius:2px;margin-bottom:1rem;',
    '}',

    '.fb-modal-title{',
      'font-family:"Syne",sans-serif;font-size:clamp(1.5rem,5vw,2.1rem);',
      'font-weight:800;letter-spacing:-.02em;line-height:1.1;',
      'color:#f0ece4;margin-bottom:.75rem;',
    '}',

    '.fb-modal-desc{',
      'font-size:.9rem;line-height:1.65;',
      'color:#8a8278;margin-bottom:1.75rem;',
    '}',

    '.fb-modal-cta{',
      'display:inline-flex;align-items:center;gap:10px;',
      'background:#c8a96e;color:#0a0a0a;',
      'font-family:"JetBrains Mono",monospace;font-size:.75rem;',
      'font-weight:600;letter-spacing:.12em;text-transform:uppercase;',
      'padding:.9rem 2rem;border-radius:3px;text-decoration:none;',
      'transition:background .2s;display:block;margin:0 auto 1rem;',
    '}',
    '.fb-modal-cta:hover{background:#dfc28e;}',

    '.fb-modal-skip{',
      'font-family:"JetBrains Mono",monospace;font-size:.65rem;',
      'letter-spacing:.08em;color:rgba(255,255,255,.25);',
      'cursor:pointer;background:none;border:none;',
      'transition:color .2s;',
    '}',
    '.fb-modal-skip:hover{color:rgba(255,255,255,.45);}',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);


  /* ══════════════════════════════════════════════════════════
     STICKY TAB
  ══════════════════════════════════════════════════════════ */
  var tabHTML = [
    '<div id="fb-tab"' + (isDismissed() ? ' class="fb-hidden"' : '') + '>',
      '<a href="' + LANDING + '" class="fb-tab-inner" aria-label="Get 10 free beats">',
        '<span class="fb-tab-icon">🎧</span>',
        '<span class="fb-tab-label">10 Free Beats</span>',
      '</a>',
      '<span class="fb-tab-dismiss" id="fb-tab-dismiss" role="button" aria-label="Dismiss" title="Dismiss">✕</span>',
    '</div>',
  ].join('');

  document.body.insertAdjacentHTML('beforeend', tabHTML);

  document.getElementById('fb-tab-dismiss').addEventListener('click', function () {
    setDismissed();
    var tab = document.getElementById('fb-tab');
    tab.classList.add('fb-hidden');
  });


  /* ══════════════════════════════════════════════════════════
     EXIT-INTENT POPUP
  ══════════════════════════════════════════════════════════ */
  var popupHTML = [
    '<div id="fb-overlay" role="dialog" aria-modal="true" aria-label="Free beats offer">',
      '<div id="fb-modal">',
        '<button id="fb-close" aria-label="Close">✕</button>',
        '<span class="fb-modal-icon">🎧</span>',
        '<span class="fb-modal-tag">Limited offer</span>',
        '<p class="fb-modal-title">Wait — Before You Go.</p>',
        '<p class="fb-modal-desc">',
          'Grab <strong style="color:#f0ece4">10 free, industry-ready beats</strong> ',
          'straight to your inbox.<br>No credit card. No catch.',
        '</p>',
        '<a href="' + LANDING + '" class="fb-modal-cta">Get My 10 Free Beats →</a>',
        '<button class="fb-modal-skip" id="fb-skip">No thanks, I\'ll pass</button>',
      '</div>',
    '</div>',
  ].join('');

  document.body.insertAdjacentHTML('beforeend', popupHTML);

  var overlay = document.getElementById('fb-overlay');

  function showPopup() {
    if (isPopupSeen() || isDismissed()) return;
    setPopupSeen();
    overlay.classList.add('fb-visible');
    document.body.style.overflow = 'hidden';
  }

  function hidePopup() {
    overlay.classList.remove('fb-visible');
    document.body.style.overflow = '';
  }

  document.getElementById('fb-close').addEventListener('click', hidePopup);
  document.getElementById('fb-skip').addEventListener('click', hidePopup);

  /* Close on overlay background click */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hidePopup();
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hidePopup();
  });


  /* ── Exit-intent trigger (desktop) ────────────────────────
     Fires when mouse leaves viewport toward browser chrome.  */
  var exitBound = false;
  function setupExitIntent() {
    if (exitBound) return;
    exitBound = true;
    /* document.documentElement is more reliable than document across browsers */
    document.documentElement.addEventListener('mouseleave', function (e) {
      if (e.clientY < 10) showPopup();
    });
  }

  /* ── Mobile / timed fallback ───────────────────────────────
     On touch devices, show popup after 50s of engagement
     if user hasn't already seen it.                          */
  var isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (isMobile) {
    setTimeout(function () { showPopup(); }, 50000);
  } else {
    /* Small delay so exit intent doesn't fire on page load */
    setTimeout(setupExitIntent, 3000);
  }

})();
