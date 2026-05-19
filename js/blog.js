/**
 * ================================================================
 * blog.js — Blog Rendering Engine
 * ================================================================
 * Used by: jesusislordradio.info AND repentandpreparetheway.org
 *
 * WHAT THIS FILE DOES:
 *  1. Fetches blog posts from /data/posts.json
 *  2. Renders post cards on the homepage (preview — up to 3 posts)
 *  3. Renders the full post list on /pages/blog.html (all posts)
 *  4. Renders individual post detail (on blog.html with #post-id URL)
 *  5. Handles filtering by category
 *  6. Handles search (basic client-side text search)
 *
 * HOW TO ADD A NEW BLOG POST:
 *  Edit /data/posts.json — add a new object at the top of the array.
 *  No changes to this file are needed.
 *  See posts.json for the required format.
 *
 * DEPENDENCIES: None — pure vanilla JavaScript
 * ================================================================
 */

'use strict';

// ================================================================
// CONFIGURATION
// ================================================================

const BLOG_CONFIG = {
  /**
   * DATA_URL — Path to the JSON file containing all blog posts.
   * This path is relative to the HTML file that loads blog.js.
   * On index.html: '../data/posts.json' would be wrong if blog.js
   * is always loaded from a consistent location.
   *
   * We auto-detect the correct path below using the page's location.
   */
  get DATA_URL() {
    // Determine data path based on current page depth
    const depth = (window.location.pathname.match(/\//g) || []).length;
    // Root page (index.html): 1 slash → data/posts.json
    // Sub-pages (pages/*.html): 2 slashes → ../data/posts.json
    return depth <= 1 ? 'data/posts.json' : '../data/posts.json';
  },

  /** Number of posts to show on the homepage preview */
  HOMEPAGE_PREVIEW_COUNT: 3,

  /** Default category label if post has none */
  DEFAULT_CATEGORY: 'Ministry Update',

  /** Emoji icons for each blog category */
  CATEGORY_ICONS: {
    'Prophecy':        '🔮',
    'Testimony':       '🙏',
    'Teaching':        '📖',
    'Ministry Update': '📢',
    'Miracle':         '✨',
    'Radio':           '📻',
    'Blog':            '📝',
    'Alert':           '⚠️',
    'Revival':         '🔥',
  },
};


// ================================================================
// DATE FORMATTING
// ================================================================

/**
 * formatDate(dateString)
 * Converts ISO date string (e.g. "2026-05-18") to readable format
 * ("May 18, 2026").
 *
 * @param  {string} dateString - Date in YYYY-MM-DD format
 * @returns {string}           - Human-readable date
 */
function formatDate(dateString) {
  if (!dateString) return '';

  try {
    // Parse as UTC to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00Z');

    return date.toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'long',
      day:   'numeric',
      timeZone: 'UTC', // Ensure consistent output regardless of user's timezone
    });
  } catch {
    return dateString; // Return as-is if parsing fails
  }
}

/**
 * getRelativeTime(dateString)
 * Returns "3 days ago", "2 weeks ago", etc.
 * Falls back to formatDate if older than 30 days.
 *
 * @param  {string} dateString
 * @returns {string}
 */
