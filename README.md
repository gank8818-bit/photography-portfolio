# Kiros Gan — Photography Portfolio

A fast, hand-built, **no-framework** photography portfolio. Pure HTML, CSS and vanilla JS — no build step, deploys anywhere static.

![Theme: Noir](https://img.shields.io/badge/theme-multi--palette-d9b25c) ![Build](https://img.shields.io/badge/build-static-success)

## ✨ Features

- **Curated gallery** — 20 selected works in a responsive masonry layout with genre filters (Architecture, Landscape, Street, Travel, Night, Nature, Portrait, Creative, Urban).
- **Full-screen lightbox** — click any frame; navigate with the arrows, keyboard ← / → / Esc, or swipe on mobile. Each image carries title, genre, location, year and a short note.
- **Colour-theme switcher with memory** — 8 hand-tuned palettes (Noir, Ember, Forest, Violet, Ocean, Mono, Frost, Sand). Your pick is saved to `localStorage` and your **recently used themes** surface at the top of the picker.
- **Custom aperture monogram logo** + favicon (SVG, theme-aware).
- **Animated hero** with parallax background, line-reveal headline and live stat counters.
- **Working contact form** — client-side validation that composes an email to the photographer (`mailto:`), plus direct contact chips.
- **Polished motion** — scroll-reveal, scroll progress bar, marquee, grain overlay, animated preloader — all respecting `prefers-reduced-motion`.
- **Responsive + accessible** — keyboard-navigable gallery & lightbox, semantic landmarks, mobile menu.
- **Copyright notice** in the footer.

## 📁 Structure

```
photography-portfolio/
├── index.html          # markup
├── styles.css          # design system + all themes
├── script.js           # gallery, lightbox, themes, form, motion
├── photos.json         # machine-readable manifest of the selection
├── assets/
│   ├── data.js         # gallery data (titles, captions, dimensions)
│   ├── logo.svg        # aperture monogram
│   ├── favicon.svg
│   ├── photos/         # full-size web images (max 2000px)
│   └── thumbs/         # gallery thumbnails (max 900px)
└── README.md
```

## 🚀 Run locally

It's fully static — just open `index.html`, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 🌐 Deploy (GitHub Pages)

1. Push to GitHub (already done).
2. Repo **Settings → Pages → Build and deployment → Source: `Deploy from a branch`**, branch `main`, folder `/ (root)`.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

## ✏️ Customise

- **Photos / captions:** edit `assets/data.js`.
- **Contact email / socials:** search for `gank8818@gmail.com` and the contact chips in `index.html` / `script.js`.
- **Themes:** add an entry to the `THEMES` array in `script.js` and a matching `[data-theme="…"]` block in `styles.css`.

## © Copyright

© Kiros Gan. All photographs are original works and are protected by copyright.
No image may be reproduced, downloaded or used without written permission.
