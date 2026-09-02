(function () {
  'use strict';

  var PROOFS = [
    { country: 'United States', flag: '🇺🇸', license: 'Basic Lease',         time: '2 minutes ago'  },
    { country: 'France',        flag: '🇫🇷', license: 'Professional Lease',   time: '4 hours ago'    },
    { country: 'United Kingdom',flag: '🇬🇧', license: 'Basic Lease',          time: '18 minutes ago' },
    { country: 'Germany',       flag: '🇩🇪', license: 'Unlimited Lease',      time: '1 day ago'      },
    { country: 'United States', flag: '🇺🇸', license: 'Professional Lease',   time: '37 minutes ago' },
    { country: 'Canada',        flag: '🇨🇦', license: 'Professional Lease',   time: '3 hours ago'    },
    { country: 'United States', flag: '🇺🇸', license: 'Basic Lease',          time: '52 minutes ago' },
    { country: 'Spain',         flag: '🇪🇸', license: 'Basic Lease',          time: '6 hours ago'    },
    { country: 'Italy',         flag: '🇮🇹', license: 'Professional Lease',   time: '2 days ago'     },
    { country: 'Netherlands',   flag: '🇳🇱', license: 'Exclusive Rights',     time: '8 minutes ago'  },
    { country: 'United States', flag: '🇺🇸', license: 'Unlimited Lease',      time: '1 hour ago'     },
    { country: 'Mexico',        flag: '🇲🇽', license: 'Basic Lease',          time: '45 minutes ago' },
    { country: 'United States', flag: '🇺🇸', license: 'Basic Lease',          time: '12 hours ago'   },
    { country: 'Nigeria',       flag: '🇳🇬', license: 'Professional Lease',   time: '3 days ago'     },
    { country: 'United States', flag: '🇺🇸', license: 'Professional Lease',   time: 'just now'       },
    { country: 'Poland',        flag: '🇵🇱', license: 'Professional Lease',   time: '7 hours ago'    },
    { country: 'South Africa',  flag: '🇿🇦', license: 'Unlimited Lease',      time: '2 hours ago'    },
    { country: 'United States', flag: '🇺🇸', license: 'Basic Lease',          time: '30 minutes ago' },
    { country: 'Norway',        flag: '🇳🇴', license: 'Exclusive Rights',     time: '5 hours ago'    },
    { country: 'Belgium',       flag: '🇧🇪', license: 'Basic Lease',          time: '22 minutes ago' },
    { country: 'United States', flag: '🇺🇸', license: 'Unlimited Lease',      time: '1 day ago'      },
    { country: 'Japan',         flag: '🇯🇵', license: 'Professional Lease',   time: '14 hours ago'   },
    { country: 'United States', flag: '🇺🇸', license: 'Basic Lease',          time: '9 hours ago'    },
    { country: 'Denmark',       flag: '🇩🇰', license: 'Professional Lease',   time: '4 days ago'     },
    { country: 'United States', flag: '🇺🇸', license: 'Professional Lease',   time: '11 minutes ago' },
    { country: 'Switzerland',   flag: '🇨🇭', license: 'Exclusive Rights',     time: '3 hours ago'    },
    { country: 'Brazil',        flag: '🇧🇷', license: 'Unlimited Lease',      time: '55 minutes ago' },
    { country: 'United Kingdom',flag: '🇬🇧', license: 'Basic Lease',          time: '2 hours ago'    },
    { country: 'United States', flag: '🇺🇸', license: 'Unlimited Lease',      time: '6 days ago'     },
    { country: 'Canada',        flag: '🇨🇦', license: 'Unlimited Lease',      time: '16 minutes ago' },
  ];

  /* ── Admin overrides ──────────────────────────────────────
     js/remote-config.js applies cached config synchronously
     before this script runs (see script load order). Falls back
     to sensible defaults if the admin hasn't configured this. */
  var spCfg = (window.__DC_CONFIG__ && window.__DC_CONFIG__.config && window.__DC_CONFIG__.config.socialProof) || {};
  if (spCfg.enabled === false) return;

  var SHOW_DURATION  = 5000;                                              // ms visible
  var CYCLE_INTERVAL = (Number(spCfg.intervalSeconds) || 30) * 1000;      // ms between popups
  var INITIAL_DELAY  = 8000;                                              // ms before first popup

  var exclusiveIdx  = [];
  var regularIdx    = [];
  PROOFS.forEach(function (p, i) {
    if (p.license === 'Exclusive Rights') exclusiveIdx.push(i);
    else regularIdx.push(i);
  });

  var pool    = [];
  var current = -1;

  function shuffle(arr) {
    return arr.slice().sort(function () { return Math.random() - 0.5; });
  }

  // Build a cycle that places 1 exclusive roughly every 10 entries,
  // so the 3 exclusives land at positions ~9, ~19, ~29 (never back-to-back).
  function buildPool() {
    var ex  = shuffle(exclusiveIdx);   // 3 items
    var reg = shuffle(regularIdx);     // 27 items
    var result = [];
    var slot = 0;
    var exUsed = 0;
    while (result.length < PROOFS.length) {
      // Insert one exclusive at every 10th slot (slot 9, 19, 29)
      if ((slot + 1) % 10 === 0 && exUsed < ex.length) {
        result.push(ex[exUsed++]);
      } else {
        result.push(reg.shift());
      }
      slot++;
    }
    return result.reverse(); // reverse so pop() goes front-to-back
  }

  function nextIndex() {
    if (pool.length === 0) pool = buildPool();
    var idx;
    do { idx = pool.pop(); } while (idx === current && pool.length > 0);
    current = idx;
    return idx;
  }

  function createWidget() {
    var el = document.createElement('div');
    el.id = 'sp-widget';
    el.innerHTML =
      '<div id="sp-inner">' +
        '<div id="sp-icon">🛒</div>' +
        '<div id="sp-text">' +
          '<span id="sp-line1"></span>' +
          '<span id="sp-line2"></span>' +
        '</div>' +
        '<button id="sp-close" aria-label="Dismiss">✕</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('sp-close').addEventListener('click', function () {
      hide(true);
    });

    return el;
  }

  var widget, timer, cycleTimer;

  function show() {
    var proof = PROOFS[nextIndex()];
    var line1 = document.getElementById('sp-line1');
    var line2 = document.getElementById('sp-line2');
    if (!line1) return;
    line1.textContent = proof.flag + ' User from ' + proof.country + ' purchased';
    line2.textContent = proof.license + ' · ' + proof.time;
    widget.classList.add('sp-visible');
    clearTimeout(timer);
    timer = setTimeout(function () { hide(false); }, SHOW_DURATION);
  }

  function hide(permanent) {
    widget.classList.remove('sp-visible');
    clearTimeout(timer);
    if (permanent) {
      clearTimeout(cycleTimer);
    }
  }

  function cycle() {
    show();
    cycleTimer = setTimeout(cycle, CYCLE_INTERVAL);
  }

  document.addEventListener('DOMContentLoaded', function () {
    widget = createWidget();
    setTimeout(cycle, INITIAL_DELAY);
  });
})();
