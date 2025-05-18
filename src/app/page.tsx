"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CounterButton from "../components/CounterButton";
import LazyImage from "../components/LazyImage";
import AccessibilityCheck from "../components/AccessibilityCheck";
import AxeClient from "../components/AxeClient";

// Optionnel : bénficier du marquage sémantique en enveloppant l'ensemble dans une balise <div> ou <main>
const Page = () => {
  return (
    <div lang="fr">
      {/* Assure-toi que Header rend un <header> */}
      <Header />
      {/* Le contenu principal est dans <main> */}
      <main style={{ padding: "20px" }}>
        {/* Appels aux composants d'accessibilité */}
        <AxeClient />
        <AccessibilityCheck />
        {/* Contenu principal */}
        <CounterButton />
        <LazyImage />
        <p>Ceci est le contenu principal.</p>
      </main>
      {/* Assure-toi que Footer rend un <footer> */}
      <Footer />
    </div>
  );
};

export default Page;