function getRelativeTime(dateString) {
  if (!dateString) return '';

  const postDate = new Date(dateString + 'T00:00:00Z');
  const now      = new Date();
  const diffMs   = now - postDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 14)  return '1 week ago';
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} weeks ago`;

  // Older than 30 days: show full date
  return formatDate(dateString);
}


// ================================================================
// HTML TEMPLATE BUILDERS
// ================================================================

/**
 * buildPostCard(post)
 * Creates the HTML string for a blog post preview card.
 * Used on both the homepage (preview) and the blog listing page.
 *
 * @param  {Object}  post     - Post data object from posts.json
 * @param  {boolean} featured - If true, applies featured styling
 * @returns {string}          - HTML string
 */
function buildPostCard(post, featured = false) {
  const category    = post.category || BLOG_CONFIG.DEFAULT_CATEGORY;
  const categoryIcon = BLOG_CONFIG.CATEGORY_ICONS[category] || '📝';
  const relativeDate = getRelativeTime(post.date);
  const fullDate     = formatDate(post.date);

  // Build image/placeholder HTML
  const imageHtml = post.image
    ? `<img
         src="${escapeHtml(post.image)}"
         alt="${escapeHtml(post.title)}"
         class="blog-card-image"
         loading="lazy"
         width="400"
         height="180"
       >`
    : `<div class="blog-card-image-placeholder" role="img" aria-label="${escapeHtml(category)} post">
         ${categoryIcon}
       </div>`;

  // Sanitize excerpt — strip any HTML tags
  const excerpt = post.excerpt
    ? stripHtml(post.excerpt).slice(0, 200) + (post.excerpt.length > 200 ? '...' : '')
    : '';

  return `
    <article
      class="blog-card${featured ? ' blog-card--featured' : ''} reveal"
      aria-label="${escapeHtml(post.title)}"
    >
      <!-- Post thumbnail / placeholder -->
      <a href="blog.html?id=${encodeURIComponent(post.id)}" aria-hidden="true" tabindex="-1">
        ${imageHtml}
      </a>

      <div class="blog-card-body">

        <!-- Category + Date -->
        <div class="blog-card-meta">
          <span class="blog-category">${categoryIcon} ${escapeHtml(category)}</span>
          <time
            class="blog-date"
            datetime="${escapeHtml(post.date || '')}"
            title="${fullDate}"
          >${relativeDate}</time>
        </div>

        <!-- Post title (also a link) -->
        <h3 class="blog-card-title">
          <a href="blog.html?id=${encodeURIComponent(post.id)}">
            ${escapeHtml(post.title)}
          </a>
        </h3>

        <!-- Excerpt -->
        ${excerpt ? `<p class="blog-card-excerpt">${escapeHtml(excerpt)}</p>` : ''}

        <!-- Author + Read more -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
          ${post.author
            ? `<span style="font-size:0.75rem;color:var(--color-text-muted);">
                 ✍️ ${escapeHtml(post.author)}
               </span>`
            : '<span></span>'
          }
          <a
            href="blog.html?id=${encodeURIComponent(post.id)}"
            class="blog-card-readmore"
            aria-label="Read full post: ${escapeHtml(post.title)}"
          >
            Read more →
          </a>
        </div>

      </div><!-- /blog-card-body -->
    </article>
  `;
}

/**
 * buildPostDetail(post)
 * Renders a full blog post (for the single post view on blog.html).
 *
 * @param  {Object} post - Full post data from posts.json
 * @returns {string}     - HTML string
 */
function buildPostDetail(post) {
  const category    = post.category || BLOG_CONFIG.DEFAULT_CATEGORY;
  const categoryIcon = BLOG_CONFIG.CATEGORY_ICONS[category] || '📝';

  // Convert newlines to paragraph breaks in content
  const contentHtml = (post.content || post.excerpt || 'Content coming soon.')
    .split('\n\n')
    .filter(Boolean)
    .map(para => `<p>${escapeHtml(para)}</p>`)
    .join('');

  return `
    <article class="post-detail" style="max-width:800px;margin:0 auto;">

      <!-- Back link -->
      <a href="blog.html" style="
        display:inline-flex;align-items:center;gap:6px;
        font-size:0.875rem;color:var(--color-turquoise);
        margin-bottom:var(--space-xl);text-decoration:none;
      ">← Back to all posts</a>

      <!-- Hero image -->
      ${post.image ? `
        <img
          src="${escapeHtml(post.image)}"
          alt="${escapeHtml(post.title)}"
          style="width:100%;border-radius:var(--radius-lg);margin-bottom:var(--space-xl);max-height:400px;object-fit:cover;"
          loading="eager"
        >
      ` : ''}

      <!-- Category + Date header -->
      <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-md);flex-wrap:wrap;">
        <span class="blog-category">${categoryIcon} ${escapeHtml(category)}</span>
        <time datetime="${escapeHtml(post.date || '')}" style="font-size:0.875rem;color:var(--color-text-muted);">
          ${formatDate(post.date)}
        </time>
        ${post.author
          ? `<span style="font-size:0.875rem;color:var(--color-text-muted);">
               · ✍️ ${escapeHtml(post.author)}
             </span>`
          : ''
        }
      </div>

      <!-- Title -->
      <h1 style="
        font-family:var(--font-heading);font-size:clamp(1.75rem,4vw,2.5rem);
        font-weight:900;color:var(--color-white);margin-bottom:var(--space-xl);
        line-height:1.2;
      ">${escapeHtml(post.title)}</h1>

      <!-- Content -->
      <div class="post-content" style="
        font-size:1.05rem;color:var(--color-text-secondary);
        line-height:1.85;max-width:700px;
      ">
        ${contentHtml}
      </div>

      <!-- Tags -->
      ${post.tags && post.tags.length > 0 ? `
        <div style="margin-top:var(--space-xl);padding-top:var(--space-lg);border-top:1px solid var(--glass-border);">
          <span style="font-size:0.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:1px;">Tags: </span>
          ${post.tags.map(tag =>
            `<span style="
              display:inline-block;padding:3px 10px;margin:3px;
              background:var(--glass-bg);border:1px solid var(--glass-border);
              border-radius:var(--radius-full);font-size:0.75rem;color:var(--color-text-secondary);
            ">${escapeHtml(tag)}</span>`
          ).join('')}
        </div>
      ` : ''}

      <!-- Share buttons -->
      <div style="margin-top:var(--space-xl);display:flex;gap:var(--space-md);flex-wrap:wrap;">
        <button
          class="btn-secondary"
          style="padding:10px 20px;font-size:0.8rem;"
          onclick="sharePost('${encodeURIComponent(post.title)}', '${encodeURIComponent(post.id)}')"
        >
          📤 Share this post
        </button>
        <a href="blog.html" class="btn-secondary" style="padding:10px 20px;font-size:0.8rem;">
          ← All Posts
        </a>
      </div>

    </article>
  `;
}

