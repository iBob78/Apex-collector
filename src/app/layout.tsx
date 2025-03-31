import { ReactNode } from "react";
import Link from "next/link";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr" className="h-full">
            <body className="bg-black text-white min-h-screen">
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
                <main className="p-4">{children}</main>
            </body>
        </html>
    );
}
