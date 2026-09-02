/* ============================================================
   DC BEATS — Blog Post Registry   |   js/blog-posts.js
   ============================================================
   This is the ONLY file you need to edit to add or remove posts.

   ── HOW TO ADD A POST ──────────────────────────────────────
   1. Copy  pages/blog/_template-post.html  →  pages/blog/your-slug.html
   2. Fill in all content (search for !! EDIT !! in the template)
   3. Add one entry at the TOP of BLOG_POSTS below (newest first)
   4. Add the URL to sitemap.xml

   ── HOW TO REMOVE A POST ───────────────────────────────────
   1. Delete  pages/blog/your-slug.html
   2. Remove its entry from BLOG_POSTS below
   3. Remove it from sitemap.xml

   ── FIELD REFERENCE ────────────────────────────────────────
   slug      Required. Filename without .html  →  'my-post-title'
   title     Required. Full post title
   date      Required. ISO format             →  '2026-06-01'
   excerpt   Required. 1–2 sentence teaser shown on listing page
   tags      Optional. Array of short labels  →  ['tips', 'licensing']
   readTime  Optional. Estimated minutes      →  5
============================================================ */

var BLOG_POSTS = [

  {
    slug:     'bpm-key-camelot-wheel-explained',
    title:    "BPM, Musical Key and the Camelot Wheel: The Producer's Cheat Sheet",
    date:     '2026-04-22',
    excerpt:  "Tempo and key are the two invisible forces that determine whether your tracks feel right together. This cheat sheet breaks both down — with a full Camelot reference you can bookmark.",
    tags:     ['music theory', 'production'],
    readTime: 5,
  },

  {
    slug:     'mixing-vocals-over-a-beat',
    title:    "Mixing Vocals Over a Beat: 7 Fixes That Instantly Sound More Professional",
    date:     '2026-03-07',
    excerpt:  "Bought a beat, recorded your vocals, but something feels off? These seven targeted fixes cover the most common mixing mistakes artists make when working with a purchased beat.",
    tags:     ['mixing', 'vocals'],
    readTime: 6,
  },

  {
    slug:     'how-to-pitch-spotify-editorial-playlists',
    title:    'How to Pitch Your Music to Spotify Editorial Playlists',
    date:     '2026-01-14',
    excerpt:  "Getting your song in front of a Spotify playlist editor can change everything. Here's exactly how to pitch, when to pitch, and the mistakes that get your submission ignored.",
    tags:     ['distribution', 'tips'],
    readTime: 5,
  },

  {
    slug:     'how-to-choose-a-beat-license',
    title:    'Basic, Pro or Unlimited? How to Pick the Right Beat License',
    date:     '2026-05-23',
    excerpt:  "Not sure which license tier fits your next release? Here's a plain-English breakdown of every tier and exactly when you need to upgrade.",
    tags:     ['licensing', 'tips'],
    readTime: 4,
  },

  /* ── Add new posts above this line ── */

];
