# Ministry of Repentance and Holiness — Website Project

## Two Sister Websites, One Mission

This repository contains the complete source code for two interlinked ministry websites:

| Site | Domain | Purpose |
|------|--------|---------|
| **Jesus is LORD Radio** | jesusislordradio.info | Live internet radio broadcast hub |
| **Repentance & Holiness** | repentandpreparetheway.org | Main ministry content portal |

Both sites share the same branding, navigation philosophy, and cross-link to each other
prominently in their navigation menus — users can move freely between them.

---

## Brand Identity

| Element | Value |
|---------|-------|
| Primary Blue | `#0f268c` |
| White | `#ffffff` |
| Turquoise / Cyan | `#00ffff` |
| Yellow | `#ffff00` |
| Primary Font | Roboto (Google Fonts — free) |
| Heading Font | Roboto Condensed |
| Logo | White dove over globe — `/assets/images/logo.png` |

---

## Project Structure

```
ministry-websites/
│
├── README.md                          ← You are here
├── .gitignore                         ← Git ignore rules
│
├── jesusislordradio/                  ← SITE 1: Radio site
│   ├── index.html                     ← Homepage with live radio
│   ├── css/
│   │   └── style.css                  ← All styles for Site 1
│   ├── js/
│   │   ├── app.js                     ← Core application logic
│   │   ├── radio.js                   ← Live radio player + wave visualizer
│   │   └── blog.js                    ← Blog rendering engine
│   ├── data/
│   │   └── posts.json                 ← Blog posts (edit to add new posts)
│   ├── pages/
│   │   ├── library.html               ← Audio, Video, Documents library
│   │   └── blog.html                  ← Blog listing page
│   ├── admin/
│   │   └── index.html                 ← Admin panel to compose blog posts
│   └── assets/
│       └── images/                    ← Place logo.png and other images here
│
└── repentandpreparetheway/            ← SITE 2: Ministry portal
    ├── index.html                     ← Homepage
    ├── css/
    │   └── style.css                  ← All styles for Site 2
    ├── js/
    │   ├── app.js                     ← Core application logic
    │   └── blog.js                    ← Blog rendering engine
    ├── data/
    │   └── posts.json                 ← Blog posts (edit to add new posts)
    ├── pages/
    │   ├── about.html                 ← About the ministry
    │   ├── prophecies.html            ← Fulfilled prophecies archive (150+)
    │   ├── documents.html             ← PDF downloads (13 documents)
    │   ├── miracles.html              ← Miracles & healings
    │   ├── teachings.html             ← Audio/Video teachings
    │   ├── salvation.html             ← Salvation prayer
    │   ├── gallery.html               ← Photo gallery
    │   ├── translations.html          ← Multi-language access
    │   └── blog.html                  ← Blog listing page
    └── assets/
        └── images/                    ← Place logo.png and other images here
```

---

## How to Add a New Blog Post

### Method 1: Edit the JSON directly (Recommended for technical users)

1. Open `jesusislordradio/data/posts.json` or `repentandpreparetheway/data/posts.json`
2. Add a new object at the **top** of the array (newest first), following this format:

```json
{
  "id": "unique-slug-here",
  "title": "Your Blog Post Title",
  "date": "2026-05-18",
  "author": "Ministry Team",
  "category": "Prophecy",
  "excerpt": "A short 1–2 sentence summary of the post...",
  "content": "Full post content here. Use \\n\\n for paragraph breaks.",
  "image": "assets/images/post-image.jpg",
  "featured": false
}
```

3. Commit and push to GitHub — Cloudflare Pages auto-deploys within ~60 seconds.

### Method 2: Use the Admin Panel (Recommended for non-technical users)

1. Navigate to `/admin/index.html` on the radio site
2. Enter the admin password (default: `ministry2024` — **change this!**)
3. Fill in the post form and click **Generate JSON**
4. Copy the output JSON and follow Method 1 steps 1 and 3 above

---

## How to Update the Live Radio Stream URL

Open `jesusislordradio/js/radio.js` and find this line near the top:

```javascript
const STREAM_URL = 'YOUR_RADIO_STREAM_URL_HERE';
```

Replace `YOUR_RADIO_STREAM_URL_HERE` with your actual Shoutcast/Icecast stream URL.
Example: `https://stream.zeno.fm/your-station-id`

---

## How to Update Contact Information

- **Radio site**: Edit `jesusislordradio/index.html`, search for `<!-- CONTACT SECTION -->`
- **Ministry site**: Edit `repentandpreparetheway/index.html`, search for `<!-- CONTACT SECTION -->`

---

## Deploying to Cloudflare Pages

### Initial Setup

1. Push this repository to GitHub
2. Log into [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select this repository
5. Create **two separate Cloudflare Pages projects**:

**Project 1 (Radio site):**
- Project name: `jesusislordradio`
- Build output directory: `jesusislordradio`
- Root directory: `/` (leave blank)

**Project 2 (Ministry site):**
- Project name: `repentandpreparetheway`
- Build output directory: `repentandpreparetheway`
- Root directory: `/` (leave blank)

6. Add your custom domains in each project's **Custom domains** settings:
   - Project 1 → `jesusislordradio.info`
   - Project 2 → `repentandpreparetheway.org`

### Updating the Live Site

Simply push changes to GitHub — Cloudflare Pages deploys automatically within ~60 seconds.
No FTP, no manual uploads, no downtime.

---

## Performance Features

| Feature | Implementation |
|---------|---------------|
| Animated gradient background | Pure CSS — no JavaScript overhead |
| Images | Native lazy loading (`loading="lazy"`) |
| Fonts | Preconnect + display=swap |
| No broken embeds | All BannerSnack iframes removed |
| YouTube videos | Facade/thumbnail pattern — iframe loads only on click |
| Caching | `_headers` file sets 1-year cache on assets |
| Mobile-first | CSS Grid + Flexbox, all breakpoints |
| Accessibility | ARIA labels, semantic HTML5, keyboard nav |

---

## Adding Images

Place image files in the appropriate `assets/images/` folder.
Recommended formats:
- **Photos**: `.webp` (best compression) or `.jpg` (fallback)
- **Logo / Icons**: `.png` (transparency support)
- **Maximum width**: 1920px for hero images, 800px for content images

The **logo file** must be named exactly `logo.png` and placed in both:
- `jesusislordradio/assets/images/logo.png`
- `repentandpreparetheway/assets/images/logo.png`

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 80+ | ✅ Full |
| Firefox 75+ | ✅ Full |
| Safari 13+ | ✅ Full |
| Edge 80+ | ✅ Full |
| Mobile browsers | ✅ Full (iOS Safari, Chrome Android) |
| Internet Explorer | ❌ Not supported |

---

## Credits

Built from scratch for the Ministry of Repentance and Holiness, Nakuru, Kenya.
Designed to replace two slow, outdated sites with a fast, modern, accessible experience.

For technical support, refer to the comments inside each file —
every section is documented for easy future updates.
