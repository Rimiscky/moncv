/* ==========================================================================
   MES PROJETS — c'est le seul fichier à modifier pour ajouter un projet.
   --------------------------------------------------------------------------
   Copie un bloc { ... }, colle-le dans la liste et remplis les champs.
   Tous les champs sont optionnels sauf : id, title, category.

   category : "web" | "cro" | "data" | "ia" | "contenu"
              (les filtres sont définis plus bas dans CATEGORIES)

   cover    : image de couverture ("assets/img/projets/mon-projet.jpg").
              Sans image, une couverture animée est générée automatiquement
              avec les couleurs "accent" et le texte "glyph".
   gallery  : liste d'images affichées dans la fiche projet.
   video    : lien YouTube, Vimeo ou fichier .mp4 (affiché dans la fiche).
   links    : boutons (site en ligne, GitHub, Behance, PDF, Figma…).
   results  : chiffres clés  -> { value: "+32 %", label: "taux de conversion" }
              Mets uniquement des chiffres réels et vérifiables.
   featured : true pour afficher le projet en grand dans la grille.
   ========================================================================== */

window.CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "web", label: "Web & Shopify" },
  { id: "cro", label: "CRO & UX" },
  { id: "data", label: "Data & BI" },
  { id: "ia", label: "IA & Automatisation" },
  { id: "contenu", label: "Contenu & Com'" },
];