/**
 * buildCategoryFilter(categories)
 * Builds the category filter buttons row.
 *
 * @param  {string[]} categories - Unique category names
 * @returns {string}             - HTML string
 */
function buildCategoryFilter(categories) {
  const buttons = ['All', ...categories].map(cat => `
    <button
      class="category-filter-btn${cat === 'All' ? ' active' : ''}"
      data-category="${escapeHtml(cat)}"
      style="
        padding:6px 16px;border-radius:var(--radius-full);
        background:${cat === 'All' ? 'var(--color-turquoise)' : 'var(--glass-bg)'};
        color:${cat === 'All' ? 'var(--color-primary-deep)' : 'var(--color-text-secondary)'};
        border:1px solid ${cat === 'All' ? 'transparent' : 'var(--glass-border)'};
        font-size:0.8rem;font-weight:600;cursor:pointer;
        transition:all var(--transition-fast);white-space:nowrap;
        font-family:var(--font-primary);
      "
    >${escapeHtml(cat)}</button>
  `).join('');

  return `
    <div
      id="categoryFilters"
      style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-bottom:var(--space-xl);justify-content:center;"
      role="group"
      aria-label="Filter posts by category"
    >
      ${buttons}
    </div>
  `;
}


// ================================================================
// SECURITY UTILITIES
// ================================================================

