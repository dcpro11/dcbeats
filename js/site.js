/* ============================================================
   DC BEATS — site.js  |  Shared components
   ============================================================
   Single source of truth for the navigation, footer and
   cookie banner. Every page includes this file and gets
   those components injected at runtime, so you only ever
   edit ONE place when the nav or footer needs to change.

   ── HOW TO ADD A NEW PAGE ───────────────────────────────────
   1. Copy  pages/_template.html  →  pages/your-page.html
   2. Fill in the <head> meta tags and page content
   3. If it belongs in the footer, add an entry to
      FOOTER_SERVICES or FOOTER_LEGAL below
   4. Add the URL to  sitemap.xml

   ── HOW TO REMOVE A PAGE ────────────────────────────────────
   1. Delete the HTML file
   2. Remove its entry from FOOTER_SERVICES or FOOTER_LEGAL
   3. Remove it from  sitemap.xml

   ── HOW TO CHANGE NAV LINKS ─────────────────────────────────
   Edit NAV_LINKS. Each entry is either:
     { label, type: 'anchor', id }  → scrolls to #id on homepage
     { label, type: 'page', href }  → links to pages/href
============================================================ */

(function () {
  'use strict';

  /* ── Path detection ─────────────────────────────────────────
     Works for any depth under /pages/ — e.g. pages/x.html (depth 1)
     or pages/blog/x.html (depth 2). ROOT always reaches site root;
     TO_PAGES always reaches the /pages/ directory.            */
  var IN_PAGES = window.location.pathname.indexOf('/pages/') !== -1;
  var ROOT, TO_PAGES;
  if (IN_PAGES) {
    var _depth = window.location.pathname.split('/pages/')[1].split('/').length;
    ROOT     = new Array(_depth + 1).join('../');          // '../' at depth 1, '../../' at depth 2
    TO_PAGES = _depth > 1 ? new Array(_depth).join('../') : ''; // '' at depth 1, '../' at depth 2
  } else {
    ROOT     = '';
    TO_PAGES = 'pages/';
  }


  /* ── Navigation links (top bar) ─────────────────────────────
     These appear in the main nav on every page.
     Add / remove / reorder freely.                            */
  var NAV_LINKS = [
    { label: 'Beats',    type: 'anchor', id: 'beats'    },
    { label: 'Services', type: 'anchor', id: 'services' },
    { label: 'Blog',     type: 'page',   href: 'blog.html' },
  ];

  var NAV_MORE = [
    { label: 'Licensing',    type: 'anchor', id: 'licensing'              },
    { label: 'Mix & Master', type: 'page',   href: 'mixing-mastering.html' },
    { label: 'Tools',        type: 'page',   href: 'tools.html'            },
    { label: 'About',        type: 'anchor', id: 'about'                  },
    { label: 'Contact',      type: 'anchor', id: 'contact'                },
  ];


  /* ── Footer columns ─────────────────────────────────────────
     FOOTER_SERVICES  — edit to add / remove service pages
     FOOTER_LEGAL     — edit to add / remove legal pages
     type 'anchor'    → scrolls to homepage section
     type 'page'      → links to a file in /pages/            */
  var FOOTER_SERVICES = [
    { label: 'Custom Beats',       type: 'anchor', id: 'services' },
    { label: 'Mixing & Mastering', type: 'page',   href: 'mixing-mastering.html' },
  ];

  var FOOTER_LEGAL = [
    { label: 'Privacy Policy', type: 'page', href: 'privacy-policy.html' },
    { label: 'Terms of Use',   type: 'page', href: 'terms-of-use.html'   },
    { label: 'Refund Policy',  type: 'page', href: 'refund-policy.html'  },
  ];

  var FOOTER_TOOLS = [
    { label: 'Blog',               type: 'page', href: 'blog.html'              },
    { label: 'BPM & Key Finder',   type: 'page', href: 'bpm-key-finder.html'   },
    { label: 'Loudness Analyzer',  type: 'page', href: 'loudness-analyzer.html' },
  ];


  /* ── Social links ───────────────────────────────────────────
     Update hrefs here — changes apply site-wide.             */
  var SOCIAL = [
    { label: 'Instagram', href: 'https://www.instagram.com/dcbeats.official' },
    { label: 'YouTube',   href: 'https://www.youtube.com/@DCBeatsOfficial'   },
    { label: 'TikTok',    href: 'https://www.tiktok.com/@dc.beats'           },
  ];


  /* ── Link resolver ──────────────────────────────────────────
     Converts a link config object to a usable href string.   */
  function href(item) {
    if (item.type === 'anchor') {
      /* On homepage use plain hash; on subpages prefix with ../index.html */
      return IN_PAGES
        ? ROOT + 'index.html#' + item.id
        : '#' + item.id;
    }
    return TO_PAGES + item.href;
  }


  /* ── Build a footer column ──────────────────────────────────  */
  function footerCol(title, items) {
    var links = items.map(function (item) {
      return '<li><a href="' + href(item) + '">' + item.label + '</a></li>';
    }).join('');
    return (
      '<div class="footer-nav-col">' +
        '<h4>' + title + '</h4>' +
        '<ul>' + links + '</ul>' +
      '</div>'
    );
  }


  /* ── NAV HTML ───────────────────────────────────────────────  */
  var logoHref = IN_PAGES ? ROOT + 'index.html' : '#hero';

  var navItems = NAV_LINKS.map(function (item) {
    return '<li><a href="' + href(item) + '">' + item.label + '</a></li>';
  }).join('');

  var moreItems = NAV_MORE.map(function (item) {
    return '<a href="' + href(item) + '">' + item.label + '</a>';
  }).join('');

  var NAV_HTML = (
    '<div class="container">' +
      '<a href="' + logoHref + '" class="nav-logo" aria-label="DC Beats — Home">' +
        '<img src="' + ROOT + 'assets/logo.png" alt="DC Beats" width="120" height="40" />' +
      '</a>' +
      '<ul class="nav-links" role="list">' +
        navItems +
        '<li class="nav-more">' +
          '<button class="nav-more-btn" aria-haspopup="true" aria-expanded="false">More <span class="nav-more-arrow">▾</span></button>' +
          '<div class="nav-more-menu" role="menu">' +
            moreItems +
          '</div>' +
        '</li>' +
        '<li><a href="' + href({ type: 'page', href: 'beatstore.html' }) + '" class="nav-cta">Shop Now</a></li>' +
      '</ul>' +
      '<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</div>'
  );


  /* ── FOOTER HTML ────────────────────────────────────────────  */
  var socialLinks = SOCIAL.map(function (s) {
    return '<a href="' + s.href + '" target="_blank" rel="noopener">' + s.label + '</a>';
  }).join('');

  var storeCol = footerCol('Store', [
    { label: 'Browse Beats', type: 'page',   href: 'beatstore.html'      },
    { label: 'Licensing',    type: 'anchor', id:   'licensing'           },
  ]);

  var FOOTER_HTML = (
    '<div class="container">' +
      '<div class="footer-top">' +
        '<div>' +
          '<a href="' + logoHref + '" class="footer-logo" aria-label="DC Beats — Home">' +
            '<img src="' + ROOT + 'assets/logo.png" alt="DC Beats" width="120" height="40" loading="lazy" />' +
          '</a>' +
          '<p class="footer-tagline">Industry Ready Beats · Portugal</p>' +
        '</div>' +
        '<nav class="footer-nav" aria-label="Footer navigation">' +
          storeCol +
          footerCol('Services', FOOTER_SERVICES) +
          footerCol('Tools', FOOTER_TOOLS) +
          footerCol('Legal', FOOTER_LEGAL) +
        '</nav>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<button class="cookie-reopen-btn" aria-label="Manage cookie preferences">Cookie Preferences</button>' +
        '<p class="footer-copy">' +
          '&copy; <span id="year"></span> DC Beats. All rights reserved.' +
        '</p>' +
        '<div class="footer-social">' + socialLinks + '</div>' +
      '</div>' +
    '</div>'
  );


  /* ── COOKIE BANNER + MODAL HTML ─────────────────────────────
     Injected into every page so consent can be managed from
     anywhere on the site. Wired up by js/cookies.js.         */
  var privacyHref = TO_PAGES + 'privacy-policy.html#s6';

  var COOKIE_HTML = (
    '<div id="cookie-banner" role="dialog" aria-label="Cookie consent" aria-live="polite">' +
      '<div class="cookie-inner">' +
        '<div class="cookie-text">' +
          '<p>We use cookies to improve your experience, analyse site traffic and serve relevant ads. ' +
          'By clicking <strong style="color:#f0ece4;">Accept All</strong>, you consent to our use of ' +
          '<a href="' + privacyHref + '">Analytics and Advertising cookies</a>. ' +
          'You can manage your preferences at any time.</p>' +
        '</div>' +
        '<div class="cookie-actions">' +
          '<button id="cookie-accept-all">Accept All</button>' +
          '<button id="cookie-essential-only">Essential Only</button>' +
          '<button id="cookie-manage">Manage</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div id="cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie preferences">' +
      '<div class="cookie-modal-box">' +
        '<button id="cookie-modal-close" class="cookie-modal-close" aria-label="Close">&times;</button>' +
        '<h2 class="cookie-modal-title">Cookie Preferences</h2>' +
        '<p class="cookie-modal-desc">Choose which cookies you allow. Essential cookies cannot be ' +
          'disabled as they are required for the site to function. Your preferences are saved and ' +
          'can be changed at any time.</p>' +

        '<div class="cookie-category">' +
          '<div class="cookie-category-info">' +
            '<h3>Essential <span class="cookie-required-badge">Always on</span></h3>' +
            '<p>Required for core site functionality — navigation, security and the store embed. No personal data collected.</p>' +
          '</div>' +
          '<label class="cookie-toggle" aria-label="Essential cookies — always enabled">' +
            '<input type="checkbox" checked disabled />' +
            '<span class="cookie-toggle-slider"></span>' +
          '</label>' +
        '</div>' +

        '<div class="cookie-category">' +
          '<div class="cookie-category-info">' +
            '<h3>Analytics (Google Analytics)</h3>' +
            '<p>Helps understand how visitors use the site — pages visited, session duration and traffic sources. Data is anonymised.</p>' +
          '</div>' +
          '<label class="cookie-toggle" aria-label="Analytics cookies">' +
            '<input type="checkbox" id="toggle-analytics" />' +
            '<span class="cookie-toggle-slider"></span>' +
          '</label>' +
        '</div>' +

        '<div class="cookie-category">' +
          '<div class="cookie-category-info">' +
            '<h3>Advertising (Google Ads)</h3>' +
            '<p>Used to measure ad campaign performance and show you relevant ads on other platforms. Managed via Google Tag Manager.</p>' +
          '</div>' +
          '<label class="cookie-toggle" aria-label="Advertising cookies">' +
            '<input type="checkbox" id="toggle-ads" />' +
            '<span class="cookie-toggle-slider"></span>' +
          '</label>' +
        '</div>' +

        '<div style="margin-top:1.5rem; text-align:right;">' +
          '<button id="cookie-save-prefs" class="btn btn-primary" style="font-size:0.8rem; padding:0.7rem 1.5rem;">' +
            'Save Preferences' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );


  /* ── Inject into DOM ────────────────────────────────────────
     Runs synchronously (script is at bottom of <body>) so
     all elements are available to cookies.js and main.js.    */
  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  inject('nav',    NAV_HTML);
  inject('footer', FOOTER_HTML);

  /* Inject cookie banner only if not already in the page */
  if (!document.getElementById('cookie-banner')) {
    document.body.insertAdjacentHTML('beforeend', COOKIE_HTML);
  }

  /* Set copyright year */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
