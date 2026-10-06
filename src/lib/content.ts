import { useEffect, useState } from "react";
import { sanity, isSanityConfigured, img } from "./sanity";

import imgDesktopMockup from "@/assets/images/mockup-desktop.jpg";
import imgMobileMockup from "@/assets/images/mockup-mobile.jpg";
import imgHeroSection from "@/assets/images/hero.png";
import imgLeftColumnImage from "@/assets/images/sobre-mi.jpg";
import imgArticleImage from "@/assets/images/ejemplo-1.jpg";
import imgArticleImage1 from "@/assets/images/ejemplo-2.jpg";
import imgArticleImage2 from "@/assets/images/ejemplo-3.jpg";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/** Bloques del contenido del pop-up. Vienen de Sanity o del respaldo local. */
export type ContentBlock =
  | { _type: "block"; _key: string; [k: string]: any } // texto enriquecido (Portable Text)
  | { _type: "imageBlock"; _key: string; src: string; alt?: string; caption?: string; size?: "full" | "mobile" }
  | { _type: "gallery"; _key: string; images: { src: string; alt?: string }[]; columns?: number }
  | { _type: "videoBlock"; _key: string; fileUrl?: string; embedUrl?: string; caption?: string }
  | { _type: "listBlock"; _key: string; title?: string; items: string[] };

export type Project = {
  id: string;
  kind: "simplify" | "independiente";
  title: string;
  category?: string;
  year?: string;
  summary?: string;
  roleNote?: string;
  cardColor: string;
  cardImage?: string;
  cardVideo?: string;
  previewImage?: string;
  content: ContentBlock[];
};

export type Article = {
  id: string;
  title: string;
  category?: string;
  date?: string;
  excerpt?: string;
  coverImage?: string;
  content: ContentBlock[];
};

/** Lo que abre el pop-up lateral. */
export type DrawerItem =
  | { type: "project"; data: Project }
  | { type: "article"; data: Article };

// ── Consultas GROQ ────────────────────────────────────────────────────────────

const contentProjection = `content[]{
  ...,
  _type == "gallery" => { ..., images[]{ ..., "asset": @ } },
  _type == "videoBlock" => { ..., "fileUrl": file.asset->url }
}`;

const QUERY = `{
  "projects": *[_type == "project"] | order(coalesce(order, 999) asc, _createdAt desc){
    _id, kind, title, category, year, summary, roleNote, cardColor,
    cardImage, previewImage, "cardVideo": cardVideo.asset->url,
    ${contentProjection}
  },
  "articles": *[_type == "article"] | order(publishedAt desc){
    _id, title, category, publishedAt, readTime, excerpt, coverImage,
    ${contentProjection}
  }
}`;

// ── Normalización ─────────────────────────────────────────────────────────────

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function formatDate(iso?: string, readTime?: number) {
  if (!iso) return undefined;
  const d = new Date(iso);
  const base = `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`;
  return readTime ? `${base} · ${readTime} min` : base;
}

function normalizeBlocks(blocks: any[] | undefined): ContentBlock[] {
  return (blocks ?? []).map((b) => {
    switch (b._type) {
      case "imageBlock":
        return { ...b, src: img(b.image ?? b, b.size === "mobile" ? 700 : 1600) };
      case "gallery":
        return { ...b, images: (b.images ?? []).map((i: any) => ({ src: img(i.asset, 1200), alt: i.alt })) };
      default:
        return b;
    }
  });
}

function normalize(raw: any): { projects: Project[]; articles: Article[] } {
  return {
    projects: (raw.projects ?? []).map((p: any) => ({
      id: p._id,
      kind: p.kind ?? "simplify",
      title: p.title,
      category: p.category,
      year: p.year,
      summary: p.summary,
      roleNote: p.roleNote,
      cardColor: p.cardColor ?? "#212121",
      cardImage: img(p.cardImage, 1000),
      cardVideo: p.cardVideo,
      previewImage: img(p.previewImage, 1000),
      content: normalizeBlocks(p.content),
    })),
    articles: (raw.articles ?? []).map((a: any) => ({
      id: a._id,
      title: a.title,
      category: a.category,
      date: formatDate(a.publishedAt, a.readTime),
      excerpt: a.excerpt,
      coverImage: img(a.coverImage, 900),
      content: normalizeBlocks(a.content),
    })),
  };
}

