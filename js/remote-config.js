/* ============================================================
   DC BEATS — remote-config.js
   ============================================================
   Fetches admin-managed settings (promo banner, maintenance
   notice, free-beats widget toggle, hero stats, contact email,
   games scheduling) from a Google Apps Script Web App and
   applies them to the page.

   ── HOW TO POINT THIS AT YOUR APPS SCRIPT ──────────────────
   Replace CONFIG_URL below with your deployed /exec URL.
   See apps-script/Code.gs for the backend and pages/admin.html
   for the management UI.

   Cache-first: applies cached config synchronously (no network
   wait, no flash of default content), then ALWAYS re-fetches in
   the background and re-applies — so admin changes show up on the
   very next page load, typically within a second. If the Apps
   Script is unreachable, falls back to safe "everything off"
   defaults — the live site must never look broken because of it.
============================================================ */

(function () {
  'use strict';

  var CONFIG_URL = 'https://script.google.com/macros/s/AKfycbwn1ANfBybhKbf6eiWHmCkva__4aqc98-kccamF9Ix79SwWMn_6fhKC7lwOpEoT5di4qA/exec';
  var CACHE_KEY  = 'dc_remote_config';

  var DEFAULTS = {
    version: 1,
    promoBanner:       { active: false, text: '', ctaLabel: '', ctaHref: '#beats' },
    maintenanceNotice: { active: false, text: '', icon: '⚠' },
    freeBeatsWidget:   { enabled: true },
    gamesConfig: {
      spinTheWheel: { active: false, startDate: '', endDate: '' },
      scratchCard:  { active: false, startDate: '', endDate: '' }
    },
    heroStats:    { beatsAvailable: '', yearsExperience: '', artistsPurchased: '' },
    contactEmail: '',
    socialProof:  { enabled: true, intervalSeconds: 30 },
    licensePrices: { basic: '', professional: '', unlimited: '', exclusive: '' }
  };

  window.__DC_CONFIG__ = window.__DC_CONFIG__ || {};
  window.__DC_CONFIG__.freeBeatsWidgetEnabled = true; // fail-open until config applies

  /* ── Cache helpers ──────────────────────────────────────── */
  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.data || !parsed.fetchedAt) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, fetchedAt: Date.now() }));
    } catch (e) { /* localStorage unavailable — ignore, fetch-on-every-load is fine */ }
  }

  /* ── Maintenance notice — injected once, then driven by data-active ──
     (mirrors the existing #promo-banner / MutationObserver pattern in main.js) */
  var noticeEl = null;

  function ensureNotice() {
    if (noticeEl) return noticeEl;
    noticeEl = document.createElement('div');
    noticeEl.id = 'maintenance-notice';
    noticeEl.setAttribute('data-active', 'false');
    noticeEl.innerHTML =
      '<div class="maintenance-notice-inner">' +
        '<span class="maintenance-notice-icon" aria-hidden="true"></span>' +
        '<p class="maintenance-notice-text"></p>' +
      '</div>';
    var banner = document.getElementById('promo-banner');
    if (banner && banner.parentNode) {
      banner.parentNode.insertBefore(noticeEl, banner.nextSibling);
    } else {
      document.body.insertBefore(noticeEl, document.body.firstChild);
    }
    return noticeEl;
  }

  /* ── Apply config to the DOM ────────────────────────────── */
  function applyConfig(cfg) {
    cfg = cfg || DEFAULTS;

    /* Promo banner — remote-config writes the attribute/content,
       the existing MutationObserver in main.js reacts to it */
    var promo = cfg.promoBanner || DEFAULTS.promoBanner;
    var bannerEl = document.getElementById('promo-banner');
    if (bannerEl) {
      bannerEl.setAttribute('data-active', promo.active ? 'true' : 'false');
      var textEl = bannerEl.querySelector('.promo-banner-text');
      var ctaEl  = bannerEl.querySelector('.promo-banner-cta');
      if (textEl && promo.text)     textEl.innerHTML   = promo.text;
      if (ctaEl  && promo.ctaLabel) ctaEl.textContent  = promo.ctaLabel;
      if (ctaEl  && promo.ctaHref)  ctaEl.setAttribute('href', promo.ctaHref);
    }

    /* Maintenance notice — non-blocking, parallel structure to promo banner */
    var maint = cfg.maintenanceNotice || DEFAULTS.maintenanceNotice;
    var notice = ensureNotice();
    notice.setAttribute('data-active', maint.active ? 'true' : 'false');
    var iconEl = notice.querySelector('.maintenance-notice-icon');
    var msgEl  = notice.querySelector('.maintenance-notice-text');
    if (iconEl) iconEl.textContent = maint.icon || '⚠';
    if (msgEl)  msgEl.textContent  = maint.text || '';

    /* Free beats widget — gate read synchronously by free-beats-widget.js
       before it injects anything; fail-open if the key is missing */
    var fbw = cfg.freeBeatsWidget || DEFAULTS.freeBeatsWidget;
    window.__DC_CONFIG__.freeBeatsWidgetEnabled = fbw.enabled !== false;

    /* Hero stats — only present on the homepage */
    var stats = cfg.heroStats || DEFAULTS.heroStats;
    Object.keys(stats).forEach(function (key) {
      if (!stats[key]) return;
      var el = document.querySelector('[data-stat="' + key + '"]');
      if (el) el.textContent = stats[key];
    });

    /* Contact email — element holds the display text; the wrapping
       mailto: link (if any) is updated to match */
    if (cfg.contactEmail) {
      document.querySelectorAll('[data-contact-email]').forEach(function (el) {
        el.textContent = cfg.contactEmail;
        var anchor = el.closest('a[href^="mailto:"]');
        if (anchor) anchor.setAttribute('href', 'mailto:' + cfg.contactEmail);
      });
    }

    /* License prices — display-only marketing copy on the pricing cards */
    var prices = cfg.licensePrices || DEFAULTS.licensePrices;
    Object.keys(prices).forEach(function (key) {
      if (!prices[key]) return;
      var el = document.querySelector('[data-price="' + key + '"]');
      if (el) el.textContent = prices[key];
    });

    /* Social proof — read directly off window.__DC_CONFIG__.config by social-proof.js */

    /* Games scheduling — stored for future game widgets to read */
    window.__DC_CONFIG__.gamesConfig = cfg.gamesConfig || DEFAULTS.gamesConfig;
    window.__DC_CONFIG__.config = cfg;
    window.__DC_CONFIG__.ready = true;
  }

  /* ── Fetch (plain GET — no custom headers, avoids CORS preflight) ── */
  function refresh() {
    try {
      fetch(CONFIG_URL).then(function (res) {
        if (!res.ok) return null;
        return res.json();
      }).then(function (data) {
        if (!data) return;
        writeCache(data);
        applyConfig(data);
      }).catch(function () { /* offline / unreachable — cached or default state stands */ });
    } catch (e) { /* fetch unsupported — ignore */ }
  }

  function init() {
    var cached = readCache();
    if (cached) {
      applyConfig(cached.data); // instant paint from cache — no network wait
    } else {
      applyConfig(DEFAULTS); // fail-safe: nothing active until we hear otherwise
    }
    refresh(); // always check for fresher data in the background, every load
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
