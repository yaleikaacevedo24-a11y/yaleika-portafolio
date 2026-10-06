# Portafolio Yaleika — Sanity + Vercel

Dos partes en el mismo repo:

| Carpeta | Qué es | Dónde vive |
|---|---|---|
| `/` (raíz) | La web (React + Vite) | Vercel |
| `/studio` | El panel para editar contenido | `tu-nombre.sanity.studio` |

Sin Sanity configurado, la web muestra el contenido de ejemplo actual. Nada se rompe.

## 1. Crear el proyecto en Sanity (una sola vez)

1. Crea una cuenta gratis en sanity.io.
2. En la terminal:
   ```bash
   cd studio
   npm install
   npx sanity login
   npx sanity init --env      # elige "Create new project", dataset "production"
   ```
   Esto crea `studio/.env` con tu Project ID (no se sube a Git).
3. Publica el panel:
   ```bash
   npx sanity deploy          # te pide un nombre → yaleika.sanity.studio
   ```
4. En sanity.io/manage → tu proyecto → **API → CORS origins**, agrega:
   - `http://localhost:8443` (desarrollo)
   - tu dominio de Vercel, ej. `https://yaleika.vercel.app`
   - tu dominio propio si lo conectas
   Deja **"Allow credentials" desactivado** (la web solo lee contenido público).

## 2. Subir a GitHub y conectar Vercel

1. Sube la carpeta a un repo nuevo en GitHub.
2. En vercel.com → **Add New Project** → importa el repo.
3. En **Environment Variables** agrega:
   - `VITE_SANITY_PROJECT_ID` = tu Project ID
   - `VITE_SANITY_DATASET` = `production`
4. Deploy.

## 3. Que la web se actualice sola al publicar

Vite genera un sitio estático, pero el contenido se carga desde Sanity al abrir la página: **al publicar en el panel, el cambio se ve al recargar.** No hace falta redeploy.

## 4. Cómo editar

En el panel verás tres secciones: **Proyectos con Simplify**, **Proyectos independientes** y **Blog · Artículos**.

Cada proyecto tiene dos pestañas:
- **Tarjeta**: título, categoría, orden, imagen/video de fondo, imagen de hover.
- **Pop-up**: año, resumen, nota de rol y el contenido libre por bloques (texto, imagen, galería, video, lista).

Videos: clips cortos se suben directo; videos largos, mejor como link de YouTube o Vimeo (no consumen el almacenamiento del plan gratis).

## Seguridad

- La web usa solo lectura pública vía CDN, sin token. Mantén el dataset en **public**.
- No crees API tokens para la web. Si en el futuro necesitas uno (ej. borradores privados), va en variables de entorno de Vercel con permiso **Viewer**, nunca en el código.
- Los archivos `.env` están en `.gitignore`.
