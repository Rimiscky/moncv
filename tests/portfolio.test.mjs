import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("le portfolio utilise uniquement le contact professionnel public", async () => {
  const pages = await Promise.all([read("index.html"), read("photo-video.html")]);
  const source = pages.join("\n");

  assert.match(source, /mailto:contact@rimiscky\.fr/);
  assert.doesNotMatch(source, /rimiscky@gmail\.com/i);
  assert.doesNotMatch(source, /href=["']tel:/i);
  assert.doesNotMatch(source, /\b0[1-9](?:[ .-]?\d{2}){4}\b/);
});

test("le lien LinkedIn pointe vers le profil public exact", async () => {
  const html = await read("index.html");

  assert.match(html, /href=["']https:\/\/www\.linkedin\.com\/in\/rimiscky\/?["']/);
  assert.doesNotMatch(html, /linkedin\.com\/search/i);
});

test("la formation et le positionnement restent factuels", async () => {
  const html = await read("index.html");

  assert.match(html, /première année d(?:’|')un cursus en intelligence artificielle/i);
  assert.match(html, /Titre RNCP 36401 — Chef de Projet Multimédia/);
  assert.doesNotMatch(html, /Mastère Directeur de Projet IA|Master 1 en intelligence artificielle/i);
});

test("les métadonnées reprennent le positionnement principal", async () => {
  const html = await read("index.html");

  assert.match(html, /<title>Rimiscky Sambala — Consultant digital &amp; développeur web<\/title>/);
  assert.match(html, /<meta property="og:title" content="Rimiscky Sambala — Consultant digital &amp; développeur web"/);
});
