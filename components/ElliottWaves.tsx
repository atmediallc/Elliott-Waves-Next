"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Chart from "./Chart";

// ── Particle Background ──────────────────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const COUNT = 80;
    const MAX_DIST = 150;
    const SPEED = 0.6;

    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 2 + 1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      // Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(97,95,240,${0.18 * (1 - dist / MAX_DIST)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(101,99,240,0.35)";
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();

    const onResize = () => { init(); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

const MF = "'Manrope', -apple-system, sans-serif";

// Wave colors matching TraderSync's palette
const WAVE_COLORS = {
  1: "#6563F0",
  2: "#E73D8A",
  3: "#6563F0",
  4: "#E73D8A",
  5: "#8483F2",
  A: "#E73D8A",
  B: "#6563F0",
  C: "#E73D8A",
};

const WAVE_TYPES_RULES = [
  "Motrices: Impulsos que contemplan las 5 ondas de Elliott completas con conteos internos.",
  "Impulsivas: Movimientos impulsivos que NO contienen 5 ondas internamente.",
  "Un impulso de Elliott siempre se divide en 5 ondas.",
];

const WAVES = [
  {
    num: "1",
    label: "Onda 1",
    tag: "IMPULSO",
    desc: "El primer movimiento en la dirección principal. A menudo el más difícil de identificar en tiempo real. Puede ser impulsiva o motriz.",
    color: WAVE_COLORS[1],
    rules: [
      "Puede ser impulsiva o motriz.",
      "Si es impulsiva → no se puede medir internamente.",
      "Si es motriz → debe medirse por sus conteos internos como si fuera un movimiento independiente.",
    ],
    detail: "Impulso inicial",
  },
  {
    num: "2",
    label: "Onda 2",
    tag: "CORRECCIÓN",
    desc: "Siempre es correctiva. Puede retroceder casi todo el movimiento previo pero jamás rompe el origen de Onda 1.",
    color: WAVE_COLORS[2],
    rules: [
      "Siempre es correctiva.",
      "Puede retroceder como máximo hasta el inicio de Onda 1.",
      "Nunca puede romper el origen de Onda 1.",
    ],
    detail: "Corrección profunda",
  },
  {
    num: "3",
    label: "Onda 3",
    tag: "IMPULSO",
    desc: "Siempre será una onda MOTRIZ. Nunca puede ser más pequeña que Onda 1. La más larga y poderosa del ciclo.",
    color: WAVE_COLORS[3],
    rules: [
      "Siempre será una onda MOTRIZ.",
      "Nunca puede ser más pequeña que Onda 1.",
      "Mínimo de impulso: 130% del tamaño de Onda 1.",
      "Si se extiende, puede llegar a: 161.8% · 261.8% · 361.8% · 461.8% de Fibonacci.",
    ],
    detail: "El mayor impulso",
  },
  {
    num: "4",
    label: "Onda 4",
    tag: "CORRECCIÓN",
    desc: "Siempre es correctiva. La forma más precisa de predecir su fin es hacer los conteos internos.",
    color: WAVE_COLORS[4],
    rules: [
      "Siempre es correctiva.",
      "Puede retroceder: 38.2% · 50% · 61.8%.",
      "Puede invadir el espacio de Onda 1, pero NO puede terminar por debajo del techo de Onda 1.",
      "La forma más precisa de predecir su fin es hacer los conteos internos.",
    ],
    detail: "Corrección lateral",
  },
  {
    num: "5",
    label: "Onda 5",
    tag: "IMPULSO",
    desc: "El impulso final del ciclo. Puede ser impulsiva o motriz. Señala el agotamiento del movimiento.",
    color: WAVE_COLORS[5],
    rules: [
      "Puede ser impulsiva o motriz.",
      "Si es impulsiva → mínimo mismo tamaño que Onda 1 · punto medio puede llegar al mismo precio que Onda 3.",
      "Si es motriz → debe medirse internamente con conteo de 5 ondas para predecir su fin.",
    ],
    detail: "Impulso final",
  },
];

const CORRECTIVE_WAVES = [
  {
    num: "A",
    label: "Onda A",
    tag: "CORRECTIVA",
    desc: "Primera onda del ciclo correctivo. Inicia el movimiento contrario a la tendencia principal. Puede confundirse con una corrección menor dentro de la tendencia alcista.",
    color: WAVE_COLORS.A,
    detail: "Inicio correctivo",
  },
  {
    num: "B",
    label: "Onda B",
    tag: "CORRECTIVA",
    desc: "Retroceso dentro de la corrección. Frecuentemente crea la ilusión de que la tendencia principal continúa. Alta probabilidad de fallo y trampa alcista.",
    color: WAVE_COLORS.B,
    detail: "Trampa alcista",
  },
  {
    num: "C",
    label: "Onda C",
    tag: "CORRECTIVA",
    desc: "La onda final del ciclo correctivo. Suele igualar o superar en longitud a la Onda A. Señala el final de la corrección y el posible inicio de un nuevo ciclo impulsivo.",
    color: WAVE_COLORS.C,
    detail: "Fin del ciclo",
  },
];

const FIBONACCI_LEVELS = [
  { level: "23.6%", use: "Retrocesos menores", color: "#6563F0" },
  { level: "38.2%", use: "Onda 4 típica", color: "#6563F0" },
  { level: "50.0%", use: "Nivel psicológico", color: "#8483F2" },
  { level: "61.8%", use: "Retroceso áureo", color: "#E73D8A" },
  { level: "78.6%", use: "Onda 2 profunda", color: "#E73D8A" },
  { level: "100%", use: "Extensión completa", color: "#CACACA" },
  { level: "161.8%", use: "Onda 3 típica", color: "#E73D8A" },
  { level: "261.8%", use: "Onda 3 extendida", color: "#E73D8A" },
];

// NavBar
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    fontFamily: MF,
    transition: "all 0.3s ease",
    backgroundColor: scrolled ? "rgba(0,0,0,0.95)" : "transparent",
    backdropFilter: scrolled ? "blur(20px)" : "none",
    borderBottom: scrolled ? "1px solid #1F1F1F" : "1px solid transparent",
  };

  return (
    <nav style={navStyle}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #6563F0, #E73D8A)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 18 L7 10 L11 14 L16 5 L21 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>
            Elliott<span style={{ color: "#6563F0" }}>Waves</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Ondas Impulsivas", "Ondas Correctivas", "Fibonacci", "Gráfico"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{
                color: "#CACACA",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 400,
                fontFamily: MF,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={e => (e.currentTarget.style.color = "#CACACA")}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#gráfico"
          style={{
            background: "#6563F0",
            color: "#FFFFFF",
            fontFamily: MF,
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 20px",
            borderRadius: 12,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#8483F2")}
          onMouseLeave={e => (e.currentTarget.style.background = "#6563F0")}
        >
          Ver Gráfico Live →
        </a>
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <section style={{
      position: "relative",
      minHeight: "auto",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      background: "#000000",
    }}>
      {/* Background gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(101,99,240,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(101, 99, 240, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(101, 99, 240, 0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "120px 40px 80px",
        width: "100%",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{ maxWidth: 680 }}>
          {/* Tag */}
          <div
            className={visible ? "animate-fade-up" : ""}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(231, 61, 138, 0.12)",
              border: "1px solid rgba(231, 61, 138, 0.2)",
              borderRadius: 100,
              padding: "6px 14px",
              marginBottom: 24,
              opacity: 0,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E73D8A", display: "block" }} />
            <span style={{ color: "#E73D8A", fontSize: 12, fontWeight: 700, fontFamily: MF, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Teoría de Análisis Técnico
            </span>
          </div>

          {/* Headline */}
          <h1
            className={visible ? "animate-fade-up delay-100" : ""}
            style={{
              fontFamily: MF,
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              lineHeight: "1.1",
              letterSpacing: "-2px",
              color: "#FFFFFF",
              marginBottom: 20,
              opacity: 0,
            }}
          >
            No Es Solo un Patrón.
            <br />
            <span style={{ color: "#6563F0" }}>Es el Mercado</span>
            <br />
            Hablando.
          </h1>

          {/* Subtitle */}
          <p
            className={visible ? "animate-fade-up delay-200" : ""}
            style={{
              fontFamily: MF,
              fontSize: 18,
              fontWeight: 400,
              color: "#CACACA",
              lineHeight: "28px",
              marginBottom: 36,
              maxWidth: 540,
              opacity: 0,
            }}
          >
            Domina la Teoría de las Ondas de Elliott. Comprende el comportamiento colectivo del mercado y anticipa sus movimientos antes de que ocurran.
          </p>

          {/* CTAs */}
          <div
            className={visible ? "animate-fade-up delay-300" : ""}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0 }}
          >
            <a
              href="#ondas-impulsivas"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#6563F0",
                color: "#FFFFFF",
                fontFamily: MF,
                fontSize: 16,
                fontWeight: 600,
                padding: "16px 24px",
                borderRadius: 16,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#8483F2")}
              onMouseLeave={e => (e.currentTarget.style.background = "#6563F0")}
            >
              Explorar las Ondas
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.293 4.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L16.586 13H5a1 1 0 010-2h11.586l-5.293-5.293a1 1 0 010-1.414z" fill="white"/>
              </svg>
            </a>
            <a
              href="#gráfico"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: "#6563F0",
                fontFamily: MF,
                fontSize: 16,
                fontWeight: 600,
                padding: "16px 24px",
                borderRadius: 16,
                border: "1px solid #1F1F1F",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#6563F0";
                e.currentTarget.style.color = "#8483F2";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#1F1F1F";
                e.currentTarget.style.color = "#6563F0";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"/>
              </svg>
              Ver Gráfico Live
            </a>
          </div>


        </div>
      </div>
    </section>
  );
}

// Datos combinados para el diagrama interactivo
const ALL_WAVES = [...WAVES, ...CORRECTIVE_WAVES];

// Wave SVG Diagram — interactivo
function WaveDiagram() {
  const [selected, setSelected] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const handleClick = (label: string) => {
    if (selected === label) {
      setSelected(null);
    } else {
      setSelected(label);
      setAnimKey(k => k + 1);
    }
  };

  const activeWave = ALL_WAVES.find(w => w.num === selected) ?? null;
  const isImpulse = activeWave?.tag === "IMPULSO";

  // Puntos clickeables: [x_label, y_label, nombre, color, hitbox_cx, hitbox_cy]
  const waveHits = [
    { n: "1", lx: 85,  ly: 80,  cx: 85,  cy: 95,  color: "#6563F0" },
    { n: "2", lx: 112, ly: 140, cx: 130, cy: 125, color: "#E73D8A" },
    { n: "3", lx: 225, ly: 7,   cx: 225, cy: 18,  color: "#6563F0" },
    { n: "4", lx: 254, ly: 90,  cx: 275, cy: 75,  color: "#E73D8A" },
    { n: "5", lx: 390, ly: -1,  cx: 390, cy: 10,  color: "#8483F2" },
    { n: "A", lx: 445, ly: 72,  cx: 440, cy: 55,  color: "#E73D8A" },
    { n: "B", lx: 470, ly: 22,  cx: 470, cy: 35,  color: "#6563F0" },
    { n: "C", lx: 510, ly: 38,  cx: 510, cy: 50,  color: "#E73D8A" },
  ];

  return (
    <div style={{
      background: "#090909",
      border: "1px solid #1F1F1F",
      borderRadius: 20,
      padding: "32px 24px 24px",
      marginBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontFamily: MF, fontSize: 12, color: "#8D8D8D", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
          Ciclo Completo de Elliott — 8 Ondas
        </div>
        <div style={{ fontFamily: MF, fontSize: 12, color: "#6563F0", fontWeight: 500 }}>
          Haz clic en una onda para ver su detalle
        </div>
      </div>

      {/* SVG */}
      <svg viewBox="0 0 560 210" fill="none" style={{ width: "100%", maxHeight: 210 }}>
        {/* Baseline */}
        <line x1="20" y1="165" x2="540" y2="165" stroke="#1F1F1F" strokeWidth="1"/>

        {/* Wave path dashed */}
        <polyline
          points="20,155 85,95 130,125 225,18 275,75 390,10 440,55 470,35 510,50"
          stroke="#1F1F1F" strokeWidth="1.5" fill="none" strokeDasharray="4 4"
        />

        {/* Segmentos coloreados — se iluminan al seleccionar */}
        {[
          { points: "20,155 85,95",   n: "1", stroke: "#6563F0", w: 2.5 },
          { points: "85,95 130,125",  n: "2", stroke: "#E73D8A", w: 2 },
          { points: "130,125 225,18", n: "3", stroke: "#6563F0", w: 2.5 },
          { points: "225,18 275,75",  n: "4", stroke: "#E73D8A", w: 2 },
          { points: "275,75 390,10",  n: "5", stroke: "#8483F2", w: 2.5 },
          { points: "390,10 440,55",  n: "A", stroke: "#E73D8A", w: 2 },
          { points: "440,55 470,35",  n: "B", stroke: "#6563F0", w: 2 },
          { points: "470,35 510,50",  n: "C", stroke: "#E73D8A", w: 2 },
        ].map(seg => (
          <polyline
            key={seg.n}
            points={seg.points}
            stroke={seg.stroke}
            strokeWidth={selected === seg.n ? seg.w + 2 : selected ? 1 : seg.w}
            strokeLinecap="round"
            opacity={selected && selected !== seg.n ? 0.2 : 1}
            style={{ transition: "all 0.25s ease" }}
          />
        ))}

        {/* Dots en cada punto */}
        {[
          { cx: 20,  cy: 155 },
          { cx: 85,  cy: 95  },
          { cx: 130, cy: 125 },
          { cx: 225, cy: 18  },
          { cx: 275, cy: 75  },
          { cx: 390, cy: 10  },
          { cx: 440, cy: 55  },
          { cx: 470, cy: 35  },
          { cx: 510, cy: 50  },
        ].map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="4" fill="#090909"
            stroke={[1,3,5].includes(i) ? "#6563F0" : [7].includes(i) ? "#6563F0" : "#E73D8A"}
            strokeWidth="2"
          />
        ))}

        {/* Etiquetas + zona clickeable */}
        {waveHits.map(w => (
          <g
            key={w.n}
            onClick={() => handleClick(w.n)}
            style={{ cursor: "pointer" }}
          >
            {/* Círculo hit invisible grande */}
            <circle cx={w.cx} cy={w.cy} r="16" fill="transparent" />
            {/* Fondo resaltado si está seleccionado */}
            {selected === w.n && (
              <circle cx={w.lx} cy={w.ly - 5} r="11" fill={w.color + "25"} stroke={w.color + "60"} strokeWidth="1" />
            )}
            {/* Texto del número */}
            <text
              x={w.lx} y={w.ly}
              fill={selected === w.n ? w.color : selected ? w.color + "55" : w.color}
              fontSize={selected === w.n ? "15" : "13"}
              fontWeight="800"
              fontFamily="Manrope, sans-serif"
              textAnchor="middle"
              style={{ transition: "all 0.2s ease", userSelect: "none" }}
            >
              {w.n}
            </text>
          </g>
        ))}

        {/* Zone labels */}
        <text x="220" y="185" fill="#6563F0" fontSize="10" fontWeight="600" fontFamily="Manrope" textAnchor="middle" opacity="0.7">IMPULSO (5 ondas)</text>
        <text x="475" y="185" fill="#E73D8A" fontSize="10" fontWeight="600" fontFamily="Manrope" textAnchor="middle" opacity="0.7">CORRECCIÓN (3 ondas)</text>
        <line x1="385" y1="175" x2="385" y2="165" stroke="#1F1F1F" strokeWidth="1.5"/>
      </svg>

      {/* Panel de detalle animado */}
      {activeWave && (
        <div
          key={animKey}
          className="animate-fade-up"
          style={{
            marginTop: 20,
            borderTop: `1px solid ${activeWave.color}30`,
            paddingTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {/* Izquierda: info principal */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: activeWave.color + "15",
                border: `1px solid ${activeWave.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: MF, fontSize: 20, fontWeight: 800, color: activeWave.color,
              }}>
                {activeWave.num}
              </div>
              <div>
                <div style={{ fontFamily: MF, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
                  {activeWave.label}
                </div>
                <div style={{ fontFamily: MF, fontSize: 11, color: "#8D8D8D", marginTop: 2 }}>
                  {activeWave.detail}
                </div>
              </div>
              <span style={{
                marginLeft: "auto",
                fontSize: 10, fontWeight: 700, fontFamily: MF,
                letterSpacing: "1.5px", textTransform: "uppercase",
                padding: "4px 10px", borderRadius: 6,
                color: isImpulse ? "#6563F0" : "#E73D8A",
                background: isImpulse ? "rgba(101,99,240,0.12)" : "rgba(231,61,138,0.12)",
              }}>
                {activeWave.tag}
              </span>
            </div>
            <p style={{ fontFamily: MF, fontSize: 14, color: "#CACACA", lineHeight: "22px", fontWeight: 400 }}>
              {activeWave.desc}
            </p>
          </div>

          {/* Derecha: reglas (solo ondas impulsivas tienen rules) */}
          <div>
            {"rules" in activeWave && (activeWave as typeof WAVES[0]).rules.length > 0 && (
              <>
                <div style={{ fontFamily: MF, fontSize: 11, fontWeight: 700, color: "#8D8D8D", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
                  Reglas clave
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(activeWave as typeof WAVES[0]).rules.map((rule, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: activeWave.color, marginTop: 7, flexShrink: 0,
                      }} />
                      <span style={{ fontFamily: MF, fontSize: 13, color: "#8D8D8D", lineHeight: "20px" }}>
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hint cuando no hay nada seleccionado */}
      {!activeWave && (
        <div style={{
          marginTop: 16,
          textAlign: "center",
          fontFamily: MF, fontSize: 12, color: "#4B4B4B",
        }}>
          ↑ Toca cualquier número en el gráfico
        </div>
      )}
    </div>
  );
}

// Wave Card
function WaveCard({ wave, index }: { wave: typeof WAVES[0]; index: number }) {
  const [hover, setHover] = useState(false);
  const isImpulse = wave.tag === "IMPULSO";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`animate-fade-up delay-${(index + 1) * 100}`}
      style={{
        background: hover ? "#0C0C0C" : "#090909",
        border: `1px solid ${hover ? wave.color + "40" : "#1F1F1F"}`,
        borderRadius: 20,
        padding: 28,
        transition: "all 0.3s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      {hover && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${wave.color}60, transparent)`,
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: wave.color + "15",
            border: `1px solid ${wave.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MF,
            fontSize: 20,
            fontWeight: 800,
            color: wave.color,
          }}>
            {wave.num}
          </div>
          <div>
            <div style={{ fontFamily: MF, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>{wave.label}</div>
            <div style={{ fontFamily: MF, fontSize: 11, color: "#8D8D8D", marginTop: 1 }}>{wave.detail}</div>
          </div>
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: MF,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: 6,
          color: isImpulse ? "#6563F0" : "#E73D8A",
          background: isImpulse ? "rgba(101,99,240,0.12)" : "rgba(231,61,138,0.12)",
        }}>
          {wave.tag}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: MF,
        fontSize: 14,
        color: "#CACACA",
        lineHeight: "22px",
        marginBottom: 20,
        fontWeight: 400,
      }}>
        {wave.desc}
      </p>

      {/* Rules */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {wave.rules.map((rule, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 6, height: 6,
              borderRadius: "50%",
              background: wave.color,
              marginTop: 7,
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: MF, fontSize: 13, color: "#8D8D8D", lineHeight: "20px" }}>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Corrective Wave Card (simpler)
function CorrectiveCard({ wave, index }: { wave: typeof CORRECTIVE_WAVES[0]; index: number }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`animate-fade-up delay-${(index + 1) * 100}`}
      style={{
        background: hover ? "#0C0C0C" : "#090909",
        border: `1px solid ${hover ? wave.color + "40" : "#1F1F1F"}`,
        borderRadius: 20,
        padding: 28,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hover && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${wave.color}60, transparent)`,
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: wave.color + "15",
          border: `1px solid ${wave.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: MF, fontSize: 20, fontWeight: 800, color: wave.color,
        }}>
          {wave.num}
        </div>
        <div>
          <div style={{ fontFamily: MF, fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>{wave.label}</div>
          <div style={{ fontFamily: MF, fontSize: 11, color: "#8D8D8D", marginTop: 1 }}>{wave.detail}</div>
        </div>
      </div>

      <p style={{ fontFamily: MF, fontSize: 14, color: "#CACACA", lineHeight: "22px", fontWeight: 400 }}>
        {wave.desc}
      </p>
    </div>
  );
}

// Fibonacci Section
function FibonacciSection() {
  return (
    <section id="fibonacci" style={{ padding: "100px 40px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ fontFamily: MF, fontSize: 12, fontWeight: 700, color: "#6563F0", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
          Fibonacci
        </div>
        <h2 style={{ fontFamily: MF, fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-1px", maxWidth: 600 }}>
          Los Números que Gobiernan el Mercado
        </h2>
        <p style={{ fontFamily: MF, fontSize: 16, color: "#CACACA", maxWidth: 540, marginTop: 16, lineHeight: "26px" }}>
          Fibonacci no es magia — es la geometría natural del comportamiento humano colectivo, proyectada en los precios.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {FIBONACCI_LEVELS.map((fib, i) => (
          <div
            key={fib.level}
            className={`animate-fade-up delay-${Math.min((i + 1) * 100, 600)}`}
            style={{
              background: "#090909",
              border: "1px solid #1F1F1F",
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = fib.color + "50")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#1F1F1F")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 4,
                height: 40,
                borderRadius: 2,
                background: fib.color,
                opacity: fib.level === "61.8%" ? 1 : 0.6,
              }} />
              <div>
                <div style={{ fontFamily: MF, fontSize: 22, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                  {fib.level}
                </div>
                <div style={{ fontFamily: MF, fontSize: 13, color: "#8D8D8D", marginTop: 2 }}>
                  {fib.use}
                </div>
              </div>
            </div>
            {fib.level === "61.8%" && (
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: MF, letterSpacing: "1px",
                textTransform: "uppercase", padding: "4px 10px", borderRadius: 6,
                color: "#E73D8A", background: "rgba(231,61,138,0.12)",
              }}>CLAVE</span>
            )}
          </div>
        ))}
      </div>

      {/* Fibonacci formula */}
      <div style={{
        marginTop: 40,
        background: "linear-gradient(135deg, rgba(101,99,240,0.06), rgba(231,61,138,0.06))",
        border: "1px solid #1F1F1F",
        borderRadius: 20,
        padding: "32px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 24,
      }}>
        <div>
          <div style={{ fontFamily: MF, fontSize: 13, color: "#8D8D8D", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
            La Ratio Áurea
          </div>
          <div style={{ fontFamily: MF, fontSize: 40, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-2px" }}>
            φ = 1.618033...
          </div>
          <div style={{ fontFamily: MF, fontSize: 14, color: "#CACACA", marginTop: 8 }}>
            La Onda 3 extiende típicamente el 161.8% de la Onda 1
          </div>
        </div>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 16,
          color: "#6563F0",
          background: "rgba(101,99,240,0.08)",
          border: "1px solid rgba(101,99,240,0.2)",
          borderRadius: 12,
          padding: "16px 24px",
          lineHeight: "28px",
        }}>
          <div style={{ color: "#8D8D8D", fontSize: 12, marginBottom: 4 }}>// Secuencia de Fibonacci</div>
          <div>0, 1, 1, 2, 3, 5, 8, 13, 21, 34...</div>
          <div style={{ color: "#E73D8A", marginTop: 4 }}>21 / 34 = <span style={{ color: "#FFFFFF" }}>0.618</span></div>
          <div style={{ color: "#E73D8A" }}>34 / 21 = <span style={{ color: "#FFFFFF" }}>1.618</span></div>
        </div>
      </div>
    </section>
  );
}

// Rules Section
function RulesSection() {
  return (
    <section style={{
      padding: "80px 40px",
      background: "#000000",
      borderTop: "1px solid #1F1F1F",
      borderBottom: "1px solid #1F1F1F",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MF, fontSize: 12, fontWeight: 700, color: "#E73D8A", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            Reglas
          </div>
          <h2 style={{ fontFamily: MF, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-1px" }}>
            Tipos de Ondas
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {WAVE_TYPES_RULES.map((rule, i) => (
            <div
              key={i}
              style={{
                background: "#090909",
                border: "1px solid #1F1F1F",
                borderRadius: 16,
                padding: "20px 28px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#6563F040")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1F1F1F")}
            >
              <div style={{
                minWidth: 32, height: 32,
                borderRadius: 8,
                background: "rgba(101,99,240,0.12)",
                border: "1px solid rgba(101,99,240,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: MF, fontSize: 14, fontWeight: 800, color: "#6563F0",
              }}>
                {i + 1}
              </div>
              <p style={{ fontFamily: MF, fontSize: 15, color: "#CACACA", lineHeight: "24px", fontWeight: 400, margin: 0, paddingTop: 4 }}>
                {rule}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section style={{
      padding: "80px 40px",
      background: "#000000",
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        background: "linear-gradient(135deg, #0C0C1F 0%, #090909 100%)",
        border: "1px solid #1F1F1F",
        borderRadius: 24,
        padding: "60px 60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40,
        flexWrap: "wrap",
        backgroundImage: "linear-gradient(135deg, rgba(101,99,240,0.08), rgba(231,61,138,0.04)), url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      }}>
        <div>
          <div style={{ fontFamily: MF, fontSize: 12, fontWeight: 700, color: "#E73D8A", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            Análisis en Tiempo Real
          </div>
          <h2 style={{ fontFamily: MF, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-1px", maxWidth: 500 }}>
            Practica lo Aprendido con Datos Reales de BTC
          </h2>
          <p style={{ fontFamily: MF, fontSize: 16, color: "#CACACA", marginTop: 12, maxWidth: 480 }}>
            El gráfico de Bitcoin en tiempo real desde Binance te da el laboratorio perfecto para aplicar la teoría de Elliott.
          </p>
        </div>
        <a
          href="#gráfico"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#6563F0",
            color: "#FFFFFF",
            fontFamily: MF,
            fontSize: 16,
            fontWeight: 600,
            padding: "18px 28px",
            borderRadius: 16,
            textDecoration: "none",
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#8483F2")}
          onMouseLeave={e => (e.currentTarget.style.background = "#6563F0")}
        >
          Ver Gráfico de BTC
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.293 4.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L16.586 13H5a1 1 0 010-2h11.586l-5.293-5.293a1 1 0 010-1.414z" fill="white"/>
          </svg>
        </a>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #1F1F1F",
      padding: "40px",
      background: "#000000",
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            background: "linear-gradient(135deg, #6563F0, #E73D8A)",
            borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 18 L7 10 L11 14 L16 5 L21 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 14, fontFamily: MF }}>
            Elliott<span style={{ color: "#6563F0" }}>Waves</span>
          </span>
        </div>
        <p style={{ fontFamily: MF, fontSize: 13, color: "#8D8D8D" }}>
          © 2026 TraderAdd — Guía educativa de análisis técnico
        </p>
        <p style={{ fontFamily: MF, fontSize: 12, color: "#4B4B4B", maxWidth: 400, textAlign: "right" }}>
          El trading conlleva riesgos significativos. Esta guía es únicamente educativa y no constituye asesoramiento financiero.
        </p>
      </div>
    </footer>
  );
}

// ===== MAIN COMPONENT =====
export default function ElliottWaves() {
  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>

      {/* Top section with particles — NavBar + Diagram + Hero */}
      <div style={{ position: "relative", overflow: "hidden", background: "#000000" }}>
        <ParticleBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <NavBar />

          {/* Diagrama interactivo — LO PRIMERO */}
          <section style={{ padding: "100px 40px 40px", maxWidth: 1400, margin: "0 auto" }}>
            <WaveDiagram />
          </section>

          <HeroSection />
        </div>
      </div>

      {/* Impulse Waves */}
      <section id="ondas-impulsivas" style={{ padding: "60px 40px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MF, fontSize: 12, fontWeight: 700, color: "#6563F0", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            Fase Impulsiva
          </div>
          <h2 style={{ fontFamily: MF, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-1px" }}>
            Las 5 Ondas Impulsivas
          </h2>
          <p style={{ fontFamily: MF, fontSize: 16, color: "#CACACA", maxWidth: 540, marginTop: 12, lineHeight: "26px" }}>
            Forman el movimiento en la dirección de la tendencia principal. Compuestas de 5 sub-ondas con patrones identificables.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {WAVES.map((wave, i) => (
            <WaveCard key={wave.num} wave={wave} index={i} />
          ))}
        </div>
      </section>

      <RulesSection />

      {/* Corrective Waves */}
      <section id="ondas-correctivas" style={{ padding: "80px 40px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MF, fontSize: 12, fontWeight: 700, color: "#E73D8A", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            Fase Correctiva
          </div>
          <h2 style={{ fontFamily: MF, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-1px" }}>
            Las 3 Ondas Correctivas A-B-C
          </h2>
          <p style={{ fontFamily: MF, fontSize: 16, color: "#CACACA", maxWidth: 540, marginTop: 12, lineHeight: "26px" }}>
            Contrarrestan el movimiento impulsivo. Más complejas y difíciles de predecir que las ondas impulsivas.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {CORRECTIVE_WAVES.map((wave, i) => (
            <CorrectiveCard key={wave.num} wave={wave} index={i} />
          ))}
        </div>
      </section>

      <FibonacciSection />
      <CTASection />

      {/* Chart Section */}
      <section id="gráfico" style={{
        padding: "80px 40px",
        background: "#000000",
        borderTop: "1px solid #1F1F1F",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6563F0", animation: "pulse-glow 2s ease-in-out infinite" }} />
              <div style={{ fontFamily: MF, fontSize: 12, fontWeight: 700, color: "#6563F0", letterSpacing: "2px", textTransform: "uppercase" }}>
                En Vivo — Binance
              </div>
            </div>
            <h2 style={{ fontFamily: MF, fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-1px" }}>
              BTC/USDT — Velas de 4h
            </h2>
            <p style={{ fontFamily: MF, fontSize: 16, color: "#CACACA", marginTop: 12, lineHeight: "26px" }}>
              Datos en tiempo real de Binance. Practica identificar las ondas de Elliott en el precio del Bitcoin.
            </p>
          </div>
          <Chart />
        </div>
      </section>

      <Footer />
    </div>
  );
}
