import AccessibilityCheck from "../components/AccessibilityCheck";
"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CounterButton from "../components/CounterButton";
import LazyImage from "../components/LazyImage";
import AxeClient from "../components/AxeClient";

const Page = () => {
  return (
    <div lang="fr">
      <header>
        <Header />
      </header>
      <main style={{ padding: "20px" }}>
        <AxeClient />
        <AccessibilityCheck />
        <CounterButton />
        <LazyImage />
        <p>Ceci est le contenu principal.</p>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Page;
