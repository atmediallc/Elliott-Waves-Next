import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ondas de Elliott — Guía Interactiva de Análisis Técnico",
  description: "Aprende la Teoría de las Ondas de Elliott con gráficos en tiempo real. Guía interactiva completa para traders de stocks, forex, futuros y crypto.",
  keywords: "ondas de elliott, análisis técnico, trading, forex, crypto, bitcoin, BTC",
  authors: [{ name: "TraderAdd" }],
  openGraph: {
    title: "Ondas de Elliott — Guía Interactiva",
    description: "Guía definitiva sobre la Teoría de las Ondas de Elliott con gráficos en tiempo real de BTC/USDT",
    url: "https://eliott-waves.traderadd.com",
    siteName: "Elliott Waves — TraderAdd",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ondas de Elliott — Guía Interactiva",
    description: "Teoría de las Ondas de Elliott con gráficos en tiempo real",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
