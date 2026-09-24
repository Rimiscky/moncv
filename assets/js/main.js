/* ==========================================================================
   Portfolio — interactions (vanilla JS, sans dépendance)
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } },
  };

  /* ---------- Thème (clair par défaut) ---------- */
  const savedTheme = store.get("theme");
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;
  const syncThemeColor = () => $('meta[name="theme-color"]').setAttribute("content", root.dataset.theme === "dark" ? "#0b0d12" : "#ffffff");
  syncThemeColor();
  $(".theme-toggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    syncThemeColor();
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Apparition au scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

  const observeReveals = (scope = document) => {
    $$(".reveal:not(.is-in)", scope).forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.06}s`);
      io.observe(el);
    });
  };
  observeReveals();

  /* ---------- Scroll : progression, en-tête, timeline ---------- */
  const header = $(".header");
  const progress = $(".progress");
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle("is-scrolled", y > 8);
    $$(".timeline:not([hidden])").forEach((tl) => {
      const r = tl.getBoundingClientRect();
      const p = clamp((innerHeight * 0.75 - r.top) / r.height, 0, 1);
      tl.querySelector(".timeline__line span").style.setProperty("--p", p);
    });
    ticking = false;
  }
  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Lien actif dans la navigation ---------- */
  const navLinks = $$(".nav__link");
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => { const s = $(a.getAttribute("href")); s && navIO.observe(s); });

  /* ---------- Onglets du parcours ---------- */
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
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2000);
  };
  $$(".copy").forEach((btn) => btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast("E-mail copié"); }
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
  const safeUrl = (u = "") => (/^(https?:|mailto:|tel:|#)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : "#");

  const media = (p, eager = false) => {
    if (p.cover) return `<img src="${esc(safeUrl(p.cover))}" alt="" ${eager ? "" : 'loading="lazy"'} decoding="async" />`;
    const [c1, c2] = p.accent || ["#2563eb", "#2563eb"];
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
      <button class="project reveal" data-index="${i}" data-cat="${esc(p.category)}" type="button" aria-label="Voir le projet ${esc(p.title)}">
        <div class="project__media">
          ${media(p)}
          <span class="project__badge">${esc(catLabel(p.category))}</span>
          ${p.video ? '<span class="project__play" aria-hidden="true">▶</span>' : ""}
        </div>
        <div class="project__body">
          <div class="project__meta"><span>${esc(p.client || p.role || "")}</span><span>${esc(p.year || "")}</span></div>
          <h3 class="project__title">${esc(p.title)}</h3>
          ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ""}
          <span class="project__more">Voir le projet <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        </div>
      </button>`).join("");
    $$(".project", grid).forEach((card) => card.addEventListener("click", () => openProject(+card.dataset.index, card)));
    observeReveals(grid);
  }

  // Filtrage avec transition douce (technique FLIP)
  function applyFilter(id) {
    const cards = $$(".project", grid);
    const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    cards.forEach((c) => {
      c.classList.toggle("is-hidden", !(id === "all" || c.dataset.cat === id));
      c.classList.add("is-in");
    });
    if (reduceMotion) return;
    cards.forEach((c) => {
      if (c.classList.contains("is-hidden")) return;
      const a = first.get(c);
      const b = c.getBoundingClientRect();
      const anim = a.width === 0
        ? [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }]
        : [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }];
      c.animate(anim, { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
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
    const n = PROJECTS.length;
    const prev = PROJECTS[(i - 1 + n) % n];
    const next = PROJECTS[(i + 1) % n];
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
        ${p.tags && p.tags.length ? `<ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${p.links && p.links.length ? `<div class="pm__links">${p.links.map((l, k) => `<a class="btn ${k === 0 ? "btn--primary" : "btn--ghost"}" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener"><span>${esc(l.label)}</span><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>`).join("")}</div>` : ""}
        ${n > 1 ? `<nav class="pm__nav">
          <button type="button" data-go="${(i - 1 + n) % n}">← Précédent<strong>${esc(prev.title)}</strong></button>
          <button type="button" data-go="${(i + 1) % n}">Suivant →<strong>${esc(next.title)}</strong></button>
        </nav>` : ""}
      </div>`;
  }

  function openProject(i, trigger) {
    if (trigger) lastFocus = trigger;
    else if (!modal.classList.contains("is-open")) lastFocus = document.activeElement;
    body.innerHTML = projectHTML(i);
    body.scrollTop = 0;
    sheet.style.removeProperty("--drag");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    history.replaceState(null, "", `#projet/${encodeURIComponent(PROJECTS[i].id)}`);
    setTimeout(() => sheet.focus({ preventScroll: true }), 50);
  }

  function closeProject() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    sheet.style.removeProperty("--drag");
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => { if (!modal.classList.contains("is-open")) body.innerHTML = ""; }, 450);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeProject();
    const go = e.target.closest("[data-go]");
    if (!go) return;
    if (reduceMotion) return openProject(+go.dataset.go);
    body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = () => {
      openProject(+go.dataset.go);
      body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    };
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeProject();
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
    const stop = () => { dragging = false; sheet.classList.remove("is-dragging"); };
    sheet.addEventListener("touchstart", (e) => {
      if (!e.target.closest(".modal__handle") && body.scrollTop > 0) return;
      dragging = true; startY = e.touches[0].clientY; dy = 0; startT = performance.now();
      sheet.classList.add("is-dragging");
    }, { passive: true });
    sheet.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const y = e.touches[0].clientY;
      if (y < startY && dy === 0) return stop(); // défilement du contenu vers le haut
      if (e.cancelable) e.preventDefault();
      dy = Math.max(0, y - startY);
      sheet.style.setProperty("--drag", `${dy}px`);
    }, { passive: false });
    const end = () => {
      if (!dragging) return;
      stop();
      const velocity = dy / (performance.now() - startT);
      if (dy > 110 || velocity > 0.6) closeProject();
      else sheet.style.setProperty("--drag", "0px");
    };
    sheet.addEventListener("touchend", end);
    sheet.addEventListener("touchcancel", end);
  })();

  renderFilters();
  renderProjects();

  // Lien direct vers un projet : #projet/<id>
  const deep = location.hash.match(/^#projet\/(.+)$/);
  if (deep) {
    const idx = PROJECTS.findIndex((p) => p.id === decodeURIComponent(deep[1]));
    if (idx > -1) { $("#projects").scrollIntoView(); openProject(idx); }
  }
})();