window.PROJECTS = [
  {
    id: "conroy-ecommerce",
    title: "Conroy Vin & Spiritueux",
    subtitle: "Optimisation d'un site e-commerce",
    category: "web",
    year: "2022 – 2023",
    role: "Responsable projet digital (alternance)",
    client: "Conroy Vin & Spiritueux — Sallanches",
    featured: true,
    glyph: "E-shop",
    accent: ["#22d3ee", "#6366f1"],
    tags: ["WordPress", "PrestaShop", "SEO", "Performance"],
    summary:
      "Refonte des pages produit, modules interactifs et optimisation des performances d'une boutique de vins & spiritueux.",
    description: [
      "Pilotage de l'optimisation du site e-commerce (WordPress & PrestaShop) : intégration de pages produit et de modules interactifs, création de contenus optimisés SEO.",
      "Amélioration des performances (vitesse, scripts, images) avec une méthodologie data-driven appuyée par des outils IA.",
    ],
    results: [],
    links: [],
    gallery: [],
  },
  {
    id: "shopify-theme",
    title: "Thème Shopify sur-mesure",
    subtitle: "Sections Liquid & pages produit orientées conversion",
    category: "web",
    year: "2025",
    role: "Développeur Shopify",
    glyph: "Liquid",
    accent: ["#34d399", "#0ea5e9"],
    tags: ["Shopify", "Liquid", "JavaScript", "Responsive"],
    summary:
      "Création de sections personnalisables et d'une page produit pensée pour le mobile et la conversion.",
    description: [
      "Personnalisation d'un thème Shopify : sections dynamiques éditables depuis l'éditeur, blocs de réassurance, sticky add-to-cart mobile.",
      "À compléter : contexte, lien de la boutique, captures avant / après.",
    ],
    links: [],
    gallery: [],
  },
  {
    id: "ab-testing",
    title: "Programme d'A/B testing",
    subtitle: "Landing pages, fiches produit & CTA",
    category: "cro",
    year: "2025",
    role: "CRO / UX",
    glyph: "A / B",
    accent: ["#f472b6", "#8b5cf6"],
    tags: ["A/B test", "Heatmaps", "Scroll depth", "UX"],
    summary:
      "Construction d'hypothèses à partir des heatmaps et du scroll depth, puis tests A/B sur les CTA et landing pages.",
    description: [
      "Analyse UX (heatmaps, scroll depth, parcours) pour identifier les frictions du funnel, priorisation des hypothèses, mise en place des variantes et lecture des résultats.",
      "À compléter : outil utilisé, hypothèses testées, résultats mesurés.",
    ],
    links: [],
    gallery: [],
  },
  {
    id: "tracking-dashboard",
    title: "Tracking & tableau de bord KPI",
    subtitle: "GA4, Google Tag Manager, pixels Meta",
    category: "data",
    year: "2025",
    role: "Tracking & Data",
    glyph: "KPI",
    accent: ["#fbbf24", "#f97316"],
    tags: ["GA4", "GTM", "Meta Pixel", "Power BI"],
    summary:
      "Plan de marquage e-commerce complet et tableau de bord de suivi des KPIs de vente.",
    description: [
      "Mise en place du tracking e-commerce (GA4, Google Tag Manager, pixels Meta) et construction d'un tableau de bord pour suivre trafic, conversions et panier moyen.",
      "À compléter : captures du dashboard, périmètre, décisions prises grâce aux données.",
    ],
    links: [],
    gallery: [],
  },
  {
    id: "gxo-data",
    title: "Analyse de données logistiques",
    subtitle: "Détection d'anomalies & optimisation des flux",
    category: "data",
    year: "2023 – 2024",
    role: "Assistant data logistique",
    client: "GXO (Amazon)",
    glyph: "Data",
    accent: ["#60a5fa", "#2563eb"],
    tags: ["Analyse", "Qualité des données", "Flux", "TOUNT", "FLEX AFTX"],
    summary:
      "Analyse d'anomalies et vérification des données internes pour fiabiliser et optimiser les flux logistiques.",
    description: [
      "Analyse d'anomalies et vérification des données internes, optimisation des flux grâce à une approche orientée data, utilisation des outils métiers (TOUNT, FLEX AFTX).",
    ],
    links: [],
    gallery: [],
  },
  {
    id: "n8n-automation",
    title: "Automatisations N8N",
    subtitle: "Workflows IA pour le marketing et le reporting",
    category: "ia",
    year: "2025",
    role: "Automatisation & IA",
    glyph: "n8n",
    accent: ["#a78bfa", "#ec4899"],
    tags: ["N8N", "IA", "API", "Python"],
    summary:
      "Workflows automatisés : collecte de données, enrichissement par IA et envoi de rapports.",
    description: [
      "Conception de workflows N8N connectant formulaires, CRM, tableurs et modèles d'IA pour réduire les tâches répétitives.",
      "À compléter : cas d'usage précis, schéma du workflow, temps gagné.",
    ],
    links: [],
    gallery: [],
  },
  {
    id: "1745-bagelstein",
    title: "Le 17.45 & Bagelstein",
    subtitle: "Communication digitale & contenus",
    category: "contenu",
    year: "2024 – 2025",
    role: "Responsable communication digitale",
    client: "Le 17.45 & Bagelstein",
    featured: true,
    glyph: "Social",
    accent: ["#fb7185", "#f59e0b"],
    tags: ["Photo", "Vidéo", "KPI", "Social media"],
    summary:
      "Création de contenus photo & vidéo, pilotage des KPIs et amélioration des funnels de vente locaux.",
    description: [
      "Création de contenus (photo, vidéo), gestion des KPIs (engagement, conversions locales) et amélioration de la visibilité et des funnels de vente.",
      "Astuce : ajoute ici tes meilleures vidéos (champ video) et photos (champ gallery).",
    ],
    links: [],
    gallery: [],
  },
  {
    id: "freelance-sites",
    title: "Sites vitrines & e-commerce",
    subtitle: "Missions freelance de A à Z",
    category: "web",
    year: "2022 – 2025",
    role: "Développeur web freelance",
    glyph: "Web",
    accent: ["#38bdf8", "#14b8a6"],
    tags: ["WordPress", "PrestaShop", "SEO technique", "UX"],
    summary:
      "Création de sites vitrines et e-commerce, SEO technique et intégration de modules marketing.",
    description: [
      "Création de sites vitrines & e-commerce (WordPress / PrestaShop), optimisation SEO technique (vitesse, images, structure), intégration de modules marketing (CTA, formulaires, sections) et gestion de projet de A à Z.",
      "À compléter : liste des sites réalisés avec leurs liens.",
    ],
    links: [{ label: "rimiscky.fr", url: "https://www.rimiscky.fr" }],
    gallery: [],
  },
];
