import { ReactNode } from "react";
import "../style/globals.css";  // ✅ Importe Tailwind et les styles globaux
import Menu from "../components/Menu";  // ✅ Menu est un composant séparé

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <title>Apex Collector</title>
        <meta name="description" content="Le jeu de cartes ultime pour les passionnés d'automobile !" />
      </head>
      <body className="bg-black text-white h-full flex flex-col">
        <Menu /> {/* ✅ Le menu sera affiché sur toutes les pages */}
        <main className="p-4 flex-grow">{children}</main> {/* ✅ flex-grow pour remplir l'espace */}
      </body>
    </html>
  );
}
