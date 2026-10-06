import { defineField, defineType } from "sanity";
import { contentField } from "./content";

export const article = defineType({
  name: "article",
  title: "Artículo",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Título", type: "string", validation: (r) => r.required() }),
    defineField({ name: "category", title: "Categoría", description: "Ej. Checkout, Mobile UX", type: "string" }),
    defineField({ name: "publishedAt", title: "Fecha de publicación", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({ name: "readTime", title: "Minutos de lectura", type: "number" }),
    defineField({ name: "excerpt", title: "Extracto", type: "text", rows: 3 }),
    defineField({ name: "coverImage", title: "Imagen de portada", type: "image", options: { hotspot: true } }),
    contentField,
  ],
  orderings: [{ title: "Más recientes", name: "dateDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage" } },
});
