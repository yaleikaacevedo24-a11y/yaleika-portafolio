import { useEffect, useRef, useState } from "react";

/**
 * Video de fondo robusto para las tarjetas.
 *
 * Por qué existe: React no escribe el atributo `muted` en el HTML (solo la
 * propiedad), y Chrome/Safari bloquean el autoplay si no lo ven. El video
 * "carga" pero nunca arranca y queda invisible. Aquí forzamos muted, llamamos
 * a play() a mano, pausamos fuera de pantalla y, si el archivo no se puede
 * reproducir (p. ej. un .mov/HEVC del iPhone), lo ocultamos para que se vea
 * la imagen de respaldo en lugar de un recuadro vacío.
 */
export function BgVideo({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");

    const tryPlay = () => { v.play().catch(() => { /* el navegador puede reintentar al volver a la vista */ }); };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) tryPlay(); else v.pause(); },
      { threshold: 0.15 }
    );
    io.observe(v);
    tryPlay();
    return () => io.disconnect();
  }, [src]);

  if (failed) return null;

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      onCanPlay={() => setReady(true)}
      onLoadedData={() => setReady(true)}
      onPlaying={() => setReady(true)}
      onError={() => setFailed(true)}
      className={`${className} transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
