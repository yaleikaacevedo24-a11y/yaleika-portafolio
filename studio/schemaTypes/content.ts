import { defineArrayMember, defineField, defineType } from "sanity";

/** Bloques libres para armar el contenido del pop-up. */
export const contentField = defineField({
  name: "content",
  title: "Contenido del pop-up",
  description: "Agrega y reordena bloques: texto, imágenes, galerías, videos y listas.",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      title: "Texto",
      styles: [
        { title: "Párrafo", value: "normal" },
        { title: "Título de sección (ej. El reto)", value: "h2" },
        { title: "Etiqueta pequeña", value: "h3" },
        { title: "Cita destacada", value: "blockquote" },
      ],
      lists: [
        { title: "Viñetas", value: "bullet" },
        { title: "Numerada", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Negrita", value: "strong" },
          { title: "Cursiva", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Enlace",
            fields: [{ name: "href", type: "url", title: "URL" }],
          },
        ],
      },
    }),
    defineArrayMember({
      // Imagen como tipo "image" directo: la forma recomendada por Sanity dentro de texto enriquecido
      name: "imageBlock",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Texto alternativo" },
        { name: "caption", type: "string", title: "Pie de foto" },
        {
          name: "size",
          type: "string",
          title: "Tamaño",
          options: { list: [{ title: "Ancho completo (desktop)", value: "full" }, { title: "Angosta (mockup móvil)", value: "mobile" }], layout: "radio" },
          initialValue: "full",
        },
      ],
    }),
    defineArrayMember({
      name: "gallery",
      title: "Galería",
      type: "object",
      fields: [
        {
          name: "images",
          type: "array",
          title: "Imágenes",
          of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Texto alternativo" }] }],
          options: { layout: "grid" },
        },
        { name: "columns", type: "number", title: "Columnas", options: { list: [1, 2, 3] }, initialValue: 2 },
      ],
      preview: { select: { media: "images.0" }, prepare: (v) => ({ ...v, title: "Galería" }) },
    }),
    defineArrayMember({
      name: "videoBlock",
      title: "Video",
      type: "object",
      description: "Sube un clip corto o pega un link de YouTube/Vimeo (recomendado para videos largos).",
      fields: [
        { name: "file", type: "file", title: "Archivo de video (mp4/webm)", options: { accept: "video/*" } },
        { name: "embedUrl", type: "url", title: "Link de YouTube o Vimeo" },
        { name: "caption", type: "string", title: "Pie de video" },
      ],
      preview: { select: { title: "caption", subtitle: "embedUrl" }, prepare: (v) => ({ title: v.title || "Video", subtitle: v.subtitle }) },
    }),
    defineArrayMember({
      name: "listBlock",
      title: "Lista con título (ej. Entregables)",
      type: "object",
      fields: [
        { name: "title", type: "string", title: "Título", initialValue: "Entregables" },
        { name: "items", type: "array", title: "Elementos", of: [{ type: "string" }] },
      ],
      preview: { select: { title: "title", subtitle: "items.0" } },
    }),
  ],
});
