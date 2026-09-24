/* ==========================================================================
   MES PHOTOS & VIDÉOS — alimente la page photo-video.html
   (et les aperçus des sections Photo et Vidéo de l'accueil).
   --------------------------------------------------------------------------
   PHOTOS
   1. Exporte tes photos depuis Lightroom en JPG ou WebP, côté long 2000 px
      environ (qualité 80) pour un site rapide.
   2. Dépose-les dans assets/img/photos/
   3. Ajoute une ligne par photo ci-dessous :
        { src: "assets/img/photos/portrait-01.jpg", title: "Portrait studio", category: "Portrait" },
      "category" crée automatiquement les filtres (Portrait, Produit, Lieux…).

   VIDÉOS
   Mets tes vidéos sur YouTube ou Vimeo (même en « non répertoriée »),
   puis ajoute une ligne par vidéo :
        { url: "https://www.youtube.com/watch?v=XXXXXXXXXXX", title: "Film de marque", description: "Premiere Pro · After Effects" },
   La miniature YouTube est récupérée automatiquement. Pour Vimeo ou un
   fichier .mp4, ajoute  poster: "assets/img/photos/miniature.jpg".
   ========================================================================== */

window.PHOTOS = [
  // { src: "assets/img/photos/portrait-01.jpg", title: "Portrait studio", category: "Portrait" },
];

window.VIDEOS = [
  // { url: "https://www.youtube.com/watch?v=XXXXXXXXXXX", title: "Film de marque", description: "Premiere Pro · After Effects" },
];
