/* ==========================================================================
   ÉTUDES DE CAS — projets publics sélectionnés pour leur valeur métier.
   Les capacités, résultats et limites ci-dessous sont vérifiables dans les
   dépôts liés. Ne pas ajouter de métrique sans source publique.
   ========================================================================== */

window.SITE = {
  github: "Rimiscky",
  featuredRepos: [
    "Rozi",
    "churn-client-master1",
    "Data_CL",
    "professional-photography-market",
  ],
};

window.CATEGORIES = [
  { id: "web", label: "Web & code" },
  { id: "photo", label: "Photographie" },
  { id: "video", label: "Vidéo" },
  { id: "design", label: "Design graphique" },
  { id: "data", label: "Data & BI" },
  { id: "cro", label: "Conversion & UX" },
  { id: "ia", label: "IA & automatisation" },
];

window.PROJECTS = [
  {
    id: "rozi",
    title: "Rozi",
    subtitle: "Gestion de stock traçable pour PME et quincailleries",
    category: ["web", "data"],
    year: "2026",
    role: "Conception produit et développement full-stack",
    client: "Démonstrateur métier",
    glyph: "Stock",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Auth.js"],
    summary:
      "Un MVP de gestion de stock qui sécurise les mouvements, les commandes fournisseurs et la traçabilité opérationnelle.",
    description: [
      "Le besoin : permettre à une petite structure de savoir ce qui reste en stock, pourquoi une quantité a changé et quels produits doivent être réapprovisionnés.",
      "La solution associe rôles serveur, transactions PostgreSQL, verrouillage des mouvements, bons de commande, imports CSV sécurisés, journal d'audit et indicateurs de rotation.",
      "État vérifié : MVP fonctionnel avec tests unitaires et PostgreSQL en CI. Limites assumées : mono-établissement, réception complète uniquement, sans caisse ni comptabilité.",
    ],
    results: [
      { value: "CI", label: "tests, types et build automatisés" },
      { value: "0", label: "donnée client dans la démonstration" },
    ],
    links: [
      { label: "Voir le dépôt", url: "https://github.com/Rimiscky/Rozi" },
    ],
    gallery: [],
  },
  {
    id: "churn-client",
    title: "Prédiction du churn client",
    subtitle: "Comparer des modèles sans sacrifier l'explicabilité",
    category: ["data", "ia"],
    year: "2026",
    role: "Data science et évaluation",
    client: "Projet académique — Master 1",
    glyph: "ML",
    tags: ["Python", "scikit-learn", "Pandas", "Machine Learning"],
    summary:
      "Un pipeline reproductible pour détecter les clients à risque et comparer régression logistique, arbre de décision et Random Forest.",
    description: [
      "Le jeu Telco Customer Churn est préparé sans fuite de données grâce à des pipelines appris uniquement sur l'entraînement et une validation croisée à cinq plis.",
      "La régression logistique est retenue pour sa lisibilité : son ROC-AUC recalculé de 0,841 reste proche des 0,842 de la Random Forest sur le découpage documenté.",
      "Limite : entraînement et évaluation fonctionnent localement ; le parcours de prédiction sur de nouveaux clients et le monitoring restent documentés mais non implémentés.",
    ],
    results: [
      { value: "0,841", label: "ROC-AUC de la régression logistique" },
      { value: "3", label: "modèles classiques comparés" },
    ],
    links: [
      { label: "Voir le dépôt", url: "https://github.com/Rimiscky/churn-client-master1" },
    ],
    gallery: [],
  },
  {
    id: "data-cl",
    title: "Pipeline de données énergétiques",
    subtitle: "Ingestion, ETL, gouvernance et visualisation multi-régions",
    category: "data",
    year: "2026",
    role: "Data engineering et visualisation",
    client: "Projet de données ouvertes",
    glyph: "ETL",
    tags: ["Python", "Airflow", "PostgreSQL", "Docker", "Streamlit"],
    summary:
      "Un pipeline de bout en bout qui rapproche consommation électrique et météo pour produire des tableaux de bord régionaux.",
    description: [
      "Le projet ingère les données publiques ODRE, Open-Meteo et RTE, normalise les schémas, rapproche énergie et météo puis calcule des contrôles de qualité.",
      "L'orchestration Airflow, PostgreSQL, les tableaux de bord Plotly et l'application Streamlit rendent chaque étape observable et réexécutable.",
      "Limite : les services externes et le déploiement décrits dépendent de l'infrastructure et des secrets de l'environnement ; le dépôt ne garantit pas leur disponibilité permanente.",
    ],
    results: [
      { value: "3", label: "sources de données documentées" },
      { value: "4", label: "régions configurées" },
    ],
    links: [
      { label: "Voir le dépôt", url: "https://github.com/Rimiscky/Data_CL" },
    ],
    gallery: [],
  },
  {
    id: "photography-market",
    title: "Marketplace photo professionnelle",
    subtitle: "Protéger, publier et licencier des images",
    category: ["web", "photo"],
    year: "2026",
    role: "Architecture produit et développement full-stack",
    client: "Prototype de marketplace française",
    glyph: "Photo",
    tags: ["Next.js", "TypeScript", "Drizzle", "D1", "R2"],
    summary:
      "Un prototype orienté droits d'auteur avec originaux privés, aperçus filigranés et autorisations serveur.",
    description: [
      "Le parcours couvre l'onboarding photographe, l'import authentifié, la validation des fichiers, les métadonnées, le copyright et la publication contrôlée.",
      "Les originaux restent privés tandis que quatre dérivés WebP protégés sont générés pour le catalogue de démonstration.",
      "Limites affichées : catalogue et statistiques fictifs, moteur de traitement lancé manuellement, paiements et livraison autorisée des originaux non implémentés.",
    ],
    results: [
      { value: "4", label: "aperçus WebP protégés par original" },
      { value: "RBAC", label: "rôles et propriété contrôlés côté serveur" },
    ],
    links: [
      {
        label: "Voir le dépôt",
        url: "https://github.com/Rimiscky/professional-photography-market",
      },
    ],
    gallery: [],
  },
];
