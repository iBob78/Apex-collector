import { ReactNode } from "react";
import Link from "next/link";
import Menu from "@/components/Menu";
import "./globals.css";

export const metadata = {
  title: 'Apex Collector',
  description: 'Jeu de cartes à collectionner automobile',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-100">
        <Menu />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
