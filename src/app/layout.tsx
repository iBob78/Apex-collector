import { ReactNode } from "react";
import Link from "next/link";
import Menu from "@/app/components/Menu";
import "@/app/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr">
            <body className="bg-gray-900 text-white">
                {/* Barre de navigation */}
                <header className="bg-gray-800 text-white p-4 flex justify-between">
                    <h1 className="text-xl font-bold">Apex Collector</h1>
                    <nav>
                        <ul className="flex gap-4">
                            <li>
                                <Link href="/" className="hover:underline">Accueil</Link>
                            </li>
                            <li>
                                <Link href="/cards" className="hover:underline">Cartes</Link>
                            </li>
                        </ul>
                    </nav>
                </header>

                {/* Menu latéral */}
                <Menu />

                {/* Contenu de la page */}
                <main className="p-4">{children}</main>
            </body>
        </html>
    );
}
