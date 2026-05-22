import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navigation/Navbar";
import { ReactNode } from 'react';

export const metadata = {
  title: 'Apex Collector',
  description: 'Collectionne tes cartes',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}