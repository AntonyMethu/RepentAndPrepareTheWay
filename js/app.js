/**
 * ================================================================
 * app.js — Main Application Logic
 * ================================================================
 * Repent and Prepare The Way | repentandpreparetheway.org
 *
 * This file is functionally identical to jesusislordradio/js/app.js.
 * Both sites share the same interactive behaviours:
 *   1. Sticky header scroll shadow
 *   2. Mobile hamburger navigation
 *   3. Dropdown keyboard accessibility
 *   4. Breaking news ticker seamless loop
 *   5. Scroll-reveal animations
 *   6. Active nav-link detection
 *   7. Smooth anchor scrolling
 *   8. Lazy image loading
 *   9. YouTube play facades
 *  10. Toast notifications
 *
 * HOW TO DISABLE A FEATURE:
 * Comment out its function call in the DOMContentLoaded block
 * at the very bottom of this file.
 *
 * DEPENDENCIES: None — pure vanilla JavaScript
 * ================================================================
 */

'use strict';


// ================================================================
// 1. STICKY HEADER — Add shadow when page is scrolled
// ================================================================

/**
 * initStickyHeader()
 * Uses IntersectionObserver (not scroll events) for performance.
 * When the invisible sentinel at the top leaves the viewport,
 * the .scrolled class is applied to the header.
 */



// ================================================================
// 2. MOBILE NAVIGATION
// ================================================================

/**
 * initMobileNav()
 * Handles hamburger open/close, overlay tap to close,
 * Escape key close, and ARIA state management.
 */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mainNav');
  const body   = document.body;

  if (!toggle || !nav) return;

  // Toggle on button click
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    body.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
    body.style.overflow = isOpen ? 'hidden' : ''; // Prevent background scroll
  });

  // Close on any link click inside nav
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('nav-open')) {
      closeNav();
      toggle.focus(); // Return focus to trigger button (accessibility)
    }
  });

  // Close when clicking the page backdrop (outside nav panel)
  document.addEventListener('click', (e) => {
    if (
      body.classList.contains('nav-open') &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeNav();
    }
  });

  function closeNav() {
    toggle.classList.remove('open');
    body.classList.remove('nav-open');
    body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
  }
}


// ================================================================
// 3. DROPDOWN MENUS — Keyboard accessibility
// ================================================================

/**
 * initDropdowns()
 * CSS handles hover-open for mouse users.
 * This function adds keyboard support (Enter/Space/Escape/Tab).
 */
function initDropdowns() {
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-link');
    const menu    = dropdown.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;

    // Add ARIA attributes
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    // Open on Enter or Space (keyboard users)
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));

        if (isOpen) {
          // Move focus to first menu item
          const firstItem = menu.querySelector('.dropdown-item');
          if (firstItem) firstItem.focus();
        }
      }

      // Close on Escape
      if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });

    // Close when focus moves completely outside the dropdown
    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) {
        setTimeout(() => {
          if (!dropdown.contains(document.activeElement)) {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
          }
        }, 100);
      }
    });
  });
}


// ================================================================
// 4. NEWS TICKER — Seamless infinite scroll
// ================================================================

/**
 * initTicker()
 * Duplicates ticker items for a seamless loop.
 * Without duplication there would be a visible "jump" when it resets.
 * The speed is dynamically calculated so longer tickers move at
 * the same perceived speed as shorter ones.
 */
function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  const items = track.querySelectorAll('.ticker-item');
  if (items.length === 0) return;

  // Deep-clone each item and append (creates the second copy for looping)
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); // Screen readers see original only
    track.appendChild(clone);
  });

  // Calculate duration so speed is consistent regardless of content length
  const totalWidth     = track.scrollWidth / 2; // Half because we duplicated
  const pixelsPerSec   = 55;                     // Pixels/second scroll speed
  const durationSec    = Math.max(25, totalWidth / pixelsPerSec);
  track.style.animationDuration = `${durationSec}s`;
}


// ================================================================
// 5. SCROLL REVEAL — Animate elements into view
// ================================================================

/**
 * initScrollReveal()
 * Observes elements with .reveal class.
 * When they enter the viewport, adds .revealed to trigger
 * the CSS opacity + translateY transition.
 */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (elements.length === 0) return;

  // Graceful degradation for old browsers
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Stop watching after reveal
        }
      });
    },
    {
      threshold:  0.08,              // Reveal when 8% of element is visible
      rootMargin: '0px 0px -30px 0px', // Trigger slightly before element fully enters
    }
  );

  elements.forEach(el => observer.observe(el));
}


