import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.VITE_SANITY_DATASET as string | undefined) ?? "production";

/** true cuando el sitio está conectado a Sanity. Si no, se usa el contenido de respaldo local. */
export const isSanityConfigured = Boolean(projectId);

export const sanity = isSanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: "2025-01-01",
      useCdn: true, // lectura pública vía CDN, sin token
    })
  : null;

const builder = sanity ? imageUrlBuilder(sanity) : null;

/** Devuelve la URL optimizada (webp/avif automático) de una imagen de Sanity. */
export function img(source: any, width = 1600): string | undefined {
  if (!source || !builder) return undefined;
  return builder.image(source).width(width).auto("format").quality(80).url();
}
