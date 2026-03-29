/* ============================================================
   DC BEATS — Main JavaScript
   Modules:
   1. Nav scroll state
   2. Mobile menu toggle
   3. Scroll reveal (IntersectionObserver)
   4. Hero canvas — ambient gold particle field
   5. Footer year
============================================================ */

document.addEventListener('DOMContentLoaded', () => {


  /* ══════════════════════════════════════════════════════════
     1. NAV — Frosted glass on scroll
  ══════════════════════════════════════════════════════════ */
  const nav = document.getElementById('nav');

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ══════════════════════════════════════════════════════════
     2. MOBILE MENU — Hamburger toggle
  ══════════════════════════════════════════════════════════ */
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     3. SCROLL REVEAL — IntersectionObserver
  ══════════════════════════════════════════════════════════ */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


  /* ══════════════════════════════════════════════════════════
     4. HERO CANVAS — Full-screen dynamic background
     Premium feel: slow vertical light beams that drift
     horizontally across a dark field, with a subtle
     gold particle layer floating above. Atmospheric,
     not distracting — lets the text breathe.
  ══════════════════════════════════════════════════════════ */
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const GOLD      = (a) => `rgba(200, 169, 110, ${a})`;
  const WHITE     = (a) => `rgba(240, 236, 228, ${a})`;

  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();


  /* ── Light beam objects ── */
  const BEAM_COUNT = 7;

  function makeBeam() {
    return {
      x:       Math.random() * W,
      width:   60 + Math.random() * 180,
      speed:   0.08 + Math.random() * 0.18,
      alpha:   0.015 + Math.random() * 0.035,
      hue:     Math.random() > 0.6 ? 'gold' : 'white', // mostly gold, some white
    };
  }

  const beams = Array.from({ length: BEAM_COUNT }, makeBeam);


  /* ── Floating particles ── */
  const PARTICLE_COUNT = 45;

  function makeParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      vy:    -(0.1 + Math.random() * 0.25), // float upward
      size:  0.5 + Math.random() * 1.2,
      alpha: 0.1 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    };
  }

  const particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);


  /* ── Draw a single vertical beam ── */
  function drawBeam(b) {
    const grad = ctx.createLinearGradient(b.x, 0, b.x, H);
    const col  = b.hue === 'gold' ? GOLD : WHITE;
    grad.addColorStop(0,   col(0));
    grad.addColorStop(0.2, col(b.alpha));
    grad.addColorStop(0.5, col(b.alpha * 1.4));
    grad.addColorStop(0.8, col(b.alpha));
    grad.addColorStop(1,   col(0));

    ctx.fillStyle = grad;
    ctx.fillRect(b.x - b.width / 2, 0, b.width, H);
  }


  /* ── Render loop ── */
  function draw(ts) {
    requestAnimationFrame(draw);

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Deep background gradient
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, W * 0.75);
    bg.addColorStop(0,   'rgba(22, 18, 12, 1)');
    bg.addColorStop(0.5, 'rgba(14, 12, 8, 1)');
    bg.addColorStop(1,   'rgba(6, 5, 3, 1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Slow horizontal drift for beams
    beams.forEach(b => {
      b.x += b.speed;
      if (b.x - b.width / 2 > W) {
        b.x = -b.width / 2;
        b.alpha  = 0.015 + Math.random() * 0.035;
        b.width  = 60 + Math.random() * 180;
      }
      drawBeam(b);
    });

    // Subtle horizontal scanline accent — very faint gold line at 40% height
    const lineY = H * 0.4;
    const lineGrad = ctx.createLinearGradient(0, lineY, W, lineY);
    lineGrad.addColorStop(0,    GOLD(0));
    lineGrad.addColorStop(0.3,  GOLD(0.04));
    lineGrad.addColorStop(0.5,  GOLD(0.07));
    lineGrad.addColorStop(0.7,  GOLD(0.04));
    lineGrad.addColorStop(1,    GOLD(0));
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, lineY - 0.5, W, 1);

    // Floating particles — drift upward, wrap at top
    particles.forEach(p => {
      p.y  += p.vy;
      p.phase += 0.012;
      // gentle horizontal sway
      const swayX = Math.sin(p.phase) * 0.4;
      p.x += swayX;

      // Wrap
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;

      // Breathing alpha
      const a = p.alpha * (0.6 + Math.sin(p.phase * 0.7) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = GOLD(a);
      ctx.fill();
    });
  }

  requestAnimationFrame(draw);


  /* ══════════════════════════════════════════════════════════
     5. FOOTER YEAR
  ══════════════════════════════════════════════════════════ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});

// ── Licensing cards: expand / collapse detail view ──────────
// "Learn More" hides the front face and reveals the detail panel.
// "✕" reverses it. All within the same card slot — no page jump.
document.querySelectorAll('.license-card').forEach(card => {
  const front   = card.querySelector('.license-front');
  const detail  = card.querySelector('.license-detail');
  const moreBtn = card.querySelector('.license-more-btn');
  const closeBtn = card.querySelector('.license-close-btn');

  if (!front || !detail || !moreBtn || !closeBtn) return;

  moreBtn.addEventListener('click', () => {
    front.style.display = 'none';
    detail.removeAttribute('hidden');
    moreBtn.setAttribute('aria-expanded', 'true');
  });

  closeBtn.addEventListener('click', () => {
    detail.setAttribute('hidden', '');
    front.style.display = '';
    moreBtn.setAttribute('aria-expanded', 'false');
  });
});


/* ══════════════════════════════════════════════════════════
   PROMO BANNER — body class sync
   Reads data-active on #promo-banner and adds/removes
   'promo-active' from <body> so hero padding adjusts.
   To disable the banner: set data-active="false".
   To enable: set data-active="true".
══════════════════════════════════════════════════════════ */
(function () {
  const banner = document.getElementById('promo-banner');
  if (!banner) return;

  function syncPromo() {
    const active = banner.getAttribute('data-active') !== 'false';
    document.body.classList.toggle('promo-active', active);
  }

  syncPromo();

  // Watch for attribute changes (e.g. toggled via JS at runtime)
  const mo = new MutationObserver(syncPromo);
  mo.observe(banner, { attributes: true, attributeFilter: ['data-active'] });
})();