// ================================================================
// 6. ACTIVE NAV LINK — Highlight current page
// ================================================================

/**
 * setActiveNavLink()
 * Removes any hard-coded .active class set in HTML (for homepage only)
 * then re-applies based on the actual current URL.
 * Supports direct links, index.html, and sub-paths.
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks    = document.querySelectorAll('.site-nav .nav-link:not(.sister-site)');

  navLinks.forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;

    const isActive = (
      linkPath === currentPath ||
      (currentPath === '/'        && linkPath.endsWith('index.html')) ||
      (linkPath    === '/'        && currentPath.endsWith('index.html'))
    );

    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}


// ================================================================
// 7. SMOOTH ANCHOR SCROLLING
// ================================================================

/**
 * initSmoothScroll()
 * Intercepts clicks on href="#section-id" links.
 * Scrolls smoothly to the target, accounting for sticky header height.
 */
function initSmoothScroll() {
  const header = document.getElementById('site-header');

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop    = target.getBoundingClientRect().top + window.pageYOffset;
      const scrollTo     = targetTop - headerHeight - 16;

      window.scrollTo({ top: scrollTo, behavior: 'smooth' });

      // Update URL hash without page jump
      history.pushState(null, null, `#${targetId}`);

      // Move focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}


// ================================================================
// 8. TOAST NOTIFICATIONS
// ================================================================

/**
 * showToast(message, type, duration)
 * Displays a brief notification message at the bottom-right.
 *
 * @param {string} message  - Text to show
 * @param {string} type     - 'success' | 'error' | 'info'
 * @param {number} duration - Milliseconds to display (default 3000)
 *
 * USAGE EXAMPLE:
 *   showToast('Link copied!', 'success');
 *   showToast('Failed to load.', 'error', 5000);
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  // Type-based colours
  const styles = {
    success: { bg: 'rgba(0,230,118,0.12)',   border: 'rgba(0,230,118,0.35)' },
    error:   { bg: 'rgba(255,59,59,0.12)',   border: 'rgba(255,59,59,0.35)' },
    info:    { bg: 'rgba(0,255,255,0.10)',   border: 'rgba(0,255,255,0.30)' },
  };

  const { bg, border } = styles[type] || styles.info;

  Object.assign(toast.style, {
    position:       'fixed',
    bottom:         '24px',
    right:          '24px',
    padding:        '12px 20px',
    background:     bg,
    border:         `1px solid ${border}`,
    borderRadius:   '8px',
    color:          '#ffffff',
    fontSize:       '0.875rem',
    fontFamily:     'var(--font-primary)',
    backdropFilter: 'blur(20px)',
    zIndex:         '9999',
    maxWidth:       '320px',
    boxShadow:      '0 8px 32px rgba(0,0,0,0.4)',
    animation:      'fadeInUp 0.3s ease',
    transition:     'opacity 0.3s ease',
  });

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.parentNode && toast.parentNode.removeChild(toast), 300);
  }, duration);
}

window.showToast = showToast; // Expose globally


// ================================================================
// 9. LAZY IMAGE LOADING
// ================================================================

/**
 * initLazyImages()
 * Loads images with data-src only when they approach the viewport.
 * Use on large below-fold images to improve initial page load speed.
 *
 * HOW TO USE IN HTML:
 *   <img data-src="path/to/image.jpg" src="placeholder.jpg" class="lazy" alt="...">
 */
function initLazyImages() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: load all immediately
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }

  const imgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
          imgObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200px 0px' } // Pre-load 200px before entering viewport
  );

  lazyImages.forEach(img => imgObserver.observe(img));
}


// ================================================================
// 10. YOUTUBE FACADE PATTERN
// ================================================================

/**
 * initYouTubeFacades()
 *
 * CRITICAL PERFORMANCE FEATURE:
 * Each YouTube iframe loads ~500KB of JS + trackers.
 * The original repentandpreparetheway.org had 150+ links on one page.
 * This function ensures YouTube iframes are NEVER loaded until clicked.
 *
 * HOW IT WORKS:
 * - Elements with class .youtube-facade and data-youtube-id attribute
 *   show a thumbnail + play button instead of an iframe
 * - On click, the thumbnail is replaced with the actual YouTube iframe
 * - Result: zero YouTube JS loaded until user explicitly clicks play
 *
 * HOW TO USE IN HTML:
 *   <div class="youtube-facade" data-youtube-id="VIDEO_ID">
 *     <span class="sr-only">Watch: Video title here</span>
 *   </div>
 *
 * The CSS for .youtube-facade is in style.css.
 * This function handles the click behaviour only.
 */