/**
 * escapeHtml(str)
 * Prevents XSS by converting HTML special characters to safe entities.
 * ALWAYS use this when inserting user-supplied or external data into HTML.
 *
 * @param  {string} str - Potentially unsafe string
 * @returns {string}    - Safe string for HTML insertion
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');

  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}

/**
 * stripHtml(str)
 * Removes all HTML tags from a string (for plain-text excerpts).
 *
 * @param  {string} str
 * @returns {string}
 */
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}


// ================================================================
// BLOG RENDERING FUNCTIONS
// ================================================================

/**
 * renderHomepagePosts(posts)
 * Shows up to HOMEPAGE_PREVIEW_COUNT posts in the #blogGrid on index.html.
 *
 * @param {Object[]} posts - Array of post objects
 */
function renderHomepagePosts(posts) {
  const grid   = document.getElementById('blogGrid');
  const loader = document.getElementById('blogLoader');

  if (!grid) return;

  // Remove loader spinner
  if (loader) loader.remove();

  if (!posts || posts.length === 0) {
    grid.innerHTML = `
      <div style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">
        <p>No posts yet. Check back soon!</p>
      </div>
    `;
    return;
  }

  // Show only the first N posts (newest first)
  const previewPosts = posts.slice(0, BLOG_CONFIG.HOMEPAGE_PREVIEW_COUNT);

  grid.innerHTML = previewPosts.map(post => buildPostCard(post)).join('');

  // Trigger scroll reveal on new cards
  initRevealAfterRender();
}

/**
 * renderBlogPage(posts)
 * Renders the full blog listing page (blog.html).
 * Includes: search bar, category filters, all posts, pagination.
 *
 * @param {Object[]} posts - All post objects
 */
