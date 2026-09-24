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

    if (!reduceMotion && heroText) {
      // Le texte s'efface en douceur, la photo grandit (zoom façon Apple)
      const p = clamp(y / (vh * 0.7), 0, 1);
      heroText.style.transform = `translate3d(0, ${p * -40}px, 0)`;
      heroText.style.opacity = 1 - p * 0.9;
    }
    if (!reduceMotion && heroPhoto) {
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
    const setActive = (btn) => {
      segBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      moveGlider();
    };
    // Variante « ancres » (page photo & vidéo) : l'onglet suit la section visible
    const jumpLinks = segBtns.filter((b) => b.hash);
    if (jumpLinks.length) {
      const segIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(jumpLinks.find((b) => b.hash === `#${e.target.id}`)); });
      }, { rootMargin: "-40% 0px -55% 0px" });
      jumpLinks.forEach((b) => { const t = $(b.hash); t && segIO.observe(t); });
    }
    segBtns.filter((b) => b.dataset.tab).forEach((btn) => btn.addEventListener("click", () => {
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
  const catsOf = (p) => [].concat(p.category || []);
  const catLabel = (p) => { const id = catsOf(p)[0]; return (CATEGORIES.find((c) => c.id === id) || {}).label || id || ""; };

  const media = (p, eager = false) => {
    if (p.cover) return `<img src="${esc(safeUrl(p.cover))}" alt="" ${eager ? "" : 'loading="lazy"'} decoding="async" />`;
    return `<div class="gen"><span>${esc(p.glyph || p.title.split(" ")[0])}</span></div>`;
  };

  const cardHTML = (p) => `
    <button class="project reveal" data-index="${PROJECTS.indexOf(p)}" type="button" aria-label="Voir le projet ${esc(p.title)}">
      <div class="project__media">
        ${media(p)}
        ${p.video ? '<span class="project__play" aria-hidden="true">▶</span>' : ""}
      </div>
      <div class="project__body">
        <span class="project__cat">${esc(catLabel(p))}${p.year ? ` · ${esc(p.year)}` : ""}</span>
        <h3 class="project__title">${esc(p.title)}</h3>
        ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ""}
        <span class="project__more">En savoir plus</span>
      </div>
    </button>`;

  const bindCards = (scope) => {
    $$(".project", scope).forEach((card) => card.addEventListener("click", () => openProject(+card.dataset.index, card)));
    observeReveals(scope);
  };

  // Carrousels horizontaux : chaque section affiche les projets de ses catégories
  const makeCarousel = (el, itemsHTML) => {
    el.innerHTML = `
      <div class="carousel__track">${itemsHTML}</div>
      <div class="carousel__nav">
        <button class="carousel__btn" type="button" data-dir="-1" aria-label="Précédent"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
        <button class="carousel__btn" type="button" data-dir="1" aria-label="Suivant"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
      </div>`;
    const track = $(".carousel__track", el);
    const [prev, next] = $$(".carousel__btn", el);
    const update = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
      $(".carousel__nav", el).hidden = track.scrollWidth <= track.clientWidth + 4;
    };
    $$(".carousel__btn", el).forEach((b) => b.addEventListener("click", () => {
      const item = track.firstElementChild;
      const step = item ? item.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
      track.scrollBy({ left: +b.dataset.dir * step, behavior: reduceMotion ? "auto" : "smooth" });
    }));
    track.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return track;
  };
  window.__makeCarousel = makeCarousel;

  $$(".carousel[data-cats]").forEach((el) => {
    const cats = el.dataset.cats.split(",");
    const items = PROJECTS.filter((p) => catsOf(p).some((c) => cats.includes(c)));
    if (!items.length) return;
    bindCards(makeCarousel(el, items.map(cardHTML).join("")));
  });

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
        <span class="pm__cat">${esc(catLabel(p))}</span>
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

  /* ======================================================================
     PHOTOS & VIDÉOS (page photo-video.html + aperçus de l'accueil)
     ====================================================================== */
  const PHOTOS = window.PHOTOS || [];
  const VIDEOS = window.VIDEOS || [];

  const videoThumb = (v) => {
    if (v.poster) return v.poster;
    const yt = (v.url || "").match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    return yt ? `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` : "";
  };
  const videoCardHTML = (v, i) => `
    <button class="vcard reveal" type="button" data-video="${i}" aria-label="Lire la vidéo ${esc(v.title || "")}">
      <span class="vcard__media">
        ${videoThumb(v) ? `<img src="${esc(safeUrl(videoThumb(v)))}" alt="" loading="lazy" onerror="this.remove()" />` : ""}
        <span class="vcard__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg></span>
      </span>
      <span class="vcard__title">${esc(v.title || "Vidéo")}</span>
      ${v.description ? `<span class="vcard__desc">${esc(v.description)}</span>` : ""}
    </button>`;
  const bindVideos = (scope) => {
    $$("[data-video]", scope).forEach((b) => b.addEventListener("click", () => {
      const v = VIDEOS[+b.dataset.video];
      openModal(`<div class="pm__video pm__video--flush">${videoEmbed(v.url)}</div>
        <div class="pm__content"><h2 class="pm__title" id="modal-title">${esc(v.title || "Vidéo")}</h2>${v.description ? `<p class="pm__subtitle">${esc(v.description)}</p>` : ""}</div>`, b);
    }));
    observeReveals(scope);
  };

  // Aperçus sur l'accueil
  const photoPreview = $("#photo-preview");
  if (photoPreview && PHOTOS.length) {
    photoPreview.innerHTML = PHOTOS.slice(0, 6).map((ph) => `<a class="pp reveal" href="photo-video.html#photos"><img src="${esc(safeUrl(ph.src))}" alt="${esc(ph.title || "Photo")}" loading="lazy" /></a>`).join("");
    observeReveals(photoPreview);
  }
  const videoPreview = $("#video-preview");
  if (videoPreview && VIDEOS.length) bindVideos(makeCarousel(videoPreview, VIDEOS.map(videoCardHTML).join("")));

  // Grille de vidéos
  const videoGrid = $("#video-grid");
  if (videoGrid) {
    if (VIDEOS.length) { videoGrid.innerHTML = VIDEOS.map(videoCardHTML).join(""); bindVideos(videoGrid); }
    else $("#video-empty").hidden = false;
  }

  // Galerie photo + filtres
  const photoGrid = $("#photo-grid");
  const lightbox = $("#lightbox");
  if (photoGrid && lightbox) {
    if (!PHOTOS.length) $("#photo-empty").hidden = false;
    photoGrid.innerHTML = PHOTOS.map((ph, i) => `
      <button class="ph reveal" type="button" data-photo="${i}" data-cat="${esc(ph.category || "")}" aria-label="Agrandir : ${esc(ph.title || "photo")}">
        <img src="${esc(safeUrl(ph.src))}" alt="${esc(ph.title || "")}" loading="lazy" decoding="async" />
        ${ph.title ? `<span class="ph__title">${esc(ph.title)}</span>` : ""}
      </button>`).join("");
    observeReveals(photoGrid);

    const cats = [...new Set(PHOTOS.map((ph) => ph.category).filter(Boolean))];
    const pf = $("#photo-filters");
    if (cats.length > 1) {
      pf.hidden = false;
      pf.innerHTML = ["Tous", ...cats].map((c, i) => `<button class="filter${i ? "" : " is-active"}" type="button" data-f="${i ? esc(c) : ""}">${esc(c)}</button>`).join("");
      pf.addEventListener("click", (e) => {
        const b = e.target.closest(".filter");
        if (!b) return;
        $$(".filter", pf).forEach((x) => x.classList.toggle("is-active", x === b));
        $$(".ph", photoGrid).forEach((el) => {
          const show = !b.dataset.f || el.dataset.cat === b.dataset.f;
          el.hidden = !show;
          if (show && !reduceMotion) el.animate([{ opacity: 0, transform: "scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "cubic-bezier(0.28, 0.11, 0.32, 1)" });
        });
      });
    }

    // Visionneuse plein écran : flèches, clavier, glisser pour naviguer / fermer
    const img = $(".lightbox__img", lightbox);
    const caption = $(".lightbox__caption", lightbox);
    const count = $(".lightbox__count", lightbox);
    let current = 0, list = [], lbFocus = null;
    const visible = () => $$(".ph", photoGrid).filter((el) => !el.hidden).map((el) => +el.dataset.photo);
    const show = (i, dir = 0) => {
      current = (i + list.length) % list.length;
      const ph = PHOTOS[list[current]];
      img.src = ph.src;
      img.alt = ph.title || "";
      caption.textContent = [ph.title, ph.category].filter(Boolean).join(" · ");
      count.textContent = `${current + 1} / ${list.length}`;
      if (dir && !reduceMotion) img.animate([{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: "none" }], { duration: 400, easing: "cubic-bezier(0.28, 0.11, 0.32, 1)" });
      [1, -1].forEach((d) => { const n = PHOTOS[list[(current + d + list.length) % list.length]]; if (n) new Image().src = n.src; });
    };
    const openLb = (idx, trigger) => {
      list = visible();
      lbFocus = trigger;
      show(list.indexOf(idx));
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      $(".lightbox__close", lightbox).focus({ preventScroll: true });
    };
    const closeLb = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      lbFocus && lbFocus.focus({ preventScroll: true });
    };
    photoGrid.addEventListener("click", (e) => { const b = e.target.closest("[data-photo]"); if (b) openLb(+b.dataset.photo, b); });
    lightbox.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lb]");
      if (b) return b.dataset.lb === "close" ? closeLb() : show(current + +b.dataset.lb, +b.dataset.lb);
      if (!e.target.closest(".lightbox__img")) closeLb();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") show(current + 1, 1);
      if (e.key === "ArrowLeft") show(current - 1, -1);
    });
    let tx = 0, ty = 0;
    lightbox.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (dy > 90) closeLb();
    });
  }
})();