// ── Contenido de respaldo (se muestra si Sanity no está configurado) ──────────

const p = (text: string, key: string, style = "normal") => ({
  _type: "block" as const,
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key + "s", text, marks: [] }],
});

const sampleContent: ContentBlock[] = [
  p("El reto", "h1", "h2"),
  p("La marca presentaba una tasa de abandono inusualmente alta en las páginas de producto.", "t1"),
  p("El proceso", "h2", "h2"),
  p("Auditoría basada en heurísticas de Baymard y rediseño de la arquitectura de información.", "t2"),
  { _type: "imageBlock", _key: "i1", src: imgDesktopMockup, alt: "Desktop mockup", size: "full" },
  { _type: "imageBlock", _key: "i2", src: imgMobileMockup, alt: "Mobile mockup", size: "mobile" },
  { _type: "listBlock", _key: "l1", title: "Entregables", items: ["Auditoría UX basada en Baymard", "Arquitectura de Información", "Prototipo de alta fidelidad", "Maquetación para desarrollo"] },
];

const bgs = [imgArticleImage, imgArticleImage1, imgArticleImage2, imgLeftColumnImage];
const previews = [imgLeftColumnImage, imgHeroSection];
const indepCats = ["Swimwear · E-commerce", "Alimentos · E-commerce", "Cultura · E-commerce", "Agencia · Colaboración"];

const FALLBACK = {
  projects: [
    ...Array.from({ length: 8 }, (_, i): Project => ({
      id: `s${i}`, kind: "simplify", title: `Proyecto 0${i + 1}`, category: "E-commerce", year: "2025",
      summary: "Rediseño completo de la experiencia de compra",
      roleNote: "Diseño UX/UI y maquetación en Figma · Implementación técnica a cargo del equipo de desarrollo de Simplify",
      cardColor: i % 2 ? "#212121" : "#e5e7eb", cardImage: bgs[i % 4], previewImage: previews[i % 2], content: sampleContent,
    })),
    ...Array.from({ length: 8 }, (_, i): Project => ({
      id: `i${i}`, kind: "independiente", title: `Proyecto 0${i + 1}`, category: indepCats[i % 4], year: "2025",
      cardColor: "#212121", cardImage: bgs[(i + 3) % 4], content: sampleContent,
    })),
  ],
  articles: [
    { id: "a1", title: "¿Por qué los usuarios abandonan el checkout?", category: "Checkout", date: "Ene 24, 2026 · 8 min", excerpt: "Un análisis de los principales puntos de fricción en el proceso de compra.", coverImage: imgArticleImage, content: [p("Contenido del artículo.", "a1")] },
    { id: "a2", title: "Anatomía de una página de producto que convierte", category: "Product Pages", date: "Dic 15, 2025 · 12 min", excerpt: "Los elementos esenciales que toda página de producto necesita.", coverImage: imgArticleImage1, content: [p("Contenido del artículo.", "a2")] },
    { id: "a4", title: "Filtros de colección que sí ayudan a comprar", category: "Navegación", date: "Oct 10, 2025 · 7 min", excerpt: "Cómo diseñar filtros que reducen el esfuerzo en catálogos grandes.", coverImage: imgLeftColumnImage, content: [p("Contenido del artículo.", "a4")] },
    { id: "a3", title: "Mobile-first no es solo reducir el ancho", category: "Mobile UX", date: "Nov 02, 2025 · 6 min", excerpt: "Por qué diseñar para móvil requiere repensar la jerarquía desde cero.", coverImage: imgArticleImage2, content: [p("Contenido del artículo.", "a3")] },
  ] as Article[],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePortfolioContent() {
  const [data, setData] = useState<{ projects: Project[]; articles: Article[] }>(
    isSanityConfigured ? { projects: [], articles: [] } : FALLBACK,
  );
  const [loading, setLoading] = useState(isSanityConfigured);

  useEffect(() => {
    if (!sanity) return;
    sanity
      .fetch(QUERY)
      .then((raw) => setData(normalize(raw)))
      .catch((err) => {
        console.error("Error cargando contenido de Sanity:", err);
        setData(FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    loading,
    simplify: data.projects.filter((p) => p.kind === "simplify"),
    independent: data.projects.filter((p) => p.kind === "independiente"),
    articles: data.articles,
  };
}
