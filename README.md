# Portfolio — Rimiscky Sambala

Portfolio personnel au style minimal et professionnel, pensé mobile d'abord. C'est un site statique (HTML, CSS et JavaScript uniquement) : aucune dépendance, aucune étape de build, et il s'héberge gratuitement.

## Structure

```
index.html              → structure et textes (profil, compétences, parcours, contact)
assets/css/style.css    → design, thèmes, animations
assets/js/projects.js   → ★ TES PROJETS (le seul fichier à modifier pour ajouter un projet)
assets/js/main.js       → interactions (filtres, fiche projet, animations)
assets/img/profile.jpg  → photo de profil
assets/img/projets/     → mets ici les images et vidéos de tes projets
```

## Ajouter un projet

1. Dépose tes images dans `assets/img/projets/` (ex. `ma-boutique-cover.jpg`).
2. Ouvre `assets/js/projects.js`, copie un bloc `{ ... }` existant et remplis-le :

```js
{
  id: "ma-boutique",                       // unique, sans espaces
  title: "Boutique Shopify Mode",
  subtitle: "Refonte complète & tunnel de vente",
  category: "web",                         // web | photo | cro | data | ia
  year: "2026",
  role: "Développeur Shopify",
  client: "Nom du client",
  cover: "assets/img/projets/ma-boutique-cover.jpg",
  gallery: ["assets/img/projets/ma-boutique-1.jpg", "assets/img/projets/ma-boutique-2.jpg"],
  video: "https://www.youtube.com/watch?v=XXXXXXXXXXX", // YouTube, Vimeo ou .mp4
  tags: ["Shopify", "Liquid", "CRO"],
  summary: "Une phrase d'accroche affichée sur la carte.",
  description: ["Paragraphe 1…", "Paragraphe 2…"],
  results: [{ value: "+18 %", label: "taux de conversion" }],
  links: [{ label: "Voir le site", url: "https://…" }],
},
```

Sans `cover`, une couverture sobre est générée automatiquement avec le texte de `glyph`.
Les filtres et les compteurs se mettent à jour tout seuls. Chaque projet a aussi un lien direct : `…/#projet/<id>`.

Pour créer une nouvelle catégorie (ex. « Photo »), ajoute-la dans `CATEGORIES` en haut du fichier.

## Prévisualiser en local

```bash
python3 -m http.server 8000
# puis ouvre http://localhost:8000
```

## Mettre en ligne (gratuit)

**GitHub Pages** : dépôt → *Settings* → *Pages* → *Deploy from a branch* → `main` / racine.
Le site sera disponible sur `https://rimiscky.github.io/moncv/`.
Pour utiliser `rimiscky.fr`, indique le domaine dans ce même écran et fais pointer le DNS vers GitHub.

Netlify ou Vercel fonctionnent aussi : importe le dépôt, sans commande de build.

## Fonctionnalités

- Mobile d'abord : barre de navigation en bas de l'écran, fiche projet qui s'ouvre depuis le bas (glisser vers le bas pour fermer)
- Thème clair par défaut, thème sombre en option (mémorisé sur l'appareil)
- Animations discrètes : apparition au scroll, filtres de projets animés, timeline du parcours qui se remplit
- Fiche projet complète : galerie photo, vidéo (YouTube, Vimeo ou .mp4), chiffres clés et liens
- Accessible : navigation au clavier, respect de `prefers-reduced-motion`, focus visible
