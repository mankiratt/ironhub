/* =================================================================
   IRONHUB 24/7 GYM — main.js
   Vanilla JS only. Each block earns its place.
   ================================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     1. NAV — scroll state + mobile toggle
     ------------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }
  function openMenu() {
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) { closeMenu(); } else { openMenu(); }
    });
  }
  // Close the mobile menu after tapping a link
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); }
  });

  /* -------------------------------------------------------------
     2. SCROLL REVEAL — IntersectionObserver
     ------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  // Stagger: each item waits a touch longer than the previous one in its group,
  // so grids (cards, tiles, products) swoosh in as a wave rather than all together.
  revealEls.forEach(function (el) {
    var group = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return c.classList && c.classList.contains('reveal');
    });
    var idx = group.indexOf(el);
    if (idx > 0) { el.style.setProperty('--rd', (idx * 0.08).toFixed(2) + 's'); }
  });
  // Decorative elements (splatter, starburst, annotation lines) that pop/draw in on scroll.
  // NOTE: .loaded-bar removed for now (slide-in effect parked, not deleted — see styles.css
  // "Load-in flourish" keyframes). Add '.loaded-bar' back here to re-enable it.
  var popEls = document.querySelectorAll('.pop, .draw');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    popEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    popEls.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------
     2b. HERO — video fallback + subtle parallax
     ------------------------------------------------------------- */
  var heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    // Only fade the video in once a real frame is decoded — until then the .ph placeholder shows
    // (prevents an empty/black video box before assets exist).
    heroVideo.addEventListener('loadeddata', function () { heroVideo.classList.add('is-ready'); });
    var smallScreen = window.matchMedia('(max-width: 760px)').matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    // Autoplay only when it's welcome — otherwise the poster/placeholder carries the hero.
    if (!prefersReduced && !smallScreen && !saveData) {
      heroVideo.preload = 'auto';
      var playPromise = heroVideo.play();
      if (playPromise && playPromise.catch) { playPromise.catch(function () {/* no source yet / blocked — placeholder shows */}); }
    }
  }

  if (!prefersReduced) {
    var heroImg = document.querySelector('.hero__img');
    var vh = window.innerHeight;
    var parallaxTicking = false;
    function heroParallax() {
      var y = window.scrollY;
      // Zoom the background image OUT as you scroll: starts zoomed in (1.2) and pulls back to 1.
      // Never goes below 1 so it always covers the hero (no gaps). Text/buttons don't move.
      if (y <= vh && heroImg) {
        heroImg.style.transform = 'scale(' + (1.2 - (y / vh) * 0.2).toFixed(3) + ')';
      }
      parallaxTicking = false;
    }
    heroParallax(); // set the initial zoomed-in state
    window.addEventListener('scroll', function () {
      if (!parallaxTicking) { requestAnimationFrame(heroParallax); parallaxTicking = true; }
    }, { passive: true });
    window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });
  }

  /* -------------------------------------------------------------
     3. LOCATION SWITCHER (tabs)
     ------------------------------------------------------------- */
  var locButtons = document.querySelectorAll('.loc-switch__btn');
  locButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-loc');
      locButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('.loc-panel').forEach(function (panel) {
        var show = panel.id === 'loc-' + target;
        panel.classList.toggle('is-active', show);
        if (show) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
      });
    });
  });

  /* -------------------------------------------------------------
     4. GALLERY LIGHTBOX
     Placeholder-aware: clones the tile's look + caption into the
     lightbox. When real <img>s replace the tiles, swap the clone
     logic for reading the image src (noted inline below).
     ------------------------------------------------------------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.masonry .tile'));
  var lightbox = document.getElementById('lightbox');
  var lbMedia = document.getElementById('lightboxMedia');
  var lbTag = document.getElementById('lightboxTag');
  var lbCaption = document.getElementById('lightboxCaption');
  var lbClose = document.getElementById('lightboxClose');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');
  var currentIndex = 0;
  var lastFocused = null;

  function renderLightbox(index) {
    currentIndex = (index + tiles.length) % tiles.length;
    var tile = tiles[currentIndex];
    var caption = tile.getAttribute('data-caption') || '';
    // TODO (real photos): set lbMedia background-image from the tile's <img> src instead of the placeholder tag.
    lbCaption.textContent = caption;
    lbTag.textContent = caption || 'photo';
  }
  function openLightbox(index) {
    lastFocused = document.activeElement;
    renderLightbox(index);
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { lightbox.hidden = true; }, prefersReduced ? 0 : 320);
    if (lastFocused) { lastFocused.focus(); }
  }
  tiles.forEach(function (tile, i) {
    tile.addEventListener('click', function () { openLightbox(i); });
  });
  if (lbClose) { lbClose.addEventListener('click', closeLightbox); }
  if (lbPrev) { lbPrev.addEventListener('click', function () { renderLightbox(currentIndex - 1); }); }
  if (lbNext) { lbNext.addEventListener('click', function () { renderLightbox(currentIndex + 1); }); }
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) { closeLightbox(); } });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) { return; }
    if (e.key === 'Escape') { closeLightbox(); }
    if (e.key === 'ArrowLeft') { renderLightbox(currentIndex - 1); }
    if (e.key === 'ArrowRight') { renderLightbox(currentIndex + 1); }
  });

  /* -------------------------------------------------------------
     4b. COACH MODAL — opens from a team card, prev/next between coaches
     ------------------------------------------------------------- */
  var teamCards = Array.prototype.slice.call(document.querySelectorAll('.team-card'));
  var coachModal = document.getElementById('coachModal');
  if (coachModal && teamCards.length) {
    var cmMedia = document.getElementById('coachModalMedia');
    var cmTag = document.getElementById('coachModalTag');
    var cmName = document.getElementById('coachModalName');
    var cmSpec = document.getElementById('coachModalSpec');
    var cmBio = document.getElementById('coachModalBio');
    var cmIg = document.getElementById('coachModalIg');
    var cmClose = document.getElementById('coachModalClose');
    var cmPrev = document.getElementById('coachPrev');
    var cmNext = document.getElementById('coachNext');
    var coachIndex = 0;
    var coachLastFocus = null;

    function renderCoach(i) {
      coachIndex = (i + teamCards.length) % teamCards.length;
      var c = teamCards[coachIndex].dataset;
      cmName.textContent = c.name || 'Coach';
      cmSpec.textContent = c.spec || '';
      cmBio.textContent = c.bio || '';
      cmTag.textContent = c.name || 'portrait';
      if (c.ig && c.ig !== '#') { cmIg.href = c.ig; cmIg.hidden = false; } else { cmIg.hidden = true; }
      // Show the coach photo if supplied (data-img), else the placeholder.
      cmMedia.style.backgroundImage = c.img ? "url('" + c.img + "')" : '';
      cmMedia.classList.toggle('has-img', !!c.img);
    }
    function openCoach(i) {
      coachLastFocus = document.activeElement;
      renderCoach(i);
      coachModal.hidden = false;
      requestAnimationFrame(function () { coachModal.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
      cmClose.focus();
    }
    function closeCoach() {
      coachModal.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () { coachModal.hidden = true; }, prefersReduced ? 0 : 320);
      if (coachLastFocus) { coachLastFocus.focus(); }
    }
    teamCards.forEach(function (card, i) { card.addEventListener('click', function () { openCoach(i); }); });
    cmClose.addEventListener('click', closeCoach);
    cmPrev.addEventListener('click', function () { renderCoach(coachIndex - 1); });
    cmNext.addEventListener('click', function () { renderCoach(coachIndex + 1); });
    coachModal.querySelector('[data-close]').addEventListener('click', closeCoach);
    document.addEventListener('keydown', function (e) {
      if (coachModal.hidden) { return; }
      if (e.key === 'Escape') { closeCoach(); }
      if (e.key === 'ArrowLeft') { renderCoach(coachIndex - 1); }
      if (e.key === 'ArrowRight') { renderCoach(coachIndex + 1); }
    });
  }

  /* -------------------------------------------------------------
     5. ENQUIRY FORM
     Currently builds a mailto: so it works with zero backend.
     TODO: replace with Formspree / Netlify Forms / your endpoint.
     ------------------------------------------------------------- */
  var form = document.getElementById('enquiryForm');
  var status = document.getElementById('enquiryStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Add your name, a valid email, and a location so we can reply.';
        status.classList.add('is-error');
        form.reportValidity();
        return;
      }
      var name = encodeURIComponent(form.name.value);
      var email = encodeURIComponent(form.email.value);
      var phone = encodeURIComponent(form.phone.value);
      var loc = encodeURIComponent(form.location.value);
      var msg = encodeURIComponent(form.message.value);
      // Route to the right inbox based on chosen location.
      var to = form.location.value === 'Carrum Downs' ? 'info.ironhub.cd@gmail.com' : 'info.ironhub@gmail.com';
      var subject = encodeURIComponent('Membership enquiry — ' + form.location.value);
      var body =
        'Name: ' + name + '%0D%0A' +
        'Email: ' + email + '%0D%0A' +
        'Phone: ' + phone + '%0D%0A' +
        'Location: ' + loc + '%0D%0A%0D%0A' +
        'Message:%0D%0A' + msg;
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
      status.textContent = 'Opening your email app — hit send and we\'ll take it from there.';
      status.classList.remove('is-error');
    });
  }

  /* -------------------------------------------------------------
     6. FOOTER YEAR
     ------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();
