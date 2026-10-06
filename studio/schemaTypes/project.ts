import { defineField, defineType } from "sanity";
import { contentField } from "./content";

export const project = defineType({
  name: "project",
  title: "Proyecto",
  type: "document",
  groups: [
    { name: "card", title: "Tarjeta", default: true },
    { name: "popup", title: "Pop-up" },
  ],
  fields: [
    defineField({
      name: "kind",
      title: "Sección",
      type: "string",
      group: "card",
      options: { list: [{ title: "Proyectos con Simplify", value: "simplify" }, { title: "Proyectos independientes", value: "independiente" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", title: "Título", type: "string", group: "card", validation: (r) => r.required() }),
    defineField({ name: "category", title: "Categoría", description: "Ej. Swimwear · E-commerce", type: "string", group: "card" }),
    defineField({ name: "order", title: "Orden", description: "Número menor aparece primero.", type: "number", group: "card" }),
    defineField({ name: "cardImage", title: "Imagen de fondo de la tarjeta", type: "image", options: { hotspot: true }, group: "card" }),
    defineField({ name: "cardVideo", title: "Video de fondo (opcional, reemplaza la imagen)", type: "file", options: { accept: "video/*" }, group: "card" }),
    defineField({ name: "previewImage", title: "Imagen al pasar el mouse (hover)", type: "image", options: { hotspot: true }, group: "card" }),
    defineField({ name: "cardColor", title: "Color de fondo (si no hay imagen)", type: "string", initialValue: "#212121", group: "card" }),
    defineField({ name: "year", title: "Año", type: "string", group: "popup" }),
    defineField({ name: "summary", title: "Resumen (subtítulo en mayúsculas)", type: "text", rows: 2, group: "popup" }),
    defineField({ name: "roleNote", title: "Nota de rol (caja gris)", description: "Ej. Diseño UX/UI y maquetación en Figma · Implementación a cargo de Simplify", type: "text", rows: 2, group: "popup" }),
    { ...contentField, group: "popup" },
  ],
  orderings: [{ title: "Orden manual", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "category", media: "cardImage", kind: "kind" },
    prepare: ({ title, subtitle, media, kind }) => ({ title, subtitle: `${kind === "simplify" ? "Simplify" : "Independiente"} · ${subtitle ?? ""}`, media }),
  },
});