function initYouTubeFacades() {
  document.querySelectorAll('.youtube-facade[data-youtube-id]').forEach(facade => {
    const videoId = facade.dataset.youtubeId;

    // Skip placeholders (IDs that haven't been set yet)
    if (!videoId || videoId.includes('_VIDEO_ID') || videoId.length !== 11) {

      // If the facade has no valid image, ensure it still looks reasonable
      if (!facade.querySelector('img')) {
        const placeholder = document.createElement('div');
        placeholder.style.cssText =
          'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;color:rgba(255,255,255,0.3);';
        placeholder.textContent = '▶';
        placeholder.setAttribute('aria-hidden', 'true');

        // Add tooltip for developers
        facade.title = `Set data-youtube-id="${videoId}" to enable video`;
      }
      return;
    }

    // Set thumbnail from YouTube's CDN (no JS loaded — just an image request)
    const thumbImg = facade.querySelector('img');
    if (thumbImg && !thumbImg.src.includes('ytimg.com')) {
      thumbImg.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Handle both click and keyboard activation
    const activateFacade = () => {
      // Build the iframe
      const iframe = document.createElement('iframe');
      iframe.src         = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title       = facade.getAttribute('aria-label') || 'YouTube video player';
      iframe.allow       = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.loading     = 'lazy';
      iframe.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:inherit;';

      // Clear the facade and replace with iframe
      facade.innerHTML = '';
      facade.style.position = 'relative';
      facade.appendChild(iframe);

      // Remove the click listener (only needed once)
    };

    // Mouse click
    facade.addEventListener('click', activateFacade, { once: true });

    // Keyboard: Enter or Space
    facade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateFacade();
      }
    }, { once: true });
  });
}


// ================================================================
// 11. PROPHECY PAGE FILTERING (used on pages/prophecies.html)
// ================================================================

/**
 * initProphecyFilters()
 * Handles category tab filtering on the prophecies page.
 * Cards with matching data-category are shown; others are hidden.
 *
 * Attached to window so it can be called from HTML onclick attributes.
 */
window.filterProphecies = function(category, clickedBtn) {
  // Update active tab styling
  document.querySelectorAll('.prophecy-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  if (clickedBtn) clickedBtn.classList.add('active');

  // Filter the cards
  const cards = document.querySelectorAll('.prophecy-card[data-category]');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardCategory = card.dataset.category || '';
    const shouldShow   = category === 'all' || cardCategory === category;

    card.style.display = shouldShow ? '' : 'none';
    if (shouldShow) visibleCount++;
  });

  // Update count display if present
  const countEl = document.getElementById('prophecyCount');
  if (countEl) {
    countEl.textContent =
      `${visibleCount} prophecy${visibleCount !== 1 ? 'ies' : 'y'}` +
      (category !== 'all' ? ` in ${category}` : ' total');
  }

  // Update URL hash for bookmarking
  history.replaceState(null, null, category === 'all' ? '#' : `#${category}`);
};


// ================================================================
// 12. BACK TO TOP BUTTON
// ================================================================

/**
 * initBackToTop()
 * Shows a "Back to top" button after scrolling 400px.
 * The button is only added if an element with id="backToTop" exists.
 */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => { btn.classList.toggle('visible', window.pageYOffset > 400); },
    { passive: true } // passive=true: tells browser this won't call preventDefault() → faster scroll
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// ================================================================
// INITIALISE EVERYTHING
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

  initStickyHeader();      // Header scroll shadow
  initMobileNav();         // Hamburger menu
  initDropdowns();         // Nav dropdown keyboard support
  initTicker();            // Breaking news ticker loop
  initScrollReveal();      // Section reveal on scroll
  setActiveNavLink();      // Highlight current page in nav
  initSmoothScroll();      // Smooth anchor scroll
  initLazyImages();        // Lazy-load below-fold images
  initYouTubeFacades();    // YouTube click-to-load
  initBackToTop();         // Back to top button (on pages that have it)

  // Check URL hash for prophecy page filter on initial load
  const hash = window.location.hash.slice(1);
  if (hash && document.querySelector('.prophecy-tab')) {
    const matchingTab = document.querySelector(`.prophecy-tab[data-category="${hash}"]`);
    if (matchingTab) {
      window.filterProphecies(hash, matchingTab);
    }
  }

  console.info('[App] repentandpreparetheway app.js loaded.');
  console.info('[App] "Prepare the way for the LORD; make straight in the desert a highway for our GOD." — Isaiah 40:3');
});