/* ══════════════════════════════════════════════════════════
   CREDITS CAROUSEL — physics-based infinite loop
   ──────────────────────────────────────────────────────────
   Uses requestAnimationFrame + a real offset value instead
   of CSS animation, so arrows and hold-to-pause work
   seamlessly without any jump or reset.

   Behaviour:
   - Auto-scrolls left at AUTO_SPEED px/frame
   - Arrow buttons add velocity (with smooth deceleration)
   - Hold (mousedown / touchstart) on any .credit-item pauses
   - Releasing the hold resumes auto-scroll instantly
   - True infinite loop: clones the track so the seam is invisible
══════════════════════════════════════════════════════════ */
(function () {
  const track    = document.getElementById('credits-track');
  const carousel = track && track.closest('.credits-carousel');
  const inner    = carousel && carousel.querySelector('.credits-carousel-inner');
  if (!track || !carousel || !inner) return;

  const AUTO_SPEED  = 0.6;
  const ARROW_BOOST = 5;
  const FRICTION    = 0.90;

  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.id = '';
  inner.appendChild(clone);

  [track, clone].forEach(el => {
    el.style.animation = 'none';
    el.style.position  = 'absolute';
    el.style.top       = '0';
    el.style.left      = '0';
  });

  let offset   = 0;
  let velocity = 0;
  let held     = false;
  let arrowDir = 0;
  let trackW   = 0;

  function measure() {
    trackW = track.scrollWidth;
    inner.style.height = track.offsetHeight + 'px';
    inner.style.width  = '100%';
  }

  function render() {
    if (!trackW) return;
    offset = ((offset % trackW) + trackW) % trackW;
    track.style.transform = `translateX(${-offset}px)`;
    clone.style.transform = `translateX(${trackW - offset}px)`;
  }

  function tick() {
    if (!held) offset += AUTO_SPEED + velocity;
    if (arrowDir !== 0) velocity += arrowDir * ARROW_BOOST;
    velocity *= FRICTION;
    if (Math.abs(velocity) < 0.02) velocity = 0;
    render();
    requestAnimationFrame(tick);
  }

  const btnLeft  = carousel.querySelector('.credits-arrow--left');
  const btnRight = carousel.querySelector('.credits-arrow--right');

  if (btnLeft) {
    btnLeft.addEventListener('mousedown',  () => { arrowDir = -1; });
    btnLeft.addEventListener('touchstart', () => { arrowDir = -1; }, { passive: true });
  }
  if (btnRight) {
    btnRight.addEventListener('mousedown',  () => { arrowDir = 1; });
    btnRight.addEventListener('touchstart', () => { arrowDir = 1; }, { passive: true });
  }

  document.addEventListener('mouseup',  () => { arrowDir = 0; });
  document.addEventListener('touchend', () => { arrowDir = 0; });

  carousel.querySelectorAll('.credit-item').forEach(el => {
    el.addEventListener('mouseenter', () => { held = true; });
    el.addEventListener('mouseleave', () => { held = false; });
    el.addEventListener('touchstart', () => { held = true; },  { passive: true });
    el.addEventListener('touchend',   () => { held = false; }, { passive: true });
  });

  function start() {
    measure();
    render();
    requestAnimationFrame(tick);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    setTimeout(start, 400);
  }

  window.addEventListener('resize', () => { measure(); render(); }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════
   CONTACT FORM — AJAX submit via Formspree
   - Validates all required fields before sending
   - reCAPTCHA v3 token appended to submission
   - Toast notification on success or error
   - Resets fields after successful submission
══════════════════════════════════════════════════════════ */
(function () {
  const form  = document.getElementById('contact-form');
  const toast = document.getElementById('form-toast');
  const msg   = document.getElementById('form-toast-msg');
  if (!form || !toast || !msg) return;

  const ENDPOINT          = 'https://formspree.io/f/mojpjobd';
  const RECAPTCHA_KEY     = '6LerMJwsAAAAAKG0FHNQ26-YhiKhEzF1IG3ygSBf';
  const EMAIL_PATTERN     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submitBtn         = form.querySelector('button[type="submit"]');
  const validationMsg     = document.getElementById('form-validation-message');

  // All required fields
  const nameField    = form.elements['name'];
  const emailField   = form.elements['email'];
  const subjectField = form.elements['subject'];
  const messageField = form.elements['message'];
  const allFields    = [nameField, emailField, subjectField, messageField];

  /* ── Validation helpers ── */
  function value(f) { return f ? f.value.trim() : ''; }

  function isValid(f) {
    if (!f) return false;
    const v = value(f);
    if (!v) return false;
    if (f.type === 'email') return EMAIL_PATTERN.test(v);
    return true;
  }

  function allValid() { return allFields.every(isValid); }

  function markField(f) {
    const g = f && f.closest('.form-group');
    if (g) g.classList.toggle('is-invalid', !isValid(f));
  }

  function clearMark(f) {
    const g = f && f.closest('.form-group');
    if (g) g.classList.remove('is-invalid');
  }

  /* ── Toast ── */
  function showToast(text, isError) {
    msg.textContent = text;
    toast.classList.toggle('error', !!isError);
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 5000);
  }

  /* ── Live field feedback ── */
  allFields.forEach(f => {
    if (!f) return;
    f.addEventListener('input',  () => { clearMark(f); });
    f.addEventListener('change', () => { clearMark(f); });
    f.addEventListener('blur',   () => { if (value(f) !== '') markField(f); });
  });

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate first
    if (!allValid()) {
      allFields.forEach(markField);
      if (validationMsg) validationMsg.hidden = false;
      showToast('Please fill in all required fields.', true);
      const first = allFields.find(f => !isValid(f));
      if (first) first.focus();
      return;
    }

    if (validationMsg) validationMsg.hidden = true;

    // Disable button
    const originalHTML  = submitBtn.innerHTML;
    submitBtn.disabled  = true;
    submitBtn.innerHTML = 'Sending...';

    // reCAPTCHA v3 token
    let token = '';
    try {
      if (typeof grecaptcha !== 'undefined') {
        token = await grecaptcha.execute(RECAPTCHA_KEY, { action: 'contact' });
      }
    } catch { /* reCAPTCHA unavailable — submit anyway */ }

    const data = new FormData(form);
    if (token) data.append('g-recaptcha-response', token);

    try {
      const res = await fetch(ENDPOINT, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    data,
      });

      if (res.ok) {
        showToast("✦  Message sent. I'll be in touch soon.");
        form.reset();
        allFields.forEach(clearMark);
      } else {
        showToast('Something went wrong. Please try again.', true);
      }
    } catch {
      showToast('No connection. Please try again.', true);
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled  = false;
    }
  }

  form.addEventListener('submit', handleSubmit);
})();

