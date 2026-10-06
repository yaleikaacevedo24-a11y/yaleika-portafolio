import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, X } from "lucide-react";
import { usePortfolioContent, type DrawerItem, type Project, type Article } from "@/lib/content";
import logoSvg from "@/assets/svg/logo.svg?raw";
import logoFooterSvg from "@/assets/svg/logo-footer.svg?raw";
import { RichContent } from "./components/RichContent";
import svgPaths from "@/assets/svg/landing";
import svgViewButton from "@/assets/svg/view-button";
import imgHeroSection from "@/assets/images/hero.png";
import imgLeftColumnImage from "@/assets/images/sobre-mi.jpg";
import imgArticleImage from "@/assets/images/ejemplo-1.jpg";

// ── Custom cursor ─────────────────────────────────────────────────────────────

function useGlobalCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return { pos, visible, setVisible };
}

const cursorContext = {
  setVisible: (_v: boolean) => {},
};

function CursorPill({ pos, visible }: { pos: { x: number; y: number }; visible: boolean }) {
  return (
    <div
      className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 [@media(hover:none)]:hidden"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="bg-[#93a3d8] flex gap-2 items-center justify-center pl-4 pr-2 py-2 rounded-full whitespace-nowrap shadow-md"
        style={{
          transform: visible ? "scale(1)" : "scale(0.15)",
          opacity: visible ? 1 : 0,
          transition: visible
            ? "transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 140ms ease-out"
            : "transform 200ms ease-in, opacity 180ms ease-in",
        }}
      >
        <span className="font-['Outfit',sans-serif] font-normal text-[#212121] text-[15px] tracking-[-0.15px] leading-none">
          Ver
        </span>
        <div className="bg-white flex items-center justify-center rounded-full size-6 shrink-0">
          <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
            <path d={svgViewButton.p95d3900} stroke="#212121" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Project Drawer ────────────────────────────────────────────────────────────

function DrawerPanel({ item, onClose }: { item: DrawerItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isProject = item.type === "project";
  const project = isProject ? (item.data as Project) : null;
  const article = !isProject ? (item.data as Article) : null;
  const meta = isProject
    ? [project!.category, project!.kind === "simplify" ? "Simplify" : "Independiente", project!.year]
    : [article!.category, article!.date];
  const summary = project?.summary ?? article?.excerpt;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed z-50 bg-white
        bottom-0 left-0 right-0 h-[85%]
        md:bottom-auto md:top-0 md:left-auto md:right-0 md:h-full md:w-[680px]
        flex flex-col shadow-2xl
        animate-in duration-300
        slide-in-from-bottom md:slide-in-from-right"
        role="dialog"
        aria-modal="true"
        aria-label={item.data.title}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 md:right-8 md:top-8 z-10 size-10 flex items-center justify-center hover:opacity-60 transition-opacity"
          aria-label="Cerrar"
        >
          <X size={28} strokeWidth={1.5} />
        </button>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-10 md:gap-16 px-5 pt-16 pb-12 md:p-14 md:pb-16">

            <div className="flex gap-x-2 gap-y-1 md:gap-4 items-center font-['Outfit',sans-serif] font-normal text-[#212121] text-[11px] md:text-[13px] uppercase flex-wrap pr-10">
              {meta.filter(Boolean).map((m, i) => (
                <span key={i} className="flex gap-2 md:gap-4 items-center">
                  {i > 0 && <span className="opacity-30">·</span>}
                  <span>{m}</span>
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 font-['Outfit',sans-serif] font-normal text-[#212121]">
                <p className="text-[34px] md:text-[56px] leading-[1.1]">{item.data.title}</p>
                {summary && <p className="text-[15px] md:text-[22px] uppercase leading-snug">{summary}</p>}
              </div>
              {project?.roleNote && (
                <div className="bg-[#f5f5f5] rounded-[2px] p-4 md:p-7 font-['Outfit',sans-serif] text-[#212121] text-[13px] md:text-[14px] leading-[1.6]">
                  {project.roleNote}
                </div>
              )}
            </div>

            <div className="w-full h-px bg-[#E5E7EB]" />

            <RichContent blocks={item.data.content} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Slider horizontal reutilizable ───────────────────────────────────────────

const fontBase = "font-['Outfit',sans-serif] font-normal text-[#212121]";

function ArrowBtn({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Anterior" : "Siguiente"}
      className="size-8 flex items-center justify-center text-[#212121] transition-opacity hover:opacity-50 disabled:opacity-20 disabled:pointer-events-none"
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className={dir === "prev" ? "rotate-180" : ""}>
        <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Slider<T>({
  id, title, items, itemClass, renderItem, onViewAll,
}: {
  id?: string;
  title: string;
  items: T[];
  itemClass: string;
  renderItem: (item: T) => React.ReactNode;
  onViewAll: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const drag = useRef({ down: false, x: 0, left: 0, moved: false, lastX: 0, lastT: 0, v: 0 });
  const raf = useRef(0);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, items.length]);

  const go = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  // Arrastrar con el mouse (en desktop)
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !track.current) return;
    cancelAnimationFrame(raf.current);
    drag.current = { down: true, x: e.clientX, left: track.current.scrollLeft, moved: false, lastX: e.clientX, lastT: performance.now(), v: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down || !track.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) track.current.scrollLeft = d.left - dx;
    const now = performance.now();
    const dt = now - d.lastT || 16;
    d.v = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.v; // px/ms, suavizado
    d.lastX = e.clientX; d.lastT = now;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    // Inercia: sigue deslizando y frena de a poco
    let v = d.v * 16;
    const step = () => {
      if (!track.current || Math.abs(v) < 0.3) return;
      track.current.scrollLeft -= v;
      v *= 0.94;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.stopPropagation(); e.preventDefault(); drag.current.moved = false; }
  };

  const overflow = !(edges.start && edges.end);

  return (
    <section id={id} className="bg-white w-full py-9">
      <div className="flex items-center justify-between gap-4 mb-6 px-5 sm:px-9">
        <p className={`${fontBase} text-[20px] sm:text-[22px] uppercase`}>{title}</p>
        <div className="flex items-center gap-6 sm:gap-8 shrink-0">
          <button onClick={onViewAll} className={`${fontBase} text-[13px] uppercase underline underline-offset-4 hover:opacity-60 transition-opacity`}>
            Ver todos ({items.length})
          </button>
          {overflow && (
            <div className="hidden sm:flex gap-1">
              <ArrowBtn dir="prev" disabled={edges.start} onClick={() => go(-1)} />
              <ArrowBtn dir="next" disabled={edges.end} onClick={() => go(1)} />
            </div>
          )}
        </div>
      </div>

      <div
        ref={track}
        onScroll={update}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-5 sm:px-9 scroll-px-5 sm:scroll-px-9 select-none"
      >
        {items.map((it, i) => (
          <div key={i} className={`shrink-0 ${itemClass}`}>{renderItem(it)}</div>
        ))}
      </div>
    </section>
  );
}

// ── Vista "Ver todos" (cuadrícula) ───────────────────────────────────────────

function ViewAllPanel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 bg-white overflow-y-auto overscroll-contain animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur flex items-center justify-between px-5 sm:px-9 py-5 border-b border-[#e5e5e5]">
        <p className={`${fontBase} text-[20px] sm:text-[22px] uppercase`}>{title}</p>
        <button onClick={onClose} aria-label="Cerrar" className="size-10 flex items-center justify-center hover:opacity-60">
          <X size={28} strokeWidth={1.5} />
        </button>
      </div>
      <div className="relative z-0 isolate grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-9">{children}</div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 sm:px-9">
      {/* Logo */}
      <a href="#" aria-label="Yaleika — inicio" className="text-white block w-[100px] sm:w-[124px] [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
        dangerouslySetInnerHTML={{ __html: logoSvg }} />

      {/* Tagline — hidden on mobile */}
      <span className="hidden md:block font-['Outfit',sans-serif] font-medium text-[11px] text-white tracking-[0.55px] uppercase">
        UX/UI DESIGNER · E-COMMERCE
      </span>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-3 items-center font-['Outfit',sans-serif]">
        {["SOBRE MÍ", "PROYECTOS", "BLOG"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s/g, "").replace("í", "i")}`}
            className="text-[13px] text-white uppercase px-2 hover:opacity-70 transition-opacity"
          >
            [{item}]
          </a>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-1"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#212121] flex flex-col gap-0 font-['Outfit',sans-serif] md:hidden">
          {["SOBRE MÍ", "PROYECTOS", "BLOG"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s/g, "").replace("í", "i")}`}
              onClick={() => setOpen(false)}
              className="text-[13px] text-white uppercase px-5 py-4 border-b border-white/10 hover:bg-white/10 transition-colors"
            >
              [{item}]
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

import { Butterflies } from "./components/Butterflies";

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative w-full min-h-[560px] sm:min-h-[700px] lg:min-h-[860px] flex flex-col overflow-hidden">
      {/* Background image */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <img
          alt=""
          className="absolute w-full h-[252%] top-[-16%] left-0 object-cover max-w-none"
          src={imgHeroSection}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <Butterflies />

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-end px-5 pb-10 sm:px-9 sm:pb-16">
        {/* Badge */}
        <div className="inline-flex items-center bg-[#212121] px-2 py-2 mb-6 self-start">
          <span className="font-['Outfit',sans-serif] font-medium text-[11px] text-white tracking-[0.55px] uppercase">
            PORTAFOLIO 2026 · UX/UI E-COMMERCE
          </span>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <p className="font-['Outfit',sans-serif] font-normal text-white leading-[1.2] text-[28px] sm:text-[36px] lg:text-[44px] max-w-[880px]">
            Diseño experiencias digitales que convierten, entendiendo el negocio y el comportamiento del comprador.
          </p>
          <div className="flex flex-col items-start lg:items-end font-['Outfit',sans-serif] font-normal text-white uppercase lg:shrink-0">
            <span className="text-[10px]">[ BASE ]</span>
            <span className="text-[13px]">Panamá</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function Tag({ children }: { children: string }) {
  return (
    <span className="bg-[#f3f4f6] px-2 py-2 font-['Outfit',sans-serif] font-medium text-[11px] text-[#212121] tracking-[0.55px] uppercase">
      {children}
    </span>
  );
}

function StatPill({ num, label }: { num: string; label: string }) {
  return (
    <div className="bg-[#f3f4f6] flex gap-1 items-start px-2 py-2 font-['Outfit',sans-serif] font-medium text-[11px] text-[#212121] tracking-[0.55px] uppercase">
      <span className="opacity-55">{num}</span>
      <span>{label}</span>
    </div>
  );
}

function FigmaIcon() {
  return (
    <svg className="size-5 block" fill="none" viewBox="0 0 20 20">
      <g>
        <path d={svgPaths.pef55e80} fill="white" />
        <path d={svgPaths.p381b3bf0} fill="white" />
        <path d={svgPaths.p14cee780} fill="white" />
        <path d={svgPaths.p1e2fd680} fill="white" />
      </g>
    </svg>
  );
}

function ShopifyIcon() {
  return (
    <svg className="size-5 block" fill="none" viewBox="0 0 20 20">
      <g>
        <path d={svgPaths.p2d7a6100} fill="white" />
      </g>
    </svg>
  );
}

function PlatformCard({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div className="bg-[#f3f4f6] flex items-center gap-4 p-4 flex-1 min-w-0">
      <div className="bg-[#212121] flex items-center justify-center shrink-0 size-10">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 font-['Outfit',sans-serif] text-[#212121] min-w-0">
        <p className="text-[14px] leading-[1.6]">{name}</p>
        <p className="text-[12px] leading-normal">{description}</p>
      </div>
    </div>
  );
}

function AboutSection() {
  const tags = [
    "Investigación de usuarios",
    "Arquitectura de información",
    "Diseño de interfaces (UI)",
    "Sistemas de diseño",
    "Design Tokens",
    "Responsive Design",
    "Mobile-First",
    "Diseño de E-commerce",
    "Conversion Rate Optimization (CRO)",
  ];

  return (
    <section id="sobremi" className="bg-white w-full px-5 py-9 sm:px-9">
      <p className="font-['Outfit',sans-serif] font-normal text-[#212121] text-[22px] uppercase mb-6">
        Sobre mí
      </p>

      <div className="flex flex-col xl:flex-row gap-10 xl:gap-[60px] items-start">
        {/* Photo */}
        <div className="w-full xl:w-[54%] xl:shrink-0 h-[300px] sm:h-[420px] xl:h-[680px] relative overflow-hidden">
          <img
            alt="Yaleika Acevedo"
            className="absolute inset-0 w-full h-full object-cover"
            src={imgLeftColumnImage}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-10 flex-1 min-w-0">
          {/* Bio */}
          <div className="flex flex-col gap-3">
            <p className="font-['Outfit',sans-serif] font-normal text-[#212121] text-[16px] sm:text-[18px] leading-[1.6]">
              Formo parte del equipo de diseño de Simplify, la primera agencia Shopify Plus Partner de Centroamérica y el Caribe, donde diseño y maqueto experiencias de e-commerce en Figma. También trabajo de forma independiente con marcas que buscan un diseño estratégico, centrado en el usuario y orientado a resultados.
            </p>
            <div className="flex flex-wrap gap-2">
              <StatPill num="+2" label="Años en e-commerce" />
              <StatPill num="+80" label="Proyectos diseñados" />
              <StatPill num="+7" label="Industrias" />
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-col gap-4">
            <p className="font-['Outfit',sans-serif] font-medium text-[#212121] text-[11px] tracking-[0.55px] uppercase">
              HABILIDADES Y ENFOQUE TÉCNICO
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>

          {/* Ecosystem */}
          <div className="flex flex-col gap-4">
            <p className="font-['Outfit',sans-serif] font-medium text-[#212121] text-[11px] tracking-[0.55px] uppercase">
              MI ECOSISTEMA PRINCIPAL
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <PlatformCard
                icon={<FigmaIcon />}
                name="Figma"
                description="Estructura, diseño y tokens de interfaz"
              />
              <PlatformCard
                icon={<ShopifyIcon />}
                name="Shopify"
                description="E-commerce robusto, escalable y optimizado"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Projects with Simplify ────────────────────────────────────────────────────

type ProjectCardProps = {
  bg: string;
  bgImage?: string;
  bgVideo?: string;
  textColor?: string;
  label: string;
  previewImage?: string;
};

function SimplifyProjectCard({
  bg,
  bgImage,
  bgVideo,
  textColor = "#212121",
  label,
  previewImage,
  onHoverChange,
}: ProjectCardProps & { onHoverChange?: (v: boolean) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-full aspect-[3/4] flex flex-col p-6 sm:p-8 relative overflow-hidden group cursor-none"
      style={{ backgroundColor: bg }}
      onMouseEnter={() => { setHovered(true); onHoverChange?.(true); }}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(false); }}
    >
      {/* Background image */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Background video */}
      {bgVideo && (
        <video
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Dark overlay when bg media is present */}
      {(bgImage || bgVideo) && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      )}

      {/* Label */}
      <p
        className="relative z-10 font-['Outfit',sans-serif] font-normal text-[20px] uppercase -mt-4"
        style={{ color: bgImage || bgVideo ? "white" : textColor }}
      >
        {label}
      </p>

      {/* Hover preview — centered, with margins, floats over bgImage */}
      {previewImage && (
        <div
          className={`absolute inset-14 sm:inset-16 z-20 transition-opacity duration-400 ease-out ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={previewImage}
            alt="Preview del proyecto"
            className="w-full h-full object-cover"
          />
        </div>
      )}

    </div>
  );
}

function ProjectsCarousel({ items, onOpen }: { items: Project[]; onOpen: (item: DrawerItem) => void }) {
  const { pos, visible, setVisible } = useGlobalCursor();
  const [all, setAll] = useState(false);
  if (!items.length) return null;
  const card = (c: Project) => (
    <div onClick={() => onOpen({ type: "project", data: c })}>
      <SimplifyProjectCard bg={c.cardColor} bgImage={c.cardImage} bgVideo={c.cardVideo} textColor="white"
        label={c.title} previewImage={c.previewImage} onHoverChange={setVisible} />
    </div>
  );
  return (
    <>
      <Slider id="proyectos" title=" PROYECTOS con SIMPLIFY;" items={items}
        itemClass="w-[75vw] sm:w-[44vw] lg:w-[30vw]" renderItem={card} onViewAll={() => setAll(true)} />
      {all && (
        <ViewAllPanel title="Proyectos con Simplify" onClose={() => setAll(false)}>
          {items.map((c) => <div key={c.id}>{card(c)}</div>)}
        </ViewAllPanel>
      )}
      <CursorPill pos={pos} visible={visible} />
    </>
  );
}

// ── Independent Projects ──────────────────────────────────────────────────────

type IndependentCardProps = {
  bgColor: string;
  bgImage?: string;
  bgVideo?: string;
  title: string;
  subtitle: string;
  previewImage?: string;
};

function IndependentCard({ bgColor, bgImage, bgVideo, title, subtitle, previewImage, onHoverChange }: IndependentCardProps & { onHoverChange?: (v: boolean) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-full aspect-[3/4] flex flex-col items-center justify-between p-6 sm:p-10 text-white text-center relative overflow-hidden cursor-none"
      style={{ backgroundColor: bgColor }}
      onMouseEnter={() => { setHovered(true); onHoverChange?.(true); }}
      onMouseLeave={() => { setHovered(false); onHoverChange?.(false); }}
    >
      {/* Background image */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-[1200ms] ease-out ${hovered ? "scale-[1.04]" : "scale-100"}`}
        />
      )}

      {/* Background video */}
      {bgVideo && (
        <video
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-[1200ms] ease-out ${hovered ? "scale-[1.04]" : "scale-100"}`}
        />
      )}

      {/* Dark overlay */}
      {(bgImage || bgVideo) && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      )}

      {/* Text */}
      <p className="relative z-10 font-['Outfit',sans-serif] font-medium text-[22px] sm:text-[26px] lg:text-[30px] leading-[1.2] tracking-[-0.3px] w-full">
        {title}
      </p>
      <p className="relative z-10 font-['Outfit',sans-serif] font-normal text-[12px] sm:text-[13px] uppercase opacity-90 w-full">
        {subtitle}
      </p>

      {/* Hover preview — centered, with margins, floats over bgImage */}
      {previewImage && (
        <div
          className={`absolute inset-14 sm:inset-16 z-20 transition-opacity duration-400 ease-out ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={previewImage}
            alt="Preview del proyecto"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

function IndependentProjects({ items, onOpen }: { items: Project[]; onOpen: (item: DrawerItem) => void }) {
  const { pos, visible, setVisible } = useGlobalCursor();
  const [all, setAll] = useState(false);
  if (!items.length) return null;
  const card = (p: Project) => (
    <div onClick={() => onOpen({ type: "project", data: p })}>
      <IndependentCard bgColor={p.cardColor} bgImage={p.cardImage} bgVideo={p.cardVideo} title={p.title}
        subtitle={p.category ?? ""} previewImage={p.previewImage} onHoverChange={setVisible} />
    </div>
  );
  return (
    <>
      <Slider title=" PROYECTOS independientes" items={items}
        itemClass="w-[75vw] sm:w-[44vw] lg:w-[23vw]" renderItem={card} onViewAll={() => setAll(true)} />
      {all && (
        <ViewAllPanel title="Proyectos independientes" onClose={() => setAll(false)}>
          {items.map((p) => <div key={p.id}>{card(p)}</div>)}
        </ViewAllPanel>
      )}
      <CursorPill pos={pos} visible={visible} />
    </>
  );
}

// ── Experience ────────────────────────────────────────────────────────────────

function SubItem({ label, description }: { label: string; description: string }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const active = hovered || expanded;

  return (
    <div
      className={`relative flex flex-col w-full border-b border-[#e5e5e5] transition-colors duration-300 ${active ? "bg-[#212121]" : "bg-transparent"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((p) => !p)}
    >
      {/* Label row */}
      <div className="flex items-center justify-between px-4 py-4 cursor-pointer select-none">
        <p className={`font-['Outfit',sans-serif] font-normal text-[16px] sm:text-[18px] leading-[1.6] shrink-0 transition-colors duration-300 ${active ? "text-white" : "text-[#212121]"}`}>
          {label}
        </p>
        {/* Mobile chevron */}
        <span className={`sm:hidden text-[18px] leading-none transition-all duration-300 ${active ? "text-white rotate-45" : "text-[#212121] rotate-0"}`}>
          +
        </span>
        {/* Desktop description — inline right */}
        <p className={`hidden sm:block font-['Outfit',sans-serif] font-normal text-[14px] leading-[1.6] w-[400px] transition-all duration-300 overflow-hidden ${
          hovered ? "text-white opacity-100 max-h-24" : "opacity-0 max-h-0"
        }`}>
          {description}
        </p>
      </div>

      {/* Mobile description — expands below */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-40 pb-4" : "max-h-0"}`}>
        <p className="font-['Outfit',sans-serif] font-normal text-white text-[14px] leading-[1.6] px-4">
          {description}
        </p>
      </div>
    </div>
  );
}

type CategoryItem = { label: string; description: string };

function CategorySection({ title, items }: { title: string; items: CategoryItem[] }) {
  return (
    <div className="flex flex-col gap-4 pb-12">
      <p className="font-['Outfit',sans-serif] font-normal text-[#212121] text-[32px] sm:text-[44px] leading-[1.2]">
        {title}
      </p>
      <div className="flex flex-col w-full">
        {items.map((item, i) => (
          <SubItem key={i} label={item.label} description={item.description} />
        ))}
      </div>
    </div>
  );
}

function ExperienceSection() {
  return (
    <section className="bg-[#fdfbf4] w-full px-5 py-16 sm:px-9 sm:py-20">
      {/* Big headline */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16">
        <p
          className="font-['Outfit',sans-serif] font-medium text-[#212121] leading-[0.85]"
          style={{ fontSize: "clamp(80px, 18vw, 220px)" }}
        >
          UX/UI
        </p>
        <p className="font-['Outfit',sans-serif] font-normal text-[#212121] text-[14px] leading-[1.6] sm:w-[310px] sm:text-right">
          Equilibrando necesidades del negocio, insights del usuario y diseño orientado a datos.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        <div className="flex-1 min-w-0">
          <CategorySection
            title="Estrategia"
            items={[
              { label: "Auditorías de Sitios Web", description: "Revisión integral del sitio (navegación, velocidad, contenido y checkout) para detectar qué está frenando las ventas y priorizar mejoras con impacto real." },
              { label: "Optimización de Conversión (CRO)", description: "Análisis de embudos de conversión e identificación de fricciones que impiden al usuario completar la compra con éxito." },
              { label: "Estrategia de Contenido", description: "Definición de jerarquías de información y mensajes clave que refuercen el valor de la marca en cada punto del journey." },
              { label: "Roadmapping & Priorización", description: "Organización de iniciativas de diseño según impacto en negocio y esfuerzo técnico, alineando equipos de producto." },
            ]}
          />
          <CategorySection
            title="Experiencia UX"
            items={[
              { label: "Investigación de Usuarios", description: "Entrevistas, encuestas y pruebas de usabilidad para comprender motivaciones, frustraciones y comportamientos reales del comprador." },
              { label: "Auditorías de Usabilidad", description: "Evaluación heurística basada en estándares de Baymard para detectar fricciones críticas en el flujo de compra existente." },
              { label: "Benchmarking Competitivo", description: "Análisis comparativo de referentes del sector para identificar oportunidades de diferenciación y buenas prácticas aplicables." },
              { label: "Arquitectura de Información (IA)", description: "Organización lógica de categorías, filtros y navegación para que el usuario encuentre lo que busca sin esfuerzo cognitivo." },
              { label: "Flujos de Usuario", description: "Mapeo de los caminos críticos desde el descubrimiento hasta el checkout, optimizando cada punto de decisión del journey." },
            ]}
          />
          <CategorySection
            title="Diseño UI"
            items={[
              { label: "Sistemas de Diseño", description: "Construcción de librerías de componentes reutilizables y documentadas que garantizan coherencia visual en todo el producto." },
              { label: "Design Tokens", description: "Definición de variables de color, tipografía y espaciado que conectan el diseño en Figma con la implementación en código." },
              { label: "Responsive Design", description: "Adaptación de interfaces a múltiples breakpoints asegurando una experiencia óptima en escritorio, tablet y móvil." },
              { label: "Mobile-First", description: "Diseño que parte desde la pantalla más pequeña, priorizando jerarquía, gestos e interacciones táctiles desde el inicio." },
              { label: "Diseño de E-commerce", description: "Aplicación de principios de CRO y psicología de compra para crear páginas de producto y checkout que convierten." },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

// ── Blog ──────────────────────────────────────────────────────────────────────

type ArticleProps = {
  img: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
};

function ArticleCard({ img, category, date, title, excerpt, onHoverChange }: ArticleProps & { onHoverChange?: (v: boolean) => void }) {
  return (
    <div
      className="flex flex-col gap-6 w-full cursor-none"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <div className="w-full h-[200px] sm:h-[240px] lg:h-[260px] relative overflow-hidden">
        <img alt={title} className="absolute inset-0 w-full h-full object-cover" src={img} />
      </div>
      <div className="flex flex-col gap-3 font-['Outfit',sans-serif] font-normal text-[#212121]">
        <div className="flex gap-2 items-center text-[12px]">
          <span>{category}</span>
          <span className="opacity-30">·</span>
          <span className="opacity-60">{date}</span>
        </div>
        <p className="text-[16px] sm:text-[18px] leading-[1.6]">{title}</p>
        <p className="text-[14px] leading-[1.6] opacity-70">{excerpt}</p>
      </div>
    </div>
  );
}

function BlogSection({ items, onOpen }: { items: Article[]; onOpen: (item: DrawerItem) => void }) {
  const { pos, visible, setVisible } = useGlobalCursor();
  const [all, setAll] = useState(false);
  if (!items.length) return null;
  const card = (a: Article) => (
    <div onClick={() => onOpen({ type: "article", data: a })}>
      <ArticleCard img={a.coverImage ?? ""} category={a.category ?? ""} date={a.date ?? ""}
        title={a.title} excerpt={a.excerpt ?? ""} onHoverChange={setVisible} />
    </div>
  );
  return (
    <div className="w-full pb-8 sm:pb-16">
      <Slider id="blog" title="Blog · Insights" items={items}
        itemClass="w-[80vw] sm:w-[44vw] lg:w-[31vw]" renderItem={card} onViewAll={() => setAll(true)} />
      {all && (
        <ViewAllPanel title="Blog · Insights" onClose={() => setAll(false)}>
          {items.map((a) => <div key={a.id}>{card(a)}</div>)}
        </ViewAllPanel>
      )}
      <CursorPill pos={pos} visible={visible} />
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#93a3d8] w-full min-h-[500px] sm:min-h-[700px] flex flex-col justify-between pt-16 sm:pt-24 px-5 sm:px-9 overflow-hidden">
      {/* Top area */}
      <div className="flex flex-col gap-10 sm:gap-0 sm:flex-row sm:items-start sm:justify-between font-['Outfit',sans-serif] font-normal text-[#212121]">
        {/* Left: CTA + copyright */}
        <div className="flex flex-col gap-10 sm:w-[480px]">
          <div className="flex flex-col gap-6">
            <p className="text-[32px] sm:text-[44px] leading-[1.2]">
              Hablemos de tu próximo proyecto.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:yaleikaacevedo@gmail.com"
                className="text-[18px] sm:text-[24px] leading-normal hover:opacity-70 transition-opacity"
              >
                yaleikaacevedo@gmail.com
              </a>
              <a
                href="https://calendar.app.google/2bA5FduLar58SQ4E7"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 self-start text-[16px] sm:text-[18px] border-b border-[#212121] pb-1 hover:opacity-70 transition-opacity"
              >
                Agenda una llamada
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
                  <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
          <p className="text-[14px]">© 2026 Yaleika Acevedo</p>
        </div>

        {/* Navigation + Social */}
        <div className="flex gap-10 sm:gap-20 text-[12px]">
          {/* Nav */}
          <div className="flex flex-col gap-5">
            <p>[NAVEGACIÓN]</p>
            <div className="flex flex-col gap-2">
              {["SOBRE MÍ", "PROYECTOS", "BLOG"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s/g, "").replace("í", "i")}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-5">
            <p>[CONECTAR]</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "SIMPLIFY;", href: "https://simplify.agency/" },
                { label: "WORKANA", href: "https://www.workana.com/es" },
                { label: "BEHANCE", href: "https://www.behance.net/yaleikaacevedo" },
                { label: "INSTAGRAM", href: "https://www.instagram.com/ayaleika" },
                { label: "LINKEDIN", href: "https://pa.linkedin.com/in/yaleika-acevedo" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Big brand name — ocupa todo el ancho, pegado abajo, sin cortes */}
      <div className="-mx-5 sm:-mx-9 pt-10">
        <div role="img" aria-label="Yaleika" className="text-[#212121] [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: logoFooterSvg }} />
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);
  const openDrawer = useCallback((item: DrawerItem) => setDrawerItem(item), []);
  const closeDrawer = useCallback(() => setDrawerItem(null), []);
  const { simplify, independent, articles } = usePortfolioContent();

  return (
    <div className="relative flex flex-col items-start w-full min-h-screen bg-white">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProjectsCarousel items={simplify} onOpen={openDrawer} />
      <IndependentProjects items={independent} onOpen={openDrawer} />
      <ExperienceSection />
      <BlogSection items={articles} onOpen={openDrawer} />
      <Footer />
      {drawerItem && <DrawerPanel item={drawerItem} onClose={closeDrawer} />}
    </div>
  );
}
