import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Artelia Mix — Nuancier & Recettes de Peinture Intelligents",
  description: "Enregistrez, organisez et reproduisez vos mélanges de couleurs avec précision. L'assistant d'atelier conçu pour les artistes peintres.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#252525] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