/* ============================================================
   DC BEATS — A/B Audio Player
   File: pages/mixing.js

   HOW TO ADD YOUR AUDIO FILES:
   1. Create an assets/audio/ folder inside your project root
   2. Place your MP3 files there (e.g. assets/audio/mm-song1-before.mp3)
   3. The src paths in mixing-mastering.html point to ../assets/audio/
      so the folder structure is:
        dcbeats/
          assets/
            audio/
              mm-song1-before.mp3
              mm-song1-after.mp3
              ... etc.
   4. Update the <source src=""> in each .ab-player in the HTML

   FEATURES:
   - Before/After toggle switches between two audio elements
   - Play/Pause button controls whichever version is active
   - Progress bar with click-to-seek
   - Only one player plays at a time across the whole page
   - Time display (current / total)
============================================================ */

(function () {
  'use strict';

  // Track which player is currently playing (globally)
  let activePlayer = null;

  /**
   * Format seconds → "m:ss"
   */
  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Initialise a single .ab-player element
   */
  function initPlayer(playerEl) {
    const audioBefore  = playerEl.querySelector('.ab-audio-before');
    const audioAfter   = playerEl.querySelector('.ab-audio-after');
    const btnBefore    = playerEl.querySelector('.ab-btn--before');
    const btnAfter     = playerEl.querySelector('.ab-btn--after');
    const playBtn      = playerEl.querySelector('.ab-play');
    const iconPlay     = playerEl.querySelector('.ab-icon-play');
    const iconPause    = playerEl.querySelector('.ab-icon-pause');
    const progressBar  = playerEl.querySelector('.ab-progress-bar');
    const progressFill = playerEl.querySelector('.ab-progress-fill');
    const timeCurrent  = playerEl.querySelector('.ab-time-current');
    const timeTotal    = playerEl.querySelector('.ab-time-total');
    const activeText   = playerEl.querySelector('.ab-active-text');

    if (!audioBefore || !audioAfter || !playBtn) return;

    // State
    let currentAudio  = audioBefore;
    let isPlaying     = false;

    /* ── Helpers ── */
    function setPlayingUI(playing) {
      isPlaying = playing;
      iconPlay.style.display  = playing ? 'none'  : 'block';
      iconPause.style.display = playing ? 'block' : 'none';
    }

    function stopAll() {
      audioBefore.pause();
      audioAfter.pause();
      setPlayingUI(false);
    }

    function syncProgress() {
      if (!currentAudio.duration) return;
      const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeCurrent.textContent  = formatTime(currentAudio.currentTime);
    }

    function syncDuration() {
      timeTotal.textContent = formatTime(currentAudio.duration);
    }

    /* ── Switch between Before / After ── */
    function switchVersion(version) {
      const wasPlaying = isPlaying;
      const savedTime  = currentAudio.currentTime;

      // Stop current
      stopAll();

      // Swap active audio
      if (version === 'before') {
        currentAudio = audioBefore;
        btnBefore.classList.add('active');
        btnAfter.classList.remove('active');
        activeText.textContent = 'Before';
        activeText.classList.remove('is-after');
      } else {
        currentAudio = audioAfter;
        btnAfter.classList.add('active');
        btnBefore.classList.remove('active');
        activeText.textContent = 'After';
        activeText.classList.add('is-after');
      }

      // Attempt to resume at same position
      currentAudio.currentTime = Math.min(savedTime, currentAudio.duration || 0);
      syncDuration();
      syncProgress();

      if (wasPlaying) {
        currentAudio.play().catch(() => {});
        setPlayingUI(true);
        activePlayer = playerEl;
      }
    }

    /* ── Play / Pause ── */
    function togglePlay() {
      if (isPlaying) {
        currentAudio.pause();
        setPlayingUI(false);
        activePlayer = null;
      } else {
        // Stop any other player that's running
        if (activePlayer && activePlayer !== playerEl) {
          const otherPlay  = activePlayer.querySelector('.ab-icon-play');
          const otherPause = activePlayer.querySelector('.ab-icon-pause');
          const otherAudioB = activePlayer.querySelector('.ab-audio-before');
          const otherAudioA = activePlayer.querySelector('.ab-audio-after');
          if (otherAudioB) otherAudioB.pause();
          if (otherAudioA) otherAudioA.pause();
          if (otherPlay)  otherPlay.style.display  = 'block';
          if (otherPause) otherPause.style.display = 'none';
        }

        currentAudio.play().catch(() => {
          // Browser blocked autoplay — user must interact
        });
        setPlayingUI(true);
        activePlayer = playerEl;
      }
    }

    /* ── Progress bar click-to-seek ── */
    function seek(e) {
      const rect = progressBar.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (currentAudio.duration) {
        currentAudio.currentTime = pct * currentAudio.duration;
        syncProgress();
      }
    }

    /* ── Events ── */
    btnBefore.addEventListener('click', () => switchVersion('before'));
    btnAfter.addEventListener('click',  () => switchVersion('after'));
    playBtn.addEventListener('click',   togglePlay);
    progressBar.addEventListener('click', seek);

    currentAudio.addEventListener('timeupdate', syncProgress);
    currentAudio.addEventListener('loadedmetadata', syncDuration);
    audioBefore.addEventListener('loadedmetadata', () => {
      if (currentAudio === audioBefore) syncDuration();
    });
    audioAfter.addEventListener('loadedmetadata', () => {
      if (currentAudio === audioAfter) syncDuration();
    });

    // When track ends — reset UI
    audioBefore.addEventListener('ended', () => {
      if (currentAudio === audioBefore) {
        setPlayingUI(false);
        progressFill.style.width = '0%';
        timeCurrent.textContent  = '0:00';
        activePlayer = null;
      }
    });

    audioAfter.addEventListener('ended', () => {
      if (currentAudio === audioAfter) {
        setPlayingUI(false);
        progressFill.style.width = '0%';
        timeCurrent.textContent  = '0:00';
        activePlayer = null;
      }
    });
  }

  /* ── Init all players on the page ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.ab-player').forEach(initPlayer);
  });

})();
