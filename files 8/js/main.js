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
   CREDITS CAROUSEL — infinite auto-scroll
   Duplicates the track so the loop is seamless.
   Speed controlled by --credits-speed CSS custom prop
   or directly via the pixelsPerSecond constant below.
══════════════════════════════════════════════════════════ */
(function () {
  const track = document.getElementById('credits-track');
  if (!track) return;

  const PIXELS_PER_SECOND = 55; // lower = slower

  // Duplicate track for seamless loop
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentElement.appendChild(clone);

  // Calculate duration based on track width + speed
  function applyAnimation() {
    const w        = track.scrollWidth;
    const duration = w / PIXELS_PER_SECOND;

    // Apply to original track only — clone follows naturally
    track.style.animation = `creditsScroll ${duration}s linear infinite`;
    clone.style.animation  = `creditsScroll ${duration}s linear infinite`;
  }

  // Apply after fonts/images settle
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(applyAnimation);
  } else {
    setTimeout(applyAnimation, 400);
  }

  // Recompute on resize
  window.addEventListener('resize', applyAnimation, { passive: true });
})();
