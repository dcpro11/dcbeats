/**
 * DC Beats — Admin Remote Config backend (Google Apps Script)
 *
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * The deployed /exec URL is the single endpoint for both reads (GET)
 * and writes (POST). See pages/admin.html and js/remote-config.js for
 * the consumers of this API.
 *
 * Script Properties required (Project Settings → Script Properties):
 *   ADMIN_PASSWORD  — shared secret checked on every write
 *   CONFIG_JSON     — seed JSON blob (paste DEFAULT_CONFIG below as the initial value)
 */

var DEFAULT_CONFIG = {
  version: 1,
  promoBanner: {
    active: false,
    text: '<strong>Limited Time:</strong> Buy 2 Beats, Get 1 Free — applies automatically at checkout.',
    ctaLabel: 'Shop Now →',
    ctaHref: '#beats'
  },
  maintenanceNotice: {
    active: false,
    text: "We're performing scheduled maintenance — some features may be temporarily unavailable.",
    icon: '⚠'
  },
  freeBeatsWidget: { enabled: true },
  gamesConfig: {
    spinTheWheel: { active: false, startDate: '', endDate: '' },
    scratchCard:  { active: false, startDate: '', endDate: '' }
  },
  heroStats: {
    beatsAvailable: '150+',
    yearsExperience: '10+',
    artistsPurchased: '120+'
  },
  contactEmail: 'info@dcbeats.net',
  socialProof: {
    enabled: true,
    intervalSeconds: 30
  },
  licensePrices: {
    basic: '$29.99',
    professional: '$59.99',
    unlimited: '$99.99',
    exclusive: 'From $299.99+'
  }
};

var MAX_ATTEMPTS_PER_MINUTE = 5;

function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var json = props.getProperty('CONFIG_JSON');
  if (!json) {
    json = JSON.stringify(DEFAULT_CONFIG);
    props.setProperty('CONFIG_JSON', json);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result;
  try {
    var payload = JSON.parse(e.postData.contents);
    result = handleWrite(payload);
  } catch (err) {
    result = { ok: false, error: 'Invalid request: ' + err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleWrite(payload) {
  var props = PropertiesService.getScriptProperties();
  var adminPassword = props.getProperty('ADMIN_PASSWORD');

  if (isRateLimited()) {
    return { ok: false, error: 'Too many attempts. Try again in a minute.' };
  }

  if (!payload || payload.password !== adminPassword) {
    recordAttempt();
    return { ok: false, error: 'Incorrect password.' };
  }

  // Login screen sends { password, action: 'validate' } to check the
  // password before revealing the dashboard — no config write happens.
  if (payload.action === 'validate') {
    return { ok: true };
  }

  if (!payload.config || typeof payload.config !== 'object') {
    return { ok: false, error: 'Missing config payload.' };
  }

  var json = JSON.stringify(payload.config);
  props.setProperty('CONFIG_JSON', json);
  return { ok: true, config: payload.config };
}

/* ── Naive rate limiting via CacheService (per-deployment, ~1 min window) ── */
function isRateLimited() {
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get('login_attempts') || 0);
  return count >= MAX_ATTEMPTS_PER_MINUTE;
}

function recordAttempt() {
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get('login_attempts') || 0);
  cache.put('login_attempts', String(count + 1), 60); // expires after 60s
}