function renderBlogPage(posts) {
  const container = document.getElementById('blogPageContainer');
  if (!container) return;

  if (!posts || posts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-2xl);color:var(--color-text-muted);">
        <p style="font-size:1.2rem;">No posts yet. Come back soon!</p>
      </div>
    `;
    return;
  }

  // Extract unique categories
  const categories = [...new Set(posts.map(p => p.category || BLOG_CONFIG.DEFAULT_CATEGORY))];

  // Keep all posts in memory for filtering
  let filteredPosts = [...posts];
  let currentCategory = 'All';
  let searchQuery = '';

  // ── Build the search + filter + grid UI ──
  container.innerHTML = `

    <!-- Search bar -->
    <div style="max-width:500px;margin:0 auto var(--space-xl);">
      <div style="position:relative;">
        <span style="
          position:absolute;left:16px;top:50%;transform:translateY(-50%);
          font-size:1rem;color:var(--color-text-muted);pointer-events:none;
        ">🔍</span>
        <input
          type="search"
          id="blogSearch"
          placeholder="Search posts..."
          aria-label="Search blog posts"
          style="
            width:100%;padding:12px 16px 12px 44px;
            background:var(--glass-bg);border:1px solid var(--glass-border);
            border-radius:var(--radius-full);color:var(--color-white);
            font-family:var(--font-primary);font-size:0.95rem;
            outline:none;transition:border-color var(--transition-fast);
          "
        >
      </div>
    </div>

    <!-- Category filters -->
    ${buildCategoryFilter(categories)}

    <!-- Post count -->
    <p id="postCount" style="
      text-align:center;font-size:0.875rem;color:var(--color-text-muted);
      margin-bottom:var(--space-xl);
    ">${posts.length} post${posts.length !== 1 ? 's' : ''}</p>

    <!-- Blog grid (posts rendered here) -->
    <div class="blog-grid" id="blogListGrid"></div>

    <!-- No results message -->
    <div id="noResults" class="hidden" style="
      text-align:center;padding:var(--space-2xl);color:var(--color-text-muted);
    ">
      <p style="font-size:1.1rem;">No posts found for "<span id="searchTerm"></span>"</p>
      <button
        onclick="clearSearch()"
        class="btn-secondary"
        style="margin-top:var(--space-lg);padding:10px 24px;font-size:0.875rem;"
      >Clear search</button>
    </div>

  `;

  // Render initial posts
  renderPostGrid(filteredPosts);

  // ── Search event listener ──
  const searchInput = document.getElementById('blogSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });

    // Style focus state
    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = 'var(--color-turquoise-dim)';
    });
    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = 'var(--glass-border)';
    });
  }

  // ── Category filter event listeners ──
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;

      // Update button active states
      document.querySelectorAll('.category-filter-btn').forEach(b => {
        const isActive = b.dataset.category === currentCategory;
        b.style.background = isActive ? 'var(--color-turquoise)' : 'var(--glass-bg)';
        b.style.color      = isActive ? 'var(--color-primary-deep)' : 'var(--color-text-secondary)';
        b.style.borderColor = isActive ? 'transparent' : 'var(--glass-border)';
        b.classList.toggle('active', isActive);
      });

      applyFilters();
    });
  });

  /** Apply search + category filters and re-render */
  function applyFilters() {
    filteredPosts = posts.filter(post => {
      // Category filter
      const catMatch = currentCategory === 'All' ||
        (post.category || BLOG_CONFIG.DEFAULT_CATEGORY) === currentCategory;

      // Search filter: check title, excerpt, content, author
      const searchText = [post.title, post.excerpt, post.content, post.author]
        .filter(Boolean).join(' ').toLowerCase();
      const searchMatch = !searchQuery || searchText.includes(searchQuery);

      return catMatch && searchMatch;
    });

    renderPostGrid(filteredPosts);

    // Update count
    const countEl = document.getElementById('postCount');
    if (countEl) {
      countEl.textContent = `${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''}`;
    }

    // Show/hide no-results message
    const noResults = document.getElementById('noResults');
    const grid      = document.getElementById('blogListGrid');
    if (noResults && grid) {
      if (filteredPosts.length === 0) {
        noResults.classList.remove('hidden');
        grid.classList.add('hidden');
        const termEl = document.getElementById('searchTerm');
        if (termEl) termEl.textContent = searchQuery || currentCategory;
      } else {
        noResults.classList.add('hidden');
        grid.classList.remove('hidden');
      }
    }
  }

  /** Renders posts into the grid */
  function renderPostGrid(postsToShow) {
    const grid = document.getElementById('blogListGrid');
    if (!grid) return;

    grid.innerHTML = postsToShow.map(post => buildPostCard(post)).join('');
    initRevealAfterRender();
  }

  // Expose clearSearch globally for the inline onclick
  window.clearSearch = () => {
    searchQuery = '';
    currentCategory = 'All';
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.category-filter-btn').forEach(b => {
      const isAll = b.dataset.category === 'All';
      b.style.background  = isAll ? 'var(--color-turquoise)' : 'var(--glass-bg)';
      b.style.color       = isAll ? 'var(--color-primary-deep)' : 'var(--color-text-secondary)';
      b.style.borderColor = isAll ? 'transparent' : 'var(--glass-border)';
    });
    applyFilters();
  };
}

/**
 * renderSinglePost(posts, postId)
 * Shows a single full post in the #singlePostContainer element.
 *
 * @param {Object[]} posts  - All posts
 * @param {string}   postId - The post's unique id
 */
function renderSinglePost(posts, postId) {
  const container = document.getElementById('singlePostContainer');
  if (!container) return;

  const post = posts.find(p => p.id === postId);

  if (!post) {
    container.innerHTML = `
      <div style="text-align:center;padding:var(--space-2xl);">
        <p style="font-size:1.2rem;color:var(--color-text-muted);">Post not found.</p>
        <a href="blog.html" class="btn-secondary" style="margin-top:var(--space-lg);display:inline-block;padding:10px 24px;">
          ← Back to Blog
        </a>
      </div>
    `;
    return;
  }

  // Update page title and meta description for SEO
  document.title = `${post.title} | Jesus is LORD Radio Blog`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && post.excerpt) {
    metaDesc.setAttribute('content', stripHtml(post.excerpt).slice(0, 160));
  }

  container.innerHTML = buildPostDetail(post);
}


// ================================================================
// POST SHARING
// ================================================================

/**
 * sharePost(title, postId)
 * Share a specific blog post using Web Share API or clipboard.
 *
 * @param {string} title  - URL-encoded post title
 * @param {string} postId - URL-encoded post ID
 */
window.sharePost = function(title, postId) {
  const decodedTitle = decodeURIComponent(title);
  const postUrl = `${window.location.origin}${window.location.pathname}?id=${postId}`;

  const shareData = {
    title: decodedTitle,
    text:  `Read: "${decodedTitle}" on Jesus is LORD Radio`,
    url:   postUrl,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(err => {
      if (err.name !== 'AbortError') console.warn('Share failed:', err);
    });
  } else {
    navigator.clipboard.writeText(postUrl).then(() => {
      if (window.showToast) {
        window.showToast('Post link copied to clipboard!', 'success');
      } else {
        alert('Link copied: ' + postUrl);
      }
    });
  }
};


// ================================================================
// HELPER: Re-trigger scroll reveal after dynamic content is added
// ================================================================

/**
 * initRevealAfterRender()
 * After dynamically adding .reveal elements to the DOM, we need
 * to re-run the IntersectionObserver on them.
 */
function initRevealAfterRender() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );

  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
    observer.observe(el);
  });
}


// ================================================================
// MAIN — Fetch posts and render based on current page
// ================================================================

/**
 * loadBlog()
 * Entry point. Detects which page we're on and calls the
 * appropriate rendering function.
 */
async function loadBlog() {
  // Detect page context by looking for specific container elements
  const isHomepage     = !!document.getElementById('blogGrid');
  const isBlogPage     = !!document.getElementById('blogPageContainer');
  const isSinglePost   = !!document.getElementById('singlePostContainer');

  // If none of the blog containers exist, this page doesn't use blog.js
  if (!isHomepage && !isBlogPage && !isSinglePost) return;

  try {
    // Fetch the blog posts JSON file
    const response = await fetch(BLOG_CONFIG.DATA_URL, {
      // Cache for 5 minutes to avoid hammering the server on every page load
      // but refresh frequently enough that new posts appear quickly
      cache: 'default',
    });

    if (!response.ok) {
      throw new Error(`Failed to load posts: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render based on page type
    if (isHomepage) {
      renderHomepagePosts(posts);
    }

    if (isBlogPage) {
      // Check if a specific post ID is requested in the URL
      // e.g. blog.html?id=my-post-slug
      const urlParams = new URLSearchParams(window.location.search);
      const postId    = urlParams.get('id');

      if (postId) {
        // Show single post view
        renderSinglePost(posts, postId);
      } else {
        // Show the full post listing
        renderBlogPage(posts);
      }
    }

  } catch (error) {
    console.error('[Blog] Error loading posts:', error);

    // Show friendly error message on the page
    const containers = [
      document.getElementById('blogGrid'),
      document.getElementById('blogPageContainer'),
      document.getElementById('singlePostContainer'),
    ].filter(Boolean);

    containers.forEach(container => {
      const loader = document.getElementById('blogLoader');
      if (loader) loader.remove();

      container.innerHTML = `
        <div style="text-align:center;padding:var(--space-xl);color:var(--color-text-muted);">
          <p>Unable to load posts at this time.</p>
          <p style="font-size:0.8rem;margin-top:var(--space-sm);">
            Please try refreshing the page. If the problem persists, check that
            data/posts.json exists and is valid JSON.
          </p>
        </div>
      `;
    });
  }
}


// ================================================================
// AUTO-INITIALIZE
// ================================================================

// Load blog when DOM is ready
document.addEventListener('DOMContentLoaded', loadBlog);
