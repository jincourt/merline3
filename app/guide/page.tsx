import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgentGuide } from "@/components/guide/AgentGuide";

export const metadata: Metadata = {
  title: "Guide de l'agent — Merline",
  description:
    "Formation complète pour les agents Merline : comprendre les commissions du catalogue, trouver ses premiers clients, et acquérir des acheteurs via les sites de revente suisses, les réseaux sociaux, le téléphone et la publicité.",
};

export default function GuidePage() {
  return (
    <>
      <Header indigo />
      <main>
        <AgentGuide />
      </main>
      <Footer indigo />
    </>
  );
}
