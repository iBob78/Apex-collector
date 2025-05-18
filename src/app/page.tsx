"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CounterButton from "../components/CounterButton";
import LazyImage from "../components/LazyImage";
import AccessibilityCheck from "../components/AccessibilityCheck";
import AxeClient from "../components/AxeClient";

// Définir des métadonnées (optionnel, mais recommande d'ajouter un <title> via <Head> ou dans metadata)
export const metadata = {
  title: "Apex Collector - Accueil",
};

const Page = () => {
  return (
    <div lang="fr">
      <Header />
      {/* On peut garder AxeClient et AccessibilityCheck ici puisqu'ils retournent null */}
      <AxeClient />
      <AccessibilityCheck />
      <main style={{ padding: "20px" }}>
        <CounterButton />
        <LazyImage />
        <p>Ceci est le contenu principal.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
