import { useEffect, useState } from "react";
import { X } from "lucide-react";

// ── Abrir el brief desde cualquier botón del sitio ──────────────────────────
export const OPEN_BRIEF_EVENT = "open-brief";
export const openBrief = () => window.dispatchEvent(new Event(OPEN_BRIEF_EVENT));

// ── Opciones (edítalas aquí) ────────────────────────────────────────────────
const ETAPAS = ["Estoy empezando", "Ya vendo en línea", "Vendo B2B / mayoristas"];
const OBJETIVOS = [
  "Lanzar mi tienda online",
  "Vender más con la tienda que ya tengo",
  "Renovar la imagen de mi tienda",
  "Una página para una campaña o lanzamiento",
  "Mejorar la experiencia en móvil",
  "No lo tengo claro, necesito un diagnóstico",
];
const PRESUPUESTOS = ["$1.000 – $2.500", "$2.500 – $5.000", "$5.000 – $8.000", "Más de $8.000"];
const PLAZOS = ["Lo antes posible", "En 1–2 meses", "En 3 meses o más"];
const PLATAFORMAS = ["Shopify", "WooCommerce", "Otra", "Aún no tengo tienda"];

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

type Data = {
  nombre: string; email: string; whatsapp: string; marca: string; web: string; etapa: string;
  negocio: string; objetivos: string[];
  objetivo: string; presupuesto: string; plazo: string; plataforma: string; fuente: string;
};
const EMPTY: Data = {
  nombre: "", email: "", whatsapp: "", marca: "", web: "", etapa: "",
  negocio: "", objetivos: [],
  objetivo: "", presupuesto: "", plazo: "", plataforma: "", fuente: "",
};

const font = "font-['Outfit',sans-serif] text-[#212121]";

// ── Piezas de UI ────────────────────────────────────────────────────────────
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex flex-col gap-2 w-full">
      <span className="text-[13px] font-medium">{label}{required && <span className="opacity-40"> *</span>}</span>
      {children}
    </label>
  );
}
const inputCls =
  "w-full bg-[#f3f4f6] rounded-[8px] px-4 py-[14px] text-[14px] placeholder:text-[#8a8a8a] outline-none focus:ring-1 focus:ring-[#212121] transition";

