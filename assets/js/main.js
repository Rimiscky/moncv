/* ==========================================================================
   Portfolio — interactions & animations (vanilla JS, sans dépendance)
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } },
  };

  /* ---------- Thème ---------- */
  const savedTheme = store.get("theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  else if (matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";
  const syncThemeColor = () => $('meta[name="theme-color"]').setAttribute("content", root.dataset.theme === "light" ? "#f5f6fa" : "#07080c");
  syncThemeColor();
  $(".theme-toggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    store.set("theme", root.dataset.theme);
    syncThemeColor();
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Découpage du texte ---------- */
  $$(".split").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "char";
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch === " " ? " " : ch;
      s.style.transitionDelay = `${0.1 + i * 0.045}s`;
      el.appendChild(s);
    });
  });
  $$(".reveal-words").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  });

  /* ---------- Loader ---------- */
  const loader = $(".loader");
  const count = $(".loader__count");
  const start = performance.now();
  const duration = reduceMotion ? 200 : 1300;
  let loaded = document.readyState === "complete";
  addEventListener("load", () => (loaded = true));
  (function tick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const shown = Math.round(eased * (loaded ? 100 : 92));
    count.textContent = shown;
    if (t < 1 || !loaded) requestAnimationFrame(tick);
    else finishLoading();
  })(start);
  // Sécurité : ne jamais bloquer l'accès au contenu
  setTimeout(() => { loaded = true; }, 3500);

  function finishLoading() {
    count.textContent = "100";
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
    setTimeout(() => loader.remove(), 1100);
    startCounters();
  }

  /* ---------- Rotation des mots ---------- */
  const words = ["Shopify", "CRO & A/B test", "Tracking & Data", "SEO technique", "IA & Automatisation"];
  const word = $(".rotator__word");
  let wi = 0;
  if (!reduceMotion) {
    setInterval(() => {
      word.classList.add("is-out");
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        word.textContent = words[wi];
        word.classList.remove("is-out");
        word.classList.add("is-in");
        void word.offsetWidth;
        word.classList.remove("is-in");
      }, 450);
    }, 2600);
  }

  /* ---------- Compteurs ---------- */
  function startCounters() {
    $$(".count").forEach((el) => {
      const to = +el.dataset.to;
      const t0 = performance.now();
      const d = reduceMotion ? 1 : 1600;
      (function step(now) {
        const t = clamp((now - t0) / d, 0, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ---------- Apparition au scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  const observeReveals = (scope = document) => {
    // Décalage en cascade des éléments frères
    $$(".reveal:not(.is-in)", scope).forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
      io.observe(el);
    });
  };
  observeReveals();

  $$(".meter").forEach((m) => {
    m.style.setProperty("--v", (+m.dataset.value || 90) / 100);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { m.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.6 }).observe(m);
  });

  /* ---------- Boucle de scroll (progression, header, mots, timeline, parallaxe) ---------- */
  const header = $(".header");
  const progress = $(".progress");
  const wordBlocks = $$(".reveal-words");
  const parallax = $$("[data-parallax]");
  let scrollTicking = false;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle("is-scrolled", y > 20);

    const vh = innerHeight;
    wordBlocks.forEach((block) => {
      const r = block.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) return;
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const ws = block.children;
      const on = Math.ceil(p * ws.length);
      for (let i = 0; i < ws.length; i++) ws[i].classList.toggle("is-on", i < on);
    });

    $$(".timeline:not([hidden])").forEach((tl) => {
      const r = tl.getBoundingClientRect();
      const p = clamp((vh * 0.7 - r.top) / r.height, 0, 1);
      tl.querySelector(".timeline__line span").style.setProperty("--p", p);
    });

    if (!reduceMotion) parallax.forEach((el) => { el.style.transform = `translate3d(0, ${y * 0.12}px, 0)`; });
    scrollTicking = false;
  }
  addEventListener("scroll", () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Navigation active ---------- */
  const navLinks = $$(".nav__link");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && navIO.observe(s));

  /* ---------- Curseur ---------- */
  const cursor = $(".cursor");
  if (finePointer && !reduceMotion) {
    const dot = $(".cursor__dot"), ring = $(".cursor__ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    (function loop() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, .project"));
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  const bindMagnetic = (el) => {
    if (!finePointer || reduceMotion) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  };
  $$(".magnetic").forEach(bindMagnetic);

  /* ---------- Inclinaison 3D + projecteur ---------- */
  const bindTilt = (el, strength = 8) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      if (!finePointer || reduceMotion || !el.classList.contains("tilt") && !el.classList.contains("project")) return;
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * strength}deg) rotateY(${(px - 0.5) * strength}deg) translateZ(0)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  };
  $$(".spotlight").forEach((el) => bindTilt(el, 6));
  $$(".avatar.tilt").forEach((el) => bindTilt(el, 14));

  /* ---------- Onglets parcours ---------- */
  const tabs = $$(".tabs__btn");
  const glider = $(".tabs__glider");
  const moveGlider = () => {
    const active = $(".tabs__btn.is-active");
    glider.style.width = `${active.offsetWidth}px`;
    glider.style.transform = `translateX(${active.offsetLeft}px)`;
  };
  tabs.forEach((btn) => btn.addEventListener("click", () => {
    if (btn.classList.contains("is-active")) return;
    tabs.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    $$("[data-panel]").forEach((p) => {
      const show = p.dataset.panel === btn.dataset.tab;
      p.hidden = !show;
      p.classList.remove("is-entering");
      if (show) {
        $$(".reveal", p).forEach((el) => el.classList.add("is-in"));
        void p.offsetWidth;
        p.classList.add("is-entering");
      }
    });
    moveGlider();
    onScroll();
  }));
  moveGlider();
  addEventListener("resize", moveGlider);
  document.fonts && document.fonts.ready.then(moveGlider);

  /* ---------- Copier l'e-mail ---------- */
  const toast = $(".toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2200);
  };
  $$(".copy").forEach((btn) => btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast("E-mail copié ✓"); }
    catch { location.href = `mailto:${btn.dataset.copy}`; }
  }));

  /* ======================================================================
     PROJETS
     ====================================================================== */
  const PROJECTS = window.PROJECTS || [];
  const CATEGORIES = window.CATEGORIES || [{ id: "all", label: "Tous" }];
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || id;
  const grid = $("#project-grid");
  const filtersEl = $(".filters");

  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u = "") => (/^(https?:|mailto:|tel:|\.?\/?assets\/|#)/i.test(u) || !/^[a-z]+:/i.test(u) ? u : "#");

  const media = (p, eager = false) => {
    if (p.cover) return `<img src="${esc(safeUrl(p.cover))}" alt="" ${eager ? "" : 'loading="lazy"'} decoding="async" />`;
    const [c1, c2] = p.accent || ["#22d3ee", "#8b5cf6"];
    return `<div class="gen" style="--c1:${esc(c1)};--c2:${esc(c2)}"><span>${esc(p.glyph || p.title.split(" ")[0])}</span></div>`;
  };

  function renderFilters() {
    filtersEl.innerHTML = CATEGORIES
      .filter((c) => c.id === "all" || PROJECTS.some((p) => p.category === c.id))
      .map((c, i) => {
        const n = c.id === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.category === c.id).length;
        return `<button class="filter${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-filter="${esc(c.id)}">${esc(c.label)}<sup>${n}</sup></button>`;
      }).join("");
  }

  function renderProjects() {
    if (!PROJECTS.length) {
      grid.innerHTML = `<p class="grid__empty">Les projets arrivent bientôt.</p>`;
      return;
    }
    grid.innerHTML = PROJECTS.map((p, i) => `
      <button class="project reveal spotlight${p.featured ? " is-featured" : ""}" data-index="${i}" data-cat="${esc(p.category)}" type="button" aria-label="Ouvrir le projet ${esc(p.title)}">
        <div class="project__media">
          ${media(p)}
          <span class="project__badge">${esc(catLabel(p.category))}</span>
          ${p.video ? '<span class="play" aria-hidden="true">▶</span>' : ""}
        </div>
        <div class="project__body">
          <div class="project__meta"><span>${esc(p.client || p.role || "")}</span><span>${esc(p.year || "")}</span></div>
          <h3 class="project__title">${esc(p.title)}</h3>
          ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ""}
          <div class="project__tags">${(p.tags || []).slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div>
        <span class="project__arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
      </button>`).join("");
    $$(".project", grid).forEach((card) => {
      bindTilt(card, 5);
      card.addEventListener("click", () => openProject(+card.dataset.index, card));
    });
    observeReveals(grid);
  }

  // Filtrage animé (technique FLIP)
  function applyFilter(id) {
    const cards = $$(".project", grid);
    const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    cards.forEach((c) => {
      const show = id === "all" || c.dataset.cat === id;
      c.classList.toggle("is-hidden", !show);
      c.classList.add("is-in");
    });
    if (reduceMotion) return;
    cards.forEach((c) => {
      if (c.classList.contains("is-hidden")) return;
      const a = first.get(c);
      const b = c.getBoundingClientRect();
      const wasHidden = a.width === 0;
      const anim = wasHidden
        ? [{ opacity: 0, transform: "scale(0.9) translateY(20px)" }, { opacity: 1, transform: "none" }]
        : [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` }, { transform: "none" }];
      c.animate(anim, { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    });
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn || btn.classList.contains("is-active")) return;
    $$(".filter", filtersEl).forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    btn.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
    applyFilter(btn.dataset.filter);
  });

  /* ---------- Fiche projet ---------- */
  const modal = $("#modal");
  const sheet = $(".modal__sheet", modal);
  const body = $(".modal__body", modal);
  let current = -1;
  let lastFocus = null;

  const videoEmbed = (url) => {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Vidéo du projet" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" loading="lazy"></iframe>`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `<iframe src="https://player.vimeo.com/video/${vm[1]}" title="Vidéo du projet" allow="fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    return `<video src="${esc(safeUrl(url))}" controls playsinline preload="metadata"></video>`;
  };

  function projectHTML(i) {
    const p = PROJECTS[i];
    const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const facts = [["Année", p.year], ["Rôle", p.role], ["Client", p.client]].filter(([, v]) => v);
    return `
      <div class="pm__hero">${media(p, true)}</div>
      <div class="pm__content">
        <span class="pm__cat">${esc(catLabel(p.category))}</span>
        <h2 class="pm__title" id="modal-title">${esc(p.title)}</h2>
        ${p.subtitle ? `<p class="pm__subtitle">${esc(p.subtitle)}</p>` : ""}
        ${facts.length ? `<div class="pm__facts">${facts.map(([k, v]) => `<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join("")}</div>` : ""}
        <div class="pm__text">${(p.description || [p.summary]).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join("")}</div>
        ${p.results && p.results.length ? `<div class="pm__results">${p.results.map((r) => `<div><strong>${esc(r.value)}</strong><span>${esc(r.label)}</span></div>`).join("")}</div>` : ""}
        ${p.video ? `<div class="pm__video">${videoEmbed(p.video)}</div>` : ""}
        ${p.gallery && p.gallery.length ? `<div class="pm__gallery">${p.gallery.map((g) => `<img src="${esc(safeUrl(g))}" alt="Aperçu — ${esc(p.title)}" loading="lazy" />`).join("")}</div>` : ""}
        ${p.tags && p.tags.length ? `<ul class="pills">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${p.links && p.links.length ? `<div class="pm__links">${p.links.map((l, k) => `<a class="btn ${k === 0 ? "btn--primary" : "btn--ghost"}" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener"><span>${esc(l.label)}</span><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>`).join("")}</div>` : ""}
        ${PROJECTS.length > 1 ? `<nav class="pm__nav">
          <button type="button" data-go="${(i - 1 + PROJECTS.length) % PROJECTS.length}">← Précédent<strong>${esc(prev.title)}</strong></button>
          <button type="button" data-go="${(i + 1) % PROJECTS.length}">Suivant →<strong>${esc(next.title)}</strong></button>
        </nav>` : ""}
      </div>`;
  }

  function openProject(i, trigger) {
    current = i;
    lastFocus = trigger || document.activeElement;
    body.innerHTML = projectHTML(i);
    body.scrollTop = 0;
    sheet.style.removeProperty("--drag");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    history.replaceState(null, "", `#projet/${PROJECTS[i].id}`);
    setTimeout(() => sheet.focus({ preventScroll: true }), 50);
  }

  function closeProject() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    sheet.style.removeProperty("--drag");
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => { if (!modal.classList.contains("is-open")) body.innerHTML = ""; }, 600);
    lastFocus && lastFocus.focus({ preventScroll: true });
  }

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeProject();
    const go = e.target.closest("[data-go]");
    if (go) {
      body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).onfinish = () => {
        openProject(+go.dataset.go, lastFocus);
        body.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(0.22,1,0.36,1)" });
      };
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeProject();
    if (e.key === "ArrowRight") $('[data-go]:last-child', body)?.click();
    if (e.key === "ArrowLeft") $('[data-go]', body)?.click();
    if (e.key === "Tab") {
      const f = $$('a[href], button, iframe, video, [tabindex]:not([tabindex="-1"])', sheet).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Glisser vers le bas pour fermer (mobile)
  (() => {
    let startY = 0, dy = 0, dragging = false, startT = 0;
    const begin = (y) => { dragging = true; startY = y; dy = 0; startT = performance.now(); sheet.classList.add("is-dragging"); };
    const move = (y) => {
      if (!dragging) return;
      dy = Math.max(0, y - startY);
      sheet.style.setProperty("--drag", `${dy}px`);
    };
    const end = () => {
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove("is-dragging");
      const velocity = dy / (performance.now() - startT);
      if (dy > 120 || velocity > 0.6) closeProject();
      else sheet.style.setProperty("--drag", "0px");
    };
    sheet.addEventListener("touchstart", (e) => {
      const onHandle = e.target.closest(".modal__handle");
      if (onHandle || body.scrollTop <= 0) begin(e.touches[0].clientY);
    }, { passive: true });
    sheet.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const y = e.touches[0].clientY;
      // Si l'utilisateur fait défiler le contenu vers le haut, on laisse le scroll natif
      if (y < startY && dy === 0) { dragging = false; sheet.classList.remove("is-dragging"); return; }
      if (body.scrollTop > 0 && !e.target.closest(".modal__handle")) return;
      if (e.cancelable) e.preventDefault();
      move(y);
    }, { passive: false });
    sheet.addEventListener("touchend", end);
    sheet.addEventListener("touchcancel", end);
  })();

  renderFilters();
  renderProjects();

  // Lien direct vers un projet : #projet/<id>
  const deep = location.hash.match(/^#projet\/(.+)$/);
  if (deep) {
    const idx = PROJECTS.findIndex((p) => p.id === decodeURIComponent(deep[1]));
    if (idx > -1) setTimeout(() => { $("#projects").scrollIntoView(); openProject(idx); }, 1400);
  }

  /* ======================================================================
     FOND ANIMÉ — halos lumineux + constellation interactive (canvas 2D)
     ====================================================================== */
  const canvas = $(".bg-canvas");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1, points = [], running = true;
  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 1.75);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(clamp((W * H) / 16000, 28, 90));
    points = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.4,
    }));
  }
  resize();
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  const setPointer = (x, y) => { pointer.tx = x; pointer.ty = y; };
  addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", (e) => setPointer(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  addEventListener("touchend", () => setPointer(-9999, -9999));
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) requestAnimationFrame(draw); });

  const blobs = [
    { hue: "c1", x: 0.15, y: 0.2, r: 0.55, sx: 0.00021, sy: 0.00017 },
    { hue: "c2", x: 0.85, y: 0.3, r: 0.5, sx: 0.00015, sy: 0.00023 },
    { hue: "c3", x: 0.5, y: 0.9, r: 0.45, sx: 0.00019, sy: 0.00013 },
  ];

  function colors() {
    const cs = getComputedStyle(root);
    return {
      c1: cs.getPropertyValue("--accent").trim(),
      c2: cs.getPropertyValue("--accent-2").trim(),
      c3: cs.getPropertyValue("--accent-3").trim(),
      light: root.dataset.theme === "light",
    };
  }
  let palette = colors();
  new MutationObserver(() => { palette = colors(); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  const hexA = (hex, a) => {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(v, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };

  function draw(t = 0) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    const scrollShift = scrollY * 0.05;

    // Halos
    ctx.globalCompositeOperation = palette.light ? "multiply" : "lighter";
    blobs.forEach((b) => {
      const x = (b.x + Math.sin(t * b.sx) * 0.12) * W;
      const y = (b.y + Math.cos(t * b.sy) * 0.12) * H - scrollShift;
      const r = b.r * Math.max(W, H);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(palette[b.hue], palette.light ? 0.12 : 0.16));
      g.addColorStop(1, hexA(palette[b.hue], 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
    ctx.globalCompositeOperation = "source-over";

    // Constellation
    pointer.x = lerp(pointer.x, pointer.tx, 0.12);
    pointer.y = lerp(pointer.y, pointer.ty, 0.12);
    const dotColor = palette.light ? "rgba(12,15,26," : "rgba(238,241,247,";
    const link = 120;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!reduceMotion) { p.x += p.vx; p.y += p.vy; }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      const dxm = p.x - pointer.x, dym = p.y - pointer.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 140 && dm > 0.1) { const f = (140 - dm) / 140; p.x += (dxm / dm) * f * 1.6; p.y += (dym / dm) * f * 1.6; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor + "0.5)";
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < link * link) {
          ctx.strokeStyle = dotColor + (1 - Math.sqrt(d2) / link) * 0.14 + ")";
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
