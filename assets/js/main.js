/* ==========================================================================
   Portfolio — interactions (vanilla JS, sans dépendance)
   Partagé par index.html et photo-video.html : chaque bloc vérifie que
   ses éléments existent avant de s'exécuter.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u = "") => (/^(https?:|mailto:|tel:|#)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : "#");

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Navigation ---------- */
  const gnav = $(".gnav");
  const burger = $(".gnav__burger");
  const setMenu = (open) => {
    gnav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.classList.toggle("no-scroll", open);
  };
  burger.addEventListener("click", () => setMenu(!gnav.classList.contains("is-open")));
  $$(".gnav__links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && gnav.classList.contains("is-open")) setMenu(false); });

  const navLinks = $$(".gnav__links a[href^='#']");
  if (navLinks.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach((a) => { const s = $(a.getAttribute("href")); s && navIO.observe(s); });
  }

  /* ---------- Apparition au scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

  const observeReveals = (scope = document) => {
    $$(".reveal:not(.is-in)", scope).forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
      io.observe(el);
    });
  };
  observeReveals();

  /* ---------- Texte révélé mot à mot ---------- */
  const statements = $$("[data-words]");
  statements.forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  });

  /* ---------- Effets liés au scroll ---------- */
  const heroText = $("[data-hero-text]");
  const heroPhoto = $("[data-hero-photo]");
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const vh = innerHeight;
    gnav.classList.toggle("is-scrolled", y > 4);

    if (!reduceMotion && heroText && heroPhoto) {
      // Le texte s'efface en douceur, la photo grandit (zoom façon Apple)
      const p = clamp(y / (vh * 0.7), 0, 1);
      heroText.style.transform = `translate3d(0, ${p * -40}px, 0)`;
      heroText.style.opacity = 1 - p * 0.9;
      const r = heroPhoto.getBoundingClientRect();
      const q = clamp(1 - (r.top + r.height * 0.5) / vh, 0, 1);
      heroPhoto.style.transform = `scale(${0.86 + q * 0.2})`;
    }

    statements.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3), 0, 1);
      const words = el.children;
      const on = Math.ceil(p * words.length);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle("is-on", i < on);
    });
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Contrôle segmenté (parcours) ---------- */
  const segBtns = $$(".segmented__btn");
  const glider = $(".segmented__glider");
  if (segBtns.length && glider) {
    const moveGlider = () => {
      const active = $(".segmented__btn.is-active");
      glider.style.width = `${active.offsetWidth}px`;
      glider.style.transform = `translateX(${active.offsetLeft - 3}px)`;
    };
    segBtns.forEach((btn) => btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;
      segBtns.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
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
    }));
    moveGlider();
    addEventListener("resize", moveGlider);
    document.fonts && document.fonts.ready.then(moveGlider);
  }

  /* ---------- Copier l'e-mail ---------- */
  const toast = $(".toast");
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
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
  const CATEGORIES = window.CATEGORIES || [];
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || id;

  const media = (p, eager = false) => {
    if (p.cover) return `<img src="${esc(safeUrl(p.cover))}" alt="" ${eager ? "" : 'loading="lazy"'} decoding="async" />`;
    return `<div class="gen"><span>${esc(p.glyph || p.title.split(" ")[0])}</span></div>`;
  };

  const cardHTML = (p) => `
    <button class="project reveal" data-index="${PROJECTS.indexOf(p)}" data-cat="${esc(p.category)}" type="button" aria-label="Voir le projet ${esc(p.title)}">
      <div class="project__media">
        ${media(p)}
        ${p.video ? '<span class="project__play" aria-hidden="true">▶</span>' : ""}
      </div>
      <div class="project__body">
        <span class="project__cat">${esc(catLabel(p.category))}${p.year ? ` · ${esc(p.year)}` : ""}</span>
        <h3 class="project__title">${esc(p.title)}</h3>
        ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ""}
        <span class="project__more">En savoir plus</span>
      </div>
    </button>`;

  const bindCards = (scope) => {
    $$(".project", scope).forEach((card) => card.addEventListener("click", () => openProject(+card.dataset.index, card)));
    observeReveals(scope);
  };

  // Grille filtrable
  const grid = $("#project-grid");
  const filtersEl = $(".filters");
  if (grid && filtersEl) {
    const cats = [{ id: "all", label: "Tous" }, ...CATEGORIES].filter((c) => c.id === "all" || PROJECTS.some((p) => p.category === c.id));
    filtersEl.innerHTML = cats.map((c, i) => {
      const n = c.id === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.category === c.id).length;
      return `<button class="filter${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-filter="${esc(c.id)}">${esc(c.label)}<sup>${n}</sup></button>`;
    }).join("");
    grid.innerHTML = PROJECTS.map(cardHTML).join("");
    bindCards(grid);

    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn || btn.classList.contains("is-active")) return;
      $$(".filter", filtersEl).forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
      const id = btn.dataset.filter;
      const cards = $$(".project", grid);
      const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
      cards.forEach((c) => { c.classList.toggle("is-hidden", !(id === "all" || c.dataset.cat === id)); c.classList.add("is-in"); });
      if (reduceMotion) return;
      cards.forEach((c) => {
        if (c.classList.contains("is-hidden")) return;
        const a = first.get(c), b = c.getBoundingClientRect();
        c.animate(a.width === 0
          ? [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }]
          : [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }],
          { duration: 500, easing: "cubic-bezier(0.28, 0.11, 0.32, 1)" });
      });
    });
  }

  /* ---------- Fiche projet ---------- */
  const modal = $("#modal");
  const sheet = modal && $(".modal__sheet", modal);
  const body = modal && $(".modal__body", modal);
  let lastFocus = null;

  const videoEmbed = (url) => {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Vidéo" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `<iframe src="https://player.vimeo.com/video/${vm[1]}" title="Vidéo" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    return `<video src="${esc(safeUrl(url))}" controls playsinline preload="metadata"></video>`;
  };
  window.__videoEmbed = videoEmbed;

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
        ${p.tags && p.tags.length ? `<ul class="pm__tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${p.links && p.links.length ? `<div class="pm__links">${p.links.map((l, k) => `<a class="${k === 0 ? "btn" : "link-more"}" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>` : ""}
        ${n > 1 ? `<nav class="pm__nav">
          <button type="button" data-go="${(i - 1 + n) % n}">‹ Précédent<strong>${esc(prev.title)}</strong></button>
          <button type="button" data-go="${(i + 1) % n}">Suivant ›<strong>${esc(next.title)}</strong></button>
        </nav>` : ""}
      </div>`;
  }

  function openModal(html, trigger) {
    if (trigger) lastFocus = trigger;
    else if (!modal.classList.contains("is-open")) lastFocus = document.activeElement;
    body.innerHTML = html;
    body.scrollTop = 0;
    sheet.style.removeProperty("--drag");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setTimeout(() => sheet.focus({ preventScroll: true }), 50);
  }
  window.__openModal = openModal;

  function openProject(i, trigger) {
    openModal(projectHTML(i), trigger);
    history.replaceState(null, "", `#projet/${encodeURIComponent(PROJECTS[i].id)}`);
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    sheet.style.removeProperty("--drag");
    if (location.hash.startsWith("#projet/")) history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => { if (!modal.classList.contains("is-open")) body.innerHTML = ""; }, 500);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) return closeModal();
      const go = e.target.closest("[data-go]");
      if (!go) return;
      if (reduceMotion) return openProject(+go.dataset.go);
      body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = () => {
        openProject(+go.dataset.go);
        body.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: "cubic-bezier(0.28, 0.11, 0.32, 1)" });
      };
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab") {
        const f = $$('a[href], button, iframe, video, [tabindex]:not([tabindex="-1"])', sheet).filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });

    // Glisser vers le bas pour fermer (mobile)
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
      if (y < startY && dy === 0) return stop();
      if (e.cancelable) e.preventDefault();
      dy = Math.max(0, y - startY);
      sheet.style.setProperty("--drag", `${dy}px`);
    }, { passive: false });
    const end = () => {
      if (!dragging) return;
      stop();
      if (dy > 110 || dy / (performance.now() - startT) > 0.6) closeModal();
      else sheet.style.setProperty("--drag", "0px");
    };
    sheet.addEventListener("touchend", end);
    sheet.addEventListener("touchcancel", end);

    const deep = location.hash.match(/^#projet\/(.+)$/);
    if (deep) {
      const idx = PROJECTS.findIndex((p) => p.id === decodeURIComponent(deep[1]));
      if (idx > -1) openProject(idx);
    }
  }
})();