function Chips({ label, options, value, onChange, multi, required }: {
  label: string; options: string[]; value: string | string[]; onChange: (v: any) => void; multi?: boolean; required?: boolean;
}) {
  const isOn = (o: string) => (multi ? (value as string[]).includes(o) : value === o);
  const toggle = (o: string) => {
    if (!multi) return onChange(o);
    const arr = value as string[];
    onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]);
  };
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-[13px] font-medium mb-3">{label}{required && <span className="opacity-40"> *</span>}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={isOn(o)}
            onClick={() => toggle(o)}
            className={`rounded-full border px-[18px] py-[10px] text-[14px] transition-colors ${
              isOn(o) ? "bg-[#212121] border-[#212121] text-white" : "border-[#cfcfcf] hover:border-[#212121]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Drawer ──────────────────────────────────────────────────────────────────
export function BriefDrawer() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1-3, 4 = enviado
  const [d, setD] = useState<Data>(EMPTY);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [botcheck, setBotcheck] = useState(false);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const onOpen = () => { setOpen(true); setError(""); if (step === 4) { setStep(1); setD(EMPTY); } };
    window.addEventListener(OPEN_BRIEF_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_BRIEF_EVENT, onOpen);
  }, [step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const validate = (): string => {
    if (step === 1) {
      if (!d.nombre.trim()) return "Escribe tu nombre.";
      if (!/^\S+@\S+\.\S+$/.test(d.email)) return "Revisa tu correo electrónico.";
      if (!d.marca.trim()) return "Cuéntame el nombre de tu marca.";
      if (!d.etapa) return "Elige en qué etapa está tu negocio.";
    }
    if (step === 2) {
      if (d.negocio.trim().length < 40) return "Cuéntame un poco más sobre tu negocio (al menos un par de frases).";
      if (d.objetivos.length === 0) return "Elige al menos una opción de lo que te gustaría lograr.";
    }
    if (step === 3) {
      if (!d.presupuesto) return "Elige un rango de presupuesto.";
      if (!d.plazo) return "Elige para cuándo lo necesitas.";
    }
    return "";
  };

  const next = async () => {
    const msg = validate();
    if (msg) return setError(msg);
    setError("");
    if (step < 3) return setStep(step + 1);

    // Enviar
    if (botcheck) return setStep(4);
    if (!WEB3FORMS_KEY) return setError("Falta configurar VITE_WEB3FORMS_KEY en Vercel.");
    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Nuevo brief: ${d.marca} (${d.presupuesto})`,
          from_name: "Portafolio Yaleika",
          replyto: d.email,
          "Nombre": d.nombre,
          "Correo": d.email,
          "WhatsApp": d.whatsapp,
          "Marca": d.marca,
          "Web / Instagram": d.web,
          "Etapa del negocio": d.etapa,
          "Sobre su negocio": d.negocio,
          "Qué quiere lograr": d.objetivos.join(", "),
          "Objetivo principal": d.objetivo,
          "Presupuesto": d.presupuesto,
          "Plazo": d.plazo,
          "Plataforma actual": d.plataforma,
          "Cómo me encontró": d.fuente,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setStep(4);
    } catch {
      setError("No se pudo enviar. Inténtalo de nuevo o escríbeme a yaleikaacevedo@gmail.com.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div
        className={`fixed z-50 bg-white ${font}
          bottom-0 left-0 right-0 h-[92%]
          md:bottom-auto md:top-0 md:left-auto md:right-0 md:h-full md:w-[600px]
          flex flex-col shadow-2xl animate-in duration-300 slide-in-from-bottom md:slide-in-from-right`}
        role="dialog"
        aria-modal="true"
        aria-label="Cuéntame de tu proyecto"
      >
        {/* Top */}
        <div className="flex flex-col gap-6 px-5 pt-6 md:px-12 md:pt-10">
          <div className="flex items-center justify-between">
            <span className="text-[12px] tracking-[0.48px]">{step < 4 ? `[ PASO ${step} DE 3 ]` : "[ BRIEF ENVIADO ]"}</span>
            <button onClick={() => setOpen(false)} aria-label="Cerrar"
              className="size-8 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:opacity-70 transition-opacity">
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          {step < 4 && (
            <div className="flex gap-[6px]" aria-hidden>
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors ${i <= step ? "bg-[#212121]" : "bg-[#e4e4e4]"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-8 md:px-12">
          {/* honeypot anti-spam */}
          <input type="checkbox" tabIndex={-1} autoComplete="off" className="hidden" checked={botcheck} onChange={(e) => setBotcheck(e.target.checked)} />

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <Head title="Cuéntame de tu proyecto." sub="Antes de agendar una llamada, me gusta conocer tu marca. Toma unos 3 minutos." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre" required><input className={inputCls} placeholder="Tu nombre" value={d.nombre} onChange={(e) => set("nombre", e.target.value)} /></Field>
                <Field label="Correo electrónico" required><input type="email" className={inputCls} placeholder="tu@email.com" value={d.email} onChange={(e) => set("email", e.target.value)} /></Field>
                <Field label="WhatsApp"><input type="tel" className={inputCls} placeholder="+507 6000 0000" value={d.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
                <Field label="Nombre de tu marca" required><input className={inputCls} placeholder="Ej. Casa Brisa" value={d.marca} onChange={(e) => set("marca", e.target.value)} /></Field>
              </div>
              <Field label="Web o Instagram de la marca"><input className={inputCls} placeholder="www.tumarca.com o @tumarca" value={d.web} onChange={(e) => set("web", e.target.value)} /></Field>
              <Chips label="¿En qué etapa está tu negocio?" required options={ETAPAS} value={d.etapa} onChange={(v) => set("etapa", v)} />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <Head title="Háblame de tu negocio." sub="Este es tu espacio. Mientras más me cuentes, mejor preparada llego a nuestra conversación." />
              <Field label="Cuéntame sobre tu negocio" required>
                <textarea rows={5} className={`${inputCls} resize-none`}
                  placeholder="Qué vendes, a quién le vendes, qué está funcionando y qué te gustaría que cambiara…"
                  value={d.negocio} onChange={(e) => set("negocio", e.target.value)} />
              </Field>
              <div className="flex flex-col gap-3">
                <Chips label="¿Qué te gustaría lograr?" required multi options={OBJETIVOS} value={d.objetivos} onChange={(v) => set("objetivos", v)} />
                <p className="text-[13px] text-[#737373]">Elige todo lo que aplique. Yo me encargo de traducirlo en estrategia, UX, UI e identidad visual.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <Head title="Último paso." sub="Con esto preparo la llamada para que sea útil desde el primer minuto." />
              <Field label="¿Cuál es el objetivo principal del proyecto?">
                <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Ej. quiero vender más desde el celular, lanzar mi marca…"
                  value={d.objetivo} onChange={(e) => set("objetivo", e.target.value)} />
              </Field>
              <div className="flex flex-col gap-3">
                <Chips label="Presupuesto estimado (USD)" required options={PRESUPUESTOS} value={d.presupuesto} onChange={(v) => set("presupuesto", v)} />
                <p className="text-[13px] text-[#737373]">Mis proyectos inician desde $1.000 USD.</p>
              </div>
              <Chips label="¿Para cuándo lo necesitas?" required options={PLAZOS} value={d.plazo} onChange={(v) => set("plazo", v)} />
              <Chips label="¿Qué plataforma usas hoy?" options={PLATAFORMAS} value={d.plataforma} onChange={(v) => set("plataforma", v)} />
              <Field label="¿Cómo me encontraste?"><input className={inputCls} placeholder="Instagram, Workana, recomendación…" value={d.fuente} onChange={(e) => set("fuente", e.target.value)} /></Field>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6 justify-center min-h-full">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
                <circle cx="32" cy="32" r="32" fill="#93A3D8" />
                <path d="M21 33l7 7 15-16" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Head title="Recibí tu brief, gracias." sub="Lo reviso con calma y te escribo en un máximo de 48 horas hábiles. Si tu proyecto encaja, te enviaré el enlace para agendar una llamada por Meet." />
              <a href="#proyectos" onClick={() => setOpen(false)} className="text-[14px] underline underline-offset-4 self-start hover:opacity-70">
                Mientras tanto, puedes ver mis proyectos →
              </a>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3 px-5 pb-6 pt-4 md:px-12 md:pb-10 border-t border-[#f0f0f0] md:border-0">
          {error && <p role="alert" className="text-[13px] text-[#b42318]">{error}</p>}
          <div className={`flex items-center ${step > 1 && step < 4 ? "justify-between" : "justify-end"}`}>
            {step > 1 && step < 4 && (
              <button type="button" onClick={() => { setError(""); setStep(step - 1); }} className="text-[14px] hover:opacity-60">← Atrás</button>
            )}
            <button
              type="button"
              disabled={sending}
              onClick={step === 4 ? () => setOpen(false) : next}
              className="inline-flex items-center gap-[10px] rounded-full bg-[#212121] text-white px-7 py-4 text-[13px] tracking-[0.52px] uppercase hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {step === 4 ? "Volver al portafolio" : step === 3 ? (sending ? "Enviando…" : "Enviar brief") : "Siguiente"}
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[32px] md:text-[40px] leading-[1.15]">{title}</p>
      <p className="text-[15px] leading-[1.5] text-[#555]">{sub}</p>
    </div>
  );
}
