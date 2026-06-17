/* ============================================================
   Kiros Gan — Portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const PHOTOS = window.PHOTOS || [];
  const PHOTO_DIR = "assets/photos/";
  const THUMB_DIR = "assets/thumbs/";

  // Progressive enhancement flag: CSS only hides content for reveal animations
  // when this class is present, so a JS hiccup can never leave the page blank.
  document.documentElement.classList.add("js");

  /* ---------------- Logo injection ---------------- */
  const LOGO_SVG = `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="3"/>
      <g fill="currentColor" opacity="0.92">
        <path d="M60 18 L86 33 L60 33 Z"/><path d="M99 41 L99 71 L78 49 Z"/>
        <path d="M99 79 L73 94 L73 73 Z"/><path d="M60 102 L34 87 L60 87 Z"/>
        <path d="M21 79 L21 49 L42 71 Z"/><path d="M21 41 L47 26 L47 47 Z"/>
      </g>
      <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" stroke-width="3"/>
    </svg>`;
  $$("#brandLogo, #brandLogoFooter").forEach((el) => (el.innerHTML = LOGO_SVG));

  /* ---------------- Preloader ---------------- */
  const preloader = $("#preloader");
  const preCount = $("#preCount");
  let pc = 0, dismissed = false;
  const dismiss = () => { if (!dismissed) { dismissed = true; preloader && preloader.classList.add("done"); } };
  const playHero = () => $$(".hero__title .line").forEach((l, i) =>
    setTimeout(() => l.classList.add("in"), 150 + i * 120));
  const tick = setInterval(() => {
    pc = Math.min(100, pc + Math.floor(Math.random() * 16) + 6);
    if (preCount) preCount.textContent = String(pc).padStart(2, "0");
    if (pc >= 100) { clearInterval(tick); setTimeout(() => { dismiss(); playHero(); }, 250); }
  }, 80);
  window.addEventListener("load", () => { dismiss(); playHero(); });
  if (document.readyState === "complete") { dismiss(); playHero(); }
  // hard safety: never let the loader linger/spin regardless of resource load time
  setTimeout(() => { dismiss(); playHero(); }, 2200);

  /* ---------------- Year ---------------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Marquee (seamless, responsive) ----------------
     We only ever rewrite the track's CONTENT, never its `animation`
     property — so the continuous CSS animation (declared once in
     styles.css) keeps running smoothly and never restarts/lurches.
     We repeat the words until one half is wider than the viewport,
     then duplicate that half so translateX(-50%) loops with no gap. */
  (function buildMarquee() {
    const track = $(".marquee__track");
    if (!track) return;
    const words = ["Landscape", "Architecture", "Street", "Travel", "Night", "Nature"];
    const unit = words.map((w) => `<span>${w}</span><span>•</span>`).join("");
    let lastW = -1;
    function fill() {
      const vw = window.innerWidth;
      if (Math.abs(vw - lastW) < 60) return; // ignore tiny/no-op resizes (mobile URL bar etc.)
      lastW = vw;
      track.innerHTML = unit;
      let guard = 0;
      while (track.scrollWidth < vw + 120 && guard++ < 40) track.innerHTML += unit;
      track.innerHTML += track.innerHTML; // two identical halves → seamless -50% loop
    }
    fill();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(fill, 250); }, { passive: true });
  })();

  /* ---------------- Nav scroll + progress ---------------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const toggleMenu = (force) => {
    const open = force !== undefined ? force : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", open);
    mobileMenu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuToggle.addEventListener("click", () => toggleMenu());
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------------- Theme system (with recent memory) ---------------- */
  const THEMES = [
    { id: "noir",   name: "Noir",   colors: ["#0c0c0f", "#d9b25c"] },
    { id: "ember",  name: "Ember",  colors: ["#0f0a08", "#ff6a3d"] },
    { id: "forest", name: "Forest", colors: ["#08100c", "#4fd996"] },
    { id: "violet", name: "Violet", colors: ["#0c0a14", "#8b7bff"] },
    { id: "ocean",  name: "Ocean",  colors: ["#070d12", "#3fb6e8"] },
    { id: "mono",   name: "Mono",   colors: ["#0a0a0a", "#ffffff"] },
    { id: "frost",  name: "Frost",  colors: ["#eaecf1", "#2f6df0"] },
    { id: "sand",   name: "Sand",   colors: ["#efe7d8", "#b8742a"] },
  ];
  const LS_THEME = "kg.theme";
  const LS_RECENT = "kg.recentThemes";

  const themeBtn = $("#themeBtn");
  const themePanel = $("#themePanel");
  const themeAllWrap = $("#themeAll");
  const themeRecentWrap = $("#themeRecent");
  const themeRecentGroup = $("#themeRecentWrap");
  const themeNameOut = $("#themeName");

  const getRecent = () => {
    try { return JSON.parse(localStorage.getItem(LS_RECENT)) || []; }
    catch (e) { return []; }
  };

  function makeSwatch(t, activeId) {
    const b = document.createElement("button");
    b.className = "swatch" + (t.id === activeId ? " active" : "");
    b.style.background = `linear-gradient(135deg, ${t.colors[1]} 0 50%, ${t.colors[0]} 50% 100%)`;
    b.setAttribute("aria-label", `${t.name} theme`);
    b.dataset.theme = t.id;
    b.innerHTML = `<span class="swatch__name">${t.name}</span>`;
    b.addEventListener("click", () => applyTheme(t.id, true));
    return b;
  }

  function renderSwatches() {
    const active = document.documentElement.getAttribute("data-theme");
    themeAllWrap.innerHTML = "";
    THEMES.forEach((t) => themeAllWrap.appendChild(makeSwatch(t, active)));

    const recent = getRecent().filter((id) => id !== active);
    if (recent.length) {
      themeRecentGroup.hidden = false;
      themeRecentWrap.innerHTML = "";
      recent.slice(0, 5).forEach((id) => {
        const t = THEMES.find((x) => x.id === id);
        if (t) themeRecentWrap.appendChild(makeSwatch(t, active));
      });
    } else {
      themeRecentGroup.hidden = true;
    }
  }

  function applyTheme(id, persist) {
    const t = THEMES.find((x) => x.id === id) || THEMES[0];
    document.documentElement.setAttribute("data-theme", t.id);
    if (themeNameOut) themeNameOut.textContent = t.name;
    if (persist) {
      localStorage.setItem(LS_THEME, t.id);
      const recent = [t.id, ...getRecent().filter((x) => x !== t.id)].slice(0, 6);
      localStorage.setItem(LS_RECENT, JSON.stringify(recent));
    }
    renderSwatches();
  }

  // init theme from storage
  applyTheme(localStorage.getItem(LS_THEME) || "noir", false);

  const openThemePanel = (open) => {
    const o = open !== undefined ? open : !themePanel.classList.contains("open");
    themePanel.classList.toggle("open", o);
    themeBtn.setAttribute("aria-expanded", o);
    themePanel.setAttribute("aria-hidden", !o);
    if (o) renderSwatches();
  };
  themeBtn.addEventListener("click", (e) => { e.stopPropagation(); openThemePanel(); });
  document.addEventListener("click", (e) => {
    if (themePanel.classList.contains("open") &&
        !themePanel.contains(e.target) && !themeBtn.contains(e.target)) {
      openThemePanel(false);
    }
  });

  /* ---------------- Gallery render ---------------- */
  const gallery = $("#gallery");
  const filtersWrap = $("#filters");

  const cats = ["All", ...[...new Set(PHOTOS.map((p) => p.category))].sort()];
  cats.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "filter" + (i === 0 ? " active" : "");
    b.textContent = c;
    b.dataset.cat = c;
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => setFilter(c, b));
    filtersWrap.appendChild(b);
  });

  function buildCard(p, idx) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.cat = p.category;
    card.dataset.index = idx;
    card.style.aspectRatio = `${p.w} / ${p.h}`;
    card.innerHTML = `
      <img class="card__img" loading="lazy" src="${THUMB_DIR}${p.file}"
           alt="${p.title} — ${p.category} photograph" width="${p.w}" height="${p.h}" />
      <div class="card__expand" aria-hidden="true">⤢</div>
      <div class="card__overlay">
        <span class="card__cat">${p.category}</span>
        <h3 class="card__title">${p.title}</h3>
        <p class="card__loc">${p.location} · ${p.year}</p>
      </div>`;
    card.addEventListener("click", () => openLightbox(idx));
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${p.title}`);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(idx); }
    });
    return card;
  }

  function renderGallery() {
    gallery.innerHTML = "";
    PHOTOS.forEach((p, i) => gallery.appendChild(buildCard(p, i)));
    observeCards();
  }

  let cardObserver;
  function observeCards() {
    if (cardObserver) cardObserver.disconnect();
    cardObserver = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); cardObserver.unobserve(en.target); }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".card").forEach((c) => cardObserver.observe(c));
    // Safety net: if IntersectionObserver never fires (edge browsers, fast
    // scroll, restored scroll position), reveal everything so nothing stays blank.
    setTimeout(() => $$(".card").forEach((c) => c.classList.add("in")), 1500);
  }

  function setFilter(cat, btn) {
    $$(".filter").forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    $$(".card").forEach((card) => {
      const show = cat === "All" || card.dataset.cat === cat;
      card.style.display = show ? "" : "none";
      if (show) { card.classList.remove("in"); }
    });
    // re-trigger reveal for visible cards, with a safety net so they always show
    requestAnimationFrame(() =>
      $$(".card").forEach((c) => { if (c.style.display !== "none") cardObserver.observe(c); })
    );
    setTimeout(() => $$(".card").forEach((c) => {
      if (c.style.display !== "none") c.classList.add("in");
    }), 700);
  }

  renderGallery();

  /* ---------------- Lightbox ---------------- */
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbTitle = $("#lbTitle");
  const lbBlurb = $("#lbBlurb");
  const lbCat = $("#lbCat");
  const lbLoc = $("#lbLoc");
  const lbYear = $("#lbYear");
  const lbIndex = $("#lbIndex");
  let current = 0;

  function visibleIndices() {
    return $$(".card").filter((c) => c.style.display !== "none").map((c) => +c.dataset.index);
  }

  function openLightbox(idx) {
    current = idx;
    showPhoto(idx);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function showPhoto(idx) {
    const p = PHOTOS[idx];
    if (!p) return;
    // Show the already-cached thumbnail immediately so the viewer is never blank,
    // then swap in the full-resolution image once it has finished loading.
    lbImg.src = THUMB_DIR + p.file;
    lbImg.style.opacity = 1;
    const full = new Image();
    full.onload = () => { if (current === idx) lbImg.src = full.src; };
    full.src = PHOTO_DIR + p.file;
    lbImg.alt = `${p.title} — ${p.category}`;
    lbTitle.textContent = p.title;
    lbBlurb.textContent = p.blurb;
    lbCat.textContent = p.category;
    lbLoc.textContent = p.location;
    lbYear.textContent = p.year;
    lbIndex.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(PHOTOS.length).padStart(2, "0")}`;
  }
  function step(dir) {
    const vis = visibleIndices();
    if (!vis.length) return;
    let pos = vis.indexOf(current);
    pos = (pos + dir + vis.length) % vis.length;
    current = vis[pos];
    showPhoto(current);
  }
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  // swipe
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ---------------- Hero + About images ---------------- */
  const heroPick = PHOTOS.find((p) => p.file.includes("red-mirror")) ||
                   PHOTOS.find((p) => p.h < p.w) || PHOTOS[0];
  if (heroPick) $("#heroBg").style.backgroundImage = `url(${PHOTO_DIR}${heroPick.file})`;
  const aboutPick = PHOTOS.find((p) => p.file.includes("window-light")) ||
                    PHOTOS.find((p) => p.category === "Portrait") || PHOTOS[3];
  if (aboutPick) $("#aboutImg").style.backgroundImage = `url(${PHOTO_DIR}${aboutPick.file})`;

  // subtle hero parallax
  window.addEventListener("scroll", () => {
    const bg = $("#heroBg");
    if (bg) bg.style.transform = `scale(1.08) translateY(${window.scrollY * 0.18}px)`;
  }, { passive: true });

  /* ---------------- Reveal on scroll ---------------- */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); }
    }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------------- Animated counters ---------------- */
  const counterObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.count;
      let n = 0;
      const dur = 1400, t0 = performance.now();
      const run = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.floor((1 - Math.pow(1 - k, 3)) * target);
        if (k < 1) requestAnimationFrame(run); else el.textContent = target;
      };
      requestAnimationFrame(run);
      counterObs.unobserve(el);
    }),
    { threshold: 0.5 }
  );
  $$("[data-count]").forEach((el) => counterObs.observe(el));

  /* ---------------- Contact form ---------------- */
  const form = $("#contactForm");
  const status = $("#contactStatus");
  const setErr = (id, msg) => {
    const field = $("#" + id).closest(".field");
    field.classList.toggle("invalid", !!msg);
    const span = $(`.field__error[data-for="${id}"]`);
    if (span) span.textContent = msg || "";
  };
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cf-name").value.trim();
    const email = $("#cf-email").value.trim();
    const topic = $("#cf-topic").value;
    const msg = $("#cf-msg").value.trim();
    let ok = true;
    if (!name) { setErr("cf-name", "Please tell me your name."); ok = false; } else setErr("cf-name", "");
    if (!isEmail(email)) { setErr("cf-email", "Enter a valid email."); ok = false; } else setErr("cf-email", "");
    if (msg.length < 8) { setErr("cf-msg", "A little more detail, please."); ok = false; } else setErr("cf-msg", "");
    if (!ok) { status.textContent = "Please fix the highlighted fields."; status.style.color = "#ff6b6b"; return; }

    const subject = encodeURIComponent(`[Portfolio] ${topic} — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${msg}`);
    status.style.color = "var(--accent)";
    status.textContent = "Opening your email app…";
    window.location.href = `mailto:gank8818@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      status.textContent = "Thanks, " + name + "! If your mail app didn't open, email gank8818@gmail.com directly.";
      form.reset();
    }, 900);
  });

  // prevent dead "#" links from jumping
  $$('a[href="#"]').forEach((a) =>
    a.addEventListener("click", (e) => e.preventDefault())
  );
})();
