# 📈 Elliott Waves — Guía Interactiva

> Guía interactiva de la Teoría de Ondas de Elliott con diagrama clickeable, gráfico en vivo de BTC/USDT y referencias completas de Fibonacci.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## ✨ Features

- **Diagrama interactivo** — Haz clic en cualquier onda del ciclo completo (1-2-3-4-5-A-B-C) para ver sus reglas y detalles
- **Gráfico BTC/USDT en vivo** — Datos de velas de 4h en tiempo real desde la API pública de Binance
- **Fondo de partículas animado** — Canvas puro sin dependencias externas
- **Reglas completas por onda** — Ondas motrices vs impulsivas, niveles de Fibonacci, retrocesos
- **Tabla de Fibonacci** — Los 8 niveles clave (23.6% → 261.8%) con la razón áurea φ = 1.618
- **Diseño dark mode** — Estilo inspirado en TraderSync con paleta púrpura/pink

---

## 🛠️ Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework principal, App Router |
| React | 19 | UI |
| TypeScript | 5 | Tipado |
| Tailwind CSS | v4 | Estilos (`@import "tailwindcss"`) |
| Lightweight Charts | — | Gráfico de velas candlestick |
| Binance API | pública | Datos BTC/USDT en tiempo real |

---

## 🚀 Instalación

```bash
# 1. Clonar el repo
git clone https://github.com/atmediallc/elliott-waves-next.git
cd elliott-waves-next

# 2. Instalar dependencias
npm install

# 3. Levantar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del proyecto

```
elliott-waves-next/
├── app/
│   ├── globals.css        # Tailwind v4 + fuente Manrope
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Entry point
├── components/
│   ├── ElliottWaves.tsx   # Componente principal (toda la UI)
│   └── Chart.tsx          # Gráfico de velas BTC/USDT
└── public/
```

---

## 🎨 Paleta de colores

| Nombre | Hex | Uso |
|---|---|---|
| Púrpura principal | `#6563F0` | Ondas 1, 3, B — acento |
| Pink | `#E73D8A` | Ondas 2, 4, A, C |
| Púrpura suave | `#8483F2` | Onda 5 — hover |
| Fondo | `#000000` | Background principal |
| Superficie | `#090909` | Cards |
| Borde | `#1F1F1F` | Bordes |

---

## 📊 Componentes principales

### `WaveDiagram`
Diagrama SVG interactivo del ciclo completo de 8 ondas. Al hacer clic en una onda se iluminan sus segmentos y aparece un panel de detalle con reglas y descripción.

### `ParticleBackground`
Canvas animado con partículas conectadas por líneas. Implementado en Canvas API puro sin librerías externas.

### `Chart`
Gráfico de velas usando Lightweight Charts. Consume la API pública de Binance (`/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=60`).

---

## 📐 Reglas de Elliott implementadas

**Ondas Impulsivas:**
- Onda 1 — Puede ser impulsiva o motriz
- Onda 2 — Siempre correctiva, nunca rompe el origen de Onda 1
- Onda 3 — Siempre motriz, mínimo 130% de Onda 1
- Onda 4 — Correctiva, retrocesos 38.2% · 50% · 61.8%
- Onda 5 — Puede ser impulsiva o motriz

**Ondas Correctivas:**
- Onda A, B, C — Contramovimiento al impulso principal

---

## 🔧 Configuración Tailwind v4

Este proyecto usa **Tailwind CSS v4** con la nueva sintaxis de importación:

```css
/* globals.css — el @import de Google Fonts DEBE ir primero */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

@theme {
  --color-purple: #6563F0;
  --color-pink: #E73D8A;
}
```

> ⚠️ No usar `tailwind.config.ts` — en v4 la configuración va dentro de `globals.css` con `@theme {}`

---

## 📦 Deploy en Vercel

```bash
# El proyecto se despliega automáticamente en Vercel
# al hacer push a la rama main

git add .
git commit -m "descripción del cambio"
git push
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/atmediallc/elliott-waves-next)

---

## 📄 Licencia

MIT © [AtMedia LLC](https://github.com/atmediallc)
