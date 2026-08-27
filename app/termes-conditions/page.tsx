import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Termes & Conditions — Merline",
  description:
    "Conditions générales d'utilisation de la plateforme Merline pour annonceurs et agents.",
};

const UPDATED_AT = "27 août 2026";

export default function TermesConditionsPage() {
  return (
    <LegalPageShell title="Termes & Conditions de Merline" updatedAt={UPDATED_AT}>
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions générales (« Termes ») régissent l&apos;accès et
          l&apos;utilisation de la plateforme Merline, accessible via merline.app et ses
          services associés. Merline met en relation des personnes souhaitant vendre un
          objet ou un service (« Annonceurs ») et des personnes susceptibles d&apos;apporter
          un acheteur ou un client (« Agents »), moyennant une commission convenue.
        </p>
        <p>
          En créant un compte ou en utilisant Merline, tu acceptes sans réserve les
          présents Termes. Si tu n&apos;acceptes pas ces conditions, tu ne dois pas
          utiliser la plateforme.
        </p>
      </section>

      <section>
        <h2>2. Définitions</h2>
        <ul>
          <li>
            <strong>Plateforme</strong> : le site, l&apos;application et les services
            opérés sous la marque Merline.
          </li>
          <li>
            <strong>Utilisateur</strong> : toute personne disposant d&apos;un compte
            Merline.
          </li>
          <li>
            <strong>Annonce</strong> : toute offre publiée sur Merline (objet ou
            service) avec indication d&apos;une commission.
          </li>
          <li>
            <strong>Commission</strong> : rémunération promise par l&apos;Annonceur à
            l&apos;Agent en cas de vente ou de conclusion d&apos;affaire apportée.
          </li>
          <li>
            <strong>Contenu</strong> : textes, images, descriptions, messages et toute
            information publiée par un Utilisateur.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Inscription et compte</h2>
        <p>
          Pour utiliser Merline, tu dois fournir des informations exactes, complètes et
          à jour lors de ton inscription. Tu es responsable de la confidentialité de tes
          identifiants et de toute activité réalisée depuis ton compte.
        </p>
        <p>
          Merline se réserve le droit de suspendre ou supprimer un compte en cas de
          violation des présents Termes, de comportement frauduleux, trompeur ou
          préjudiciable à d&apos;autres Utilisateurs ou à la plateforme.
        </p>
      </section>

      <section>
        <h2>4. Rôle de Merline</h2>
        <p>
          Merline agit comme intermédiaire technique de mise en relation. Merline
          n&apos;est pas partie aux transactions conclues entre Annonceurs, Agents et
          tiers, sauf mention expresse contraire.
        </p>
        <p>
          Merline ne garantit ni la conclusion d&apos;une vente, ni le paiement d&apos;une
          commission, ni la qualité, la légalité ou la disponibilité des biens et
          services proposés dans les annonces.
        </p>
      </section>

      <section>
        <h2>5. Annonces et commissions</h2>
        <p>
          L&apos;Annonceur est seul responsable du contenu de ses annonces, du respect
          des lois applicables (notamment en matière de vente, de consommation, de
          propriété et de fiscalité) et de l&apos;exactitude des informations publiées,
          y compris le montant ou le taux de commission proposé.
        </p>
        <p>
          L&apos;Agent s&apos;engage à prospecter de bonne foi et à respecter les
          instructions de l&apos;Annonceur lorsqu&apos;elles sont communiquées via la
          plateforme ou par message. Les modalités de versement de la commission sont
          convenues directement entre les parties, sauf fonctionnalité de paiement
          proposée ultérieurement par Merline.
        </p>
      </section>

      <section>
        <h2>6. Obligations des Utilisateurs</h2>
        <p>Tu t&apos;engages notamment à :</p>
        <ul>
          <li>ne pas publier de contenu illicite, trompeur, diffamatoire ou offensant ;</li>
          <li>ne pas usurper l&apos;identité d&apos;un tiers ;</li>
          <li>ne pas contourner la plateforme pour éviter une commission due ;</li>
          <li>ne pas utiliser Merline à des fins de spam, d&apos;harcelement ou de fraude ;</li>
          <li>respecter la vie privée et les données personnelles des autres Utilisateurs.</li>
        </ul>
      </section>

      <section>
        <h2>7. Propriété intellectuelle</h2>
        <p>
          La marque Merline, le design, le code, les textes institutionnels et les
          éléments graphiques de la plateforme sont protégés. Tu conserves tes droits sur
          le Contenu que tu publies, tout en accordant à Merline une licence non exclusive
          permettant d&apos;héberger, afficher et diffuser ce Contenu dans le cadre du
          service.
        </p>
      </section>

      <section>
        <h2>8. Limitation de responsabilité</h2>
        <p>
          Dans les limites autorisées par la loi, Merline ne pourra être tenue
          responsable des dommages indirects, pertes de profit, litiges entre Utilisateurs
          ou préjudices résultant d&apos;une annonce, d&apos;une négociation ou d&apos;une
          transaction.
        </p>
        <p>
          La plateforme est fournie « en l&apos;état ». Merline s&apos;efforce d&apos;assurer
          sa disponibilité et sa sécurité, sans garantie d&apos;accès ininterrompu.
        </p>
      </section>

      <section>
        <h2>9. Résiliation</h2>
        <p>
          Tu peux cesser d&apos;utiliser Merline à tout moment et demander la suppression
          de ton compte. Merline peut modifier, suspendre ou interrompre tout ou partie
          du service, sous réserve d&apos;un préavis raisonnable lorsque cela est
          possible.
        </p>
      </section>

      <section>
        <h2>10. Modifications</h2>
        <p>
          Merline peut mettre à jour les présents Termes. En cas de modification
          substantielle, les Utilisateurs seront informés. La poursuite de l&apos;utilisation
          de la plateforme après entrée en vigueur des nouvelles conditions vaut
          acceptation, sauf disposition légale contraire.
        </p>
      </section>

      <section>
        <h2>11. Droit applicable</h2>
        <p>
          Les présents Termes sont soumis au droit suisse. Tout litige relatif à leur
          interprétation ou exécution relève, à défaut d&apos;accord amiable, de la
          compétence des tribunaux du domicile du défendeur en Suisse, sous réserve de
          dispositions impératives applicables.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Pour toute question relative aux présents Termes :{" "}
          <a href="mailto:contact@merline.app">contact@merline.app</a>
        </p>
      </section>
    </LegalPageShell>
  );
}
