const faqSections = [
  {
    title: "Forfaits",
    items: [
      {
        question: "Puis-je publier sans abonnement ?",
        answer:
          "Oui. La formule Publication vous permet de mettre en ligne une annonce pour CHF 19.-, sans engagement mensuel. L'abonnement est recommandé si vous publiez régulièrement.",
      },
      {
        question: "Que comprend l'abonnement Merline Pro ?",
        answer:
          "L'abonnement inclut des annonces illimitées, une mise en avant dans le catalogue et une priorité auprès des agents. Vous payez CHF 69.- par mois, sans frais cachés.",
      },
      {
        question: "Comment fonctionne la commission ?",
        answer:
          "Vous fixez librement la commission versée à l'agent qui apporte l'acheteur. Merline ne prélève pas cette commission : elle est convenue directement entre vous et l'agent.",
      },
    ],
  },
  {
    title: "Publicité",
    items: [
      {
        question: "Qu'est-ce que le boost x100 ?",
        answer:
          "Le boost multiplie la visibilité de votre annonce sur l'application Merline et la place en tête du catalogue pendant la durée choisie (7, 14 ou 30 jours).",
      },
      {
        question: "Puis-je ajouter un boost à une annonce existante ?",
        answer:
          "Oui. Depuis votre tableau de bord, sélectionnez l'annonce à promouvoir et choisissez la durée de boost qui correspond à votre objectif de vente.",
      },
    ],
  },
  {
    title: "Facturation",
    items: [
      {
        question: "Comment annuler mon abonnement ?",
        answer:
          "Vous pouvez annuler à tout moment depuis votre espace personnel. L'abonnement reste actif jusqu'à la fin de la période en cours, sans renouvellement automatique après résiliation.",
      },
      {
        question: "Les prix incluent-ils la TVA ?",
        answer:
          "Les tarifs affichés sont en francs suisses (CHF). La TVA applicable, le cas échéant, est indiquée lors du paiement.",
      },
    ],
  },
] as const;

export function PricingFaq() {
  return (
    <section className="tarifs-faq" aria-labelledby="tarifs-faq-title">
      <h2 id="tarifs-faq-title" className="tarifs-faq-title">
        Questions fréquentes
      </h2>

      <div className="tarifs-faq-sections">
        {faqSections.map((section) => (
          <div key={section.title} className="tarifs-faq-group">
            <h3 className="tarifs-faq-group-title">{section.title}</h3>

            <div className="tarifs-faq-list">
              {section.items.map((item) => (
                <details key={item.question} className="tarifs-faq-item">
                  <summary className="tarifs-faq-question">{item.question}</summary>
                  <p className="tarifs-faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
