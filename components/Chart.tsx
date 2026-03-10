"use client";

import { useEffect, useState } from "react";

const CANDLE_WIDTH = 8;
const CANDLE_GAP = 3;
const CHART_HEIGHT = 200;
const PADDING = { top: 20, bottom: 20, left: 10, right: 10 };

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Tooltip = Candle & { x: number };

function normalize(value: number, min: number, max: number, height: number): number {
  return height - PADDING.bottom - ((value - min) / (max - min)) * (height - PADDING.top - PADDING.bottom);
}

function formatPrice(p: number): string {
  return p >= 1000 ? `$${(p / 1000).toFixed(1)}k` : `$${p.toFixed(0)}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:00`;
}

export default function Chart() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=60")
      .then((r) => r.json())
      .then((data) => {
        const parsed: Candle[] = data.map((d: string[]) => ({
          time: Number(d[0]),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        setCandles(parsed);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el precio. Intenta de nuevo.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <p className="text-center text-[#4A4D58] py-8 text-sm tracking-widest">
      CARGANDO BTC/USDT...
    </p>
  );

  if (error) return (
    <p className="text-center text-[#E07B54] py-4 text-sm">{error}</p>
  );

  const allHighs = candles.map((c) => c.high);
  const allLows = candles.map((c) => c.low);
  const minPrice = Math.min(...allLows);
  const maxPrice = Math.max(...allHighs);
  const lastCandle = candles[candles.length - 1];
  const totalWidth = candles.length * (CANDLE_WIDTH + CANDLE_GAP) + PADDING.left + PADDING.right;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between text-[0.65rem] tracking-wide mb-2 px-1">
        <span className="text-[#4A4D58]">BTC/USDT · 4H · 60 velas</span>
        <span style={{ color: lastCandle?.close >= lastCandle?.open ? "#4CAF80" : "#E07B54" }}>
          {formatPrice(lastCandle?.close)}
        </span>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg">
        <svg
          width={totalWidth}
          height={CHART_HEIGHT}
          style={{ display: "block", background: "#0D0F14" }}
        >
          {[0.25, 0.5, 0.75].map((pct) => {
            const y = PADDING.top + pct * (CHART_HEIGHT - PADDING.top - PADDING.bottom);
            const price = maxPrice - pct * (maxPrice - minPrice);
            return (
              <g key={pct}>
                <line x1={0} y1={y} x2={totalWidth} y2={y} stroke="#1E2130" strokeWidth="1" />
                <text x={PADDING.left + 4} y={y - 3} fill="#2A2D38" fontSize="9" fontFamily="monospace">
                  {formatPrice(price)}
                </text>
              </g>
            );
          })}

          {candles.map((c, i) => {
            const x = PADDING.left + i * (CANDLE_WIDTH + CANDLE_GAP);
            const cx = x + CANDLE_WIDTH / 2;
            const isGreen = c.close >= c.open;
            const color = isGreen ? "#4CAF80" : "#E07B54";

            const yHigh = normalize(c.high, minPrice, maxPrice, CHART_HEIGHT);
            const yLow = normalize(c.low, minPrice, maxPrice, CHART_HEIGHT);
            const yOpen = normalize(c.open, minPrice, maxPrice, CHART_HEIGHT);
            const yClose = normalize(c.close, minPrice, maxPrice, CHART_HEIGHT);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);

            return (
              <g
                key={c.time}
                className="cursor-crosshair"
                onMouseEnter={() => setTooltip({ ...c, x: cx })}
                onMouseLeave={() => setTooltip(null)}
              >
                <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={color} strokeWidth="1" />
                <rect
                  x={x} y={bodyTop}
                  width={CANDLE_WIDTH} height={bodyHeight}
                  fill={color} opacity={0.9} rx={1}
                />
              </g>
            );
          })}

          {tooltip && (() => {
            const tipX = tooltip.x > totalWidth - 120 ? tooltip.x - 130 : tooltip.x + 10;
            return (
              <g>
                <line x1={tooltip.x} y1={0} x2={tooltip.x} y2={CHART_HEIGHT} stroke="#2A2D38" strokeWidth="1" strokeDasharray="3 2" />
                <rect x={tipX} y={10} width={120} height={72} fill="#13161E" stroke="#2A2D38" strokeWidth="1" rx={4} />
                <text x={tipX + 8} y={26} fill="#6A6D78" fontSize="9" fontFamily="monospace">{formatDate(tooltip.time)}</text>
                <text x={tipX + 8} y={40} fill="#4CAF80" fontSize="9" fontFamily="monospace">H: {formatPrice(tooltip.high)}</text>
                <text x={tipX + 8} y={52} fill="#E07B54" fontSize="9" fontFamily="monospace">L: {formatPrice(tooltip.low)}</text>
                <text x={tipX + 8} y={64} fill="#C8C4BA" fontSize="9" fontFamily="monospace">O: {formatPrice(tooltip.open)}</text>
                <text x={tipX + 8} y={76} fill="#C8C4BA" fontSize="9" fontFamily="monospace">C: {formatPrice(tooltip.close)}</text>
              </g>
            );
          })()}
        </svg>
      </div>

      <p className="text-center text-[0.65rem] text-[#2A2D38] tracking-widest mt-2">
        DATOS EN TIEMPO REAL · BINANCE · DESLIZA PARA VER MÁS
      </p>
    </div>
  );
}