"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CounterButton from "../components/CounterButton";
import LazyImage from "../components/LazyImage";
import AccessibilityCheck from "../components/AccessibilityCheck";
import AxeClient from "../components/AxeClient";

const Page = () => {
  return (
    <div lang="fr">
      {/* Encapsulation de l'en-tête dans un landmark */}
      <header>
        <Header />
      </header>
      
      {/* Contenu principal dans <main> */}
      <main style={{ padding: "20px" }}>
        <AxeClient />
        <AccessibilityCheck />
        <CounterButton />
        <LazyImage />
        <p>Ceci est le contenu principal.</p>
      </main>
      
      {/* Encapsulation du pied de page dans un landmark */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Page;
