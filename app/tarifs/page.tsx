import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TarifsPage } from "@/components/marketing/TarifsPage";

export const metadata: Metadata = {
  title: "Tarifs — Merline Pro",
  description:
    "Publication à 29 CHF.-, abonnement Merline Pro à 119 CHF/mois pour des annonces illimitées et des packs publicitaires boost x100.",
};

export default function TarifsRoute() {
  return (
    <>
      <Header indigo />
      <main>
        <TarifsPage />
      </main>
      <Footer indigo />
    </>
  );
}
