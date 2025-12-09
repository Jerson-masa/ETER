import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata = {
  title: "ETER | Guía Esotérica IA",
  description: "Descubre tu destino con la inteligencia artificial espiritual.",
  manifest: "/manifest.json",
  themeColor: "#050505",
};

import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
