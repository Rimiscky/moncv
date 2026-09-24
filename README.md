# Portfolio — Rimiscky Sambala

Portfolio personnel inspiré du style d'Apple, pensé mobile d'abord. C'est un site statique (HTML, CSS et JavaScript uniquement) : aucune dépendance, aucune étape de build, et il s'héberge gratuitement.

## Structure

```
index.html              → accueil : profil, suite Adobe, sections Web & code / Photo / Vidéo / Design / Data, parcours, contact
photo-video.html        → page dédiée à tes photos et vidéos
assets/css/style.css    → design, animations
assets/js/projects.js   → ★ TES PROJETS + réglages (nom d'utilisateur GitHub)
assets/js/media.js      → ★ TES PHOTOS ET VIDÉOS
assets/js/main.js       → interactions (carrousels, fiche projet, galerie, GitHub…)
assets/img/profile.jpg  → photo de profil
assets/img/projets/     → images de tes projets
assets/img/photos/      → photos de ta galerie
```

## Ajouter un projet

1. Dépose tes images dans `assets/img/projets/` (ex. `ma-boutique-cover.jpg`).
2. Ouvre `assets/js/projects.js`, copie un bloc `{ ... }` existant et remplis-le :

```js
{
  id: "ma-boutique",                       // unique, sans espaces
  title: "Boutique Shopify Mode",
  subtitle: "Refonte complète & tunnel de vente",
  category: "web",                         // web | photo | video | design | data | cro | ia
  year: "2026",                            // ou plusieurs sections : ["video", "photo"]
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

Le projet apparaît automatiquement dans le carrousel de la section correspondante.
Sans `cover`, une couverture sobre est générée avec le texte de `glyph`.
Chaque projet a aussi un lien direct : `…/#projet/<id>`.

## Ajouter des photos et des vidéos

Tout se passe dans `assets/js/media.js` :

- **Photos** : exporte-les depuis Lightroom (JPG ou WebP, côté long ≈ 2000 px), dépose-les dans `assets/img/photos/`, puis ajoute une ligne par photo :
  `{ src: "assets/img/photos/portrait-01.jpg", title: "Portrait studio", category: "Portrait" }`
  Les catégories créent les filtres automatiquement. Les 6 premières photos s'affichent aussi sur l'accueil.
- **Vidéos** : publie-les sur YouTube ou Vimeo (même en « non répertoriée »), puis ajoute :
  `{ url: "https://www.youtube.com/watch?v=…", title: "Film de marque", description: "Premiere Pro · After Effects" }`

## GitHub

Tes dépôts publics s'affichent automatiquement dans la section Web & code (hors forks et dépôts archivés).
Pour masquer un dépôt, ajoute son nom dans `hiddenRepos` en haut de `assets/js/projects.js`.
Pour qu'un dépôt ait une belle carte, renseigne sa description (et son site, si besoin) dans *About* sur GitHub.

## Police

Le site utilise la police système d'Apple (**SF Pro**) : elle s'affiche nativement sur iPhone, iPad et Mac.
Apple n'autorise pas l'hébergement de SF Pro sur un site web ; sur Windows et Android, c'est **Inter**, très proche, qui prend le relais.

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

- Style Apple : barre de navigation en verre dépoli, menu mobile plein écran, boutons en pilule, sections claires / grises / noires
- Transitions : apparitions au scroll, zoom de la photo, texte du profil révélé mot à mot, carrousels horizontaux, transitions entre pages
- Une section par domaine avec les outils Adobe correspondants
- Page Photo & Vidéo : mosaïque filtrable, visionneuse plein écran (glisser, clavier), lecteur vidéo
- Dépôts GitHub chargés en direct
- Accessible : navigation au clavier, respect de `prefers-reduced-motion`, focus visible
