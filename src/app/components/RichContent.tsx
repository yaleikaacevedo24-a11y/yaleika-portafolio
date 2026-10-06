import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { ContentBlock } from "@/lib/content";

const font = "font-['Outfit',sans-serif] font-normal text-[#212121]";

/** Convierte un link de YouTube o Vimeo en URL embebible. */
function toEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

const textComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-[15px] md:text-[18px] leading-[1.6]">{children}</p>,
    h2: ({ children }) => <p className="text-[17px] md:text-[22px] uppercase pt-4 md:pt-6">{children}</p>,
    h3: ({ children }) => (
      <p className="font-medium text-[11px] tracking-[0.55px] uppercase pt-6">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[#97a7dd] pl-5 text-[16px] md:text-[20px] leading-[1.5]">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="flex flex-col gap-3 pl-5 list-disc marker:text-[#97a7dd]">{children}</ul>,
    number: ({ children }) => <ol className="flex flex-col gap-3 pl-5 list-decimal">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-60">
        {children}
      </a>
    ),
  },
};

export function RichContent({ blocks }: { blocks: ContentBlock[] }) {
  // Agrupa bloques de texto consecutivos para que PortableText maneje listas correctamente
  const groups: (ContentBlock | ContentBlock[])[] = [];
  for (const b of blocks) {
    const last = groups[groups.length - 1];
    if (b._type === "block") Array.isArray(last) ? last.push(b) : groups.push([b]);
    else groups.push(b);
  }

  return (
    <div className={`flex flex-col gap-8 md:gap-10 ${font}`}>
      {groups.map((g, i) => {
        if (Array.isArray(g)) {
          return (
            <div key={i} className="flex flex-col gap-6">
              <PortableText value={g as any} components={textComponents} />
            </div>
          );
        }
        switch (g._type) {
          case "imageBlock":
            return (
              <figure key={g._key} className="flex flex-col gap-3">
                <div className={`rounded-[4px] overflow-hidden ${g.size === "mobile" ? "w-[200px] md:w-[280px]" : "w-full"}`}>
                  <img src={g.src} alt={g.alt ?? ""} loading="lazy" className="w-full object-cover" />
                </div>
                {g.caption && <figcaption className="text-[13px] opacity-60">{g.caption}</figcaption>}
              </figure>
            );
          case "gallery":
            return (
              <div key={g._key} className={`grid gap-3 ${g.columns === 3 ? "grid-cols-3" : g.columns === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {g.images.map((im, j) => (
                  <img key={j} src={im.src} alt={im.alt ?? ""} loading="lazy" className="w-full aspect-square object-cover rounded-[4px]" />
                ))}
              </div>
            );
          case "videoBlock":
            return (
              <figure key={g._key} className="flex flex-col gap-3">
                {g.fileUrl ? (
                  <video src={g.fileUrl} controls playsInline className="w-full rounded-[4px]" />
                ) : g.embedUrl ? (
                  <div className="aspect-video w-full rounded-[4px] overflow-hidden">
                    <iframe
                      src={toEmbed(g.embedUrl)}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={g.caption ?? "Video"}
                    />
                  </div>
                ) : null}
                {g.caption && <figcaption className="text-[13px] opacity-60">{g.caption}</figcaption>}
              </figure>
            );
          case "listBlock":
            return (
              <div key={g._key} className="flex flex-col gap-6">
                {g.title && <p className="font-medium text-[11px] tracking-[0.55px] uppercase">{g.title}</p>}
                <div className="flex flex-col gap-4">
                  {g.items.map((d) => (
                    <div key={d} className="flex gap-3 items-center">
                      <div className="bg-[#97a7dd] rounded-[2px] size-1 shrink-0" />
                      <p className="text-[14px] leading-[1.6]">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
