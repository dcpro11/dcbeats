/* ============================================================
   DC BEATS — Cookie Consent Manager
   ============================================================
   GDPR compliant cookie consent for EU visitors.
   Integrates with Google Tag Manager (GTM).

   HOW IT WORKS:
   1. On first visit, the banner slides up.
   2. User chooses: Accept All / Essential Only / Manage.
   3. Consent is stored in localStorage under 'dc_cookie_consent'.
   4. Google Tag Manager is loaded ONLY after Analytics and/or
      Ads consent is granted (via consent mode v2 signals).
   5. On subsequent visits, consent is read and GTM fires
      immediately with the correct consent state.

   SETUP (one-time):
   - Replace 'GTM-XXXXXXX' below with your actual GTM container ID.
   - In GTM, configure GA4 and Google Ads tags to fire based on
     consent triggers (use built-in Consent State variables).
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ── */
  const GTM_ID      = 'GTM-XXXXXXX'; // ← Replace with your GTM ID
  const STORAGE_KEY = 'dc_cookie_consent';
  const CONSENT_VER = 1; // increment if policy changes

  /* ── State ── */
  let consent = {
    version:     CONSENT_VER,
    essential:   true,   // always true — cannot be disabled
    analytics:   false,
    advertising: false,
    timestamp:   null,
  };


  /* ════════════════════════════════════════════════════════
     GOOGLE CONSENT MODE v2 — sends signals to GTM / Google
  ════════════════════════════════════════════════════════ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function pushConsentToGTM(mode) {
    // mode: 'default' (on page load) or 'update' (after user choice)
    gtag('consent', mode, {
      analytics_storage:          consent.analytics   ? 'granted' : 'denied',
      ad_storage:                 consent.advertising ? 'granted' : 'denied',
      ad_user_data:               consent.advertising ? 'granted' : 'denied',
      ad_personalization:         consent.advertising ? 'granted' : 'denied',
      functionality_storage:      'granted',
      personalization_storage:    'denied',
      security_storage:           'granted',
      wait_for_update:            500,
    });
  }

  function loadGTM() {
    // Inject GTM script once
    if (document.getElementById('gtm-script')) return;
    const s = document.createElement('script');
    s.id    = 'gtm-script';
    s.async = true;
    s.src   = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(s);

    // GTM noscript fallback — inject into body
    const ns = document.createElement('noscript');
    ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.prepend(ns);
  }


  /* ════════════════════════════════════════════════════════
     STORAGE — save / load consent from localStorage
  ════════════════════════════════════════════════════════ */
  function saveConsent() {
    consent.timestamp = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}
  }

  function loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Invalidate if policy version changed
      if (parsed.version !== CONSENT_VER) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }


  /* ════════════════════════════════════════════════════════
     BANNER & MODAL — DOM references (set after DOMContentLoaded)
  ════════════════════════════════════════════════════════ */
  let banner, modal, toggleAnalytics, toggleAds;

  function hideBanner() {
    banner.classList.remove('visible');
  }

  function showBanner() {
    // Slight delay so it doesn't flash instantly on load
    setTimeout(() => banner.classList.add('visible'), 600);
  }

  function openModal() {
    // Sync toggles to current consent state
    if (toggleAnalytics)  toggleAnalytics.checked  = consent.analytics;
    if (toggleAds)        toggleAds.checked         = consent.advertising;
    modal.classList.add('visible');
  }

  function closeModal() {
    modal.classList.remove('visible');
  }


  /* ════════════════════════════════════════════════════════
     CONSENT ACTIONS
  ════════════════════════════════════════════════════════ */
  function applyConsent(analytics, advertising) {
    consent.analytics   = analytics;
    consent.advertising = advertising;
    saveConsent();
    pushConsentToGTM('update');
    loadGTM();
    hideBanner();
    closeModal();
  }

  function acceptAll() {
    applyConsent(true, true);
  }

  function essentialOnly() {
    applyConsent(false, false);
  }

  function savePreferences() {
    const ana = toggleAnalytics  ? toggleAnalytics.checked  : false;
    const ads = toggleAds        ? toggleAds.checked         : false;
    applyConsent(ana, ads);
  }


  /* ════════════════════════════════════════════════════════
     INIT — runs on DOMContentLoaded
  ════════════════════════════════════════════════════════ */
  function init() {
    banner          = document.getElementById('cookie-banner');
    modal           = document.getElementById('cookie-modal');
    toggleAnalytics = document.getElementById('toggle-analytics');
    toggleAds       = document.getElementById('toggle-ads');

    if (!banner || !modal) return;

    // Button listeners
    document.getElementById('cookie-accept-all')
      ?.addEventListener('click', acceptAll);

    document.getElementById('cookie-essential-only')
      ?.addEventListener('click', essentialOnly);

    document.getElementById('cookie-manage')
      ?.addEventListener('click', openModal);

    document.getElementById('cookie-save-prefs')
      ?.addEventListener('click', savePreferences);

    document.getElementById('cookie-modal-close')
      ?.addEventListener('click', closeModal);

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // "Cookie Preferences" reopen buttons (footer etc.)
    document.querySelectorAll('.cookie-reopen-btn')
      .forEach(btn => btn.addEventListener('click', openModal));

    // Check existing consent
    const saved = loadConsent();

    if (saved) {
      // Returning visitor — apply saved consent silently
      consent = saved;
      pushConsentToGTM('default');
      loadGTM();
    } else {
      // First visit — push denied defaults, then show banner
      pushConsentToGTM('default');
      showBanner();
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
