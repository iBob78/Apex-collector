import { ReactNode } from "react";
import Link from "next/link";
import Menu from "@/app/components/Menu";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr">
            <head>
                <title>Apex Collector</title>
                <meta name="description" content="Le jeu de cartes ultime sur l'univers automobile !" />
            </head>
            <body className="bg-gray-900 text-white flex">
                {/* Menu latéral */}
                <Menu />

                <div className="flex flex-col flex-1">
                    {/* Barre de navigation */}
                    <header className="bg-gray-800 text-white p-4 flex justify-between">
                        <h1 className="text-xl font-bold">Apex Collector</h1>
                        <nav>
                            <ul className="flex gap-4">
                                <li><Link href="/" className="hover:underline">Accueil</Link></li>
                                <li><Link href="/cards" className="hover:underline">Cartes</Link></li>
                            </ul>
                        </nav>
                    </header>

                    {/* Contenu de la page */}
                    <main className="p-4">{children}</main>
                </div>
            </body>
        </html>
    );
}
