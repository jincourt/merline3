import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Merline",
  description:
    "Comment Merline collecte, utilise et protège tes données personnelles.",
};

const UPDATED_AT = "27 août 2026";

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageShell title="Politique de confidentialité" updatedAt={UPDATED_AT}>
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Merline (« nous ») est responsable du traitement des données personnelles
          collectées via la plateforme merline.app. Pour toute question relative à la
          protection des données :{" "}
          <a href="mailto:privacy@merline.app">privacy@merline.app</a>
        </p>
      </section>

      <section>
        <h2>2. Données que nous collectons</h2>
        <p>Selon ton utilisation de Merline, nous pouvons traiter :</p>
        <ul>
          <li>
            <strong>Données de compte</strong> : adresse email, nom d&apos;utilisateur,
            identifiants de connexion, date d&apos;inscription.
          </li>
          <li>
            <strong>Données de profil</strong> : numéro de téléphone si tu le renseignes,
            préférences et paramètres.
          </li>
          <li>
            <strong>Données liées aux annonces</strong> : descriptions, photos, lieu,
            commissions, statuts.
          </li>
          <li>
            <strong>Données de communication</strong> : messages échangés via la
            plateforme.
          </li>
          <li>
            <strong>Données techniques</strong> : adresse IP, type de navigateur, logs
            de connexion, cookies strictement nécessaires au fonctionnement du service.
          </li>
          <li>
            <strong>Données de paiement</strong> : si tu utilises un service payant,
            certaines informations sont traitées par notre prestataire de paiement (ex.
            Stripe) ; Merline ne conserve pas l&apos;intégralité de tes données bancaires.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Finalités du traitement</h2>
        <p>Nous utilisons tes données pour :</p>
        <ul>
          <li>créer et gérer ton compte utilisateur ;</li>
          <li>permettre la publication d&apos;annonces et la mise en relation ;</li>
          <li>faciliter la messagerie entre Utilisateurs ;</li>
          <li>assurer la sécurité, prévenir la fraude et faire respecter nos conditions ;</li>
          <li>améliorer le service et répondre à tes demandes de support ;</li>
          <li>respecter nos obligations légales.</li>
        </ul>
      </section>

      <section>
        <h2>4. Bases légales</h2>
        <p>
          Le traitement repose principalement sur l&apos;exécution du contrat liant
          l&apos;Utilisateur à Merline, ton consentement lorsque requis (ex. acceptation
          des conditions, certaines communications), nos intérêts légitimes (sécurité,
          amélioration du service) et, le cas échéant, des obligations légales.
        </p>
      </section>

      <section>
        <h2>5. Partage des données</h2>
        <p>
          Nous ne vendons pas tes données personnelles. Elles peuvent être partagées
          avec :
        </p>
        <ul>
          <li>
            nos sous-traitants techniques (hébergement, authentification, envoi
            d&apos;emails, paiement) strictement dans la mesure nécessaire ;
          </li>
          <li>
            d&apos;autres Utilisateurs, lorsque tu publies une annonce ou échanges des
            messages ;
          </li>
          <li>
            les autorités compétentes si la loi l&apos;exige ou pour défendre nos droits.
          </li>
        </ul>
        <p>
          Certains prestataires peuvent être situés en dehors de la Suisse ou de
          l&apos;Espace économique européen. Dans ce cas, nous veillons à mettre en
          place des garanties appropriées.
        </p>
      </section>

      <section>
        <h2>6. Durée de conservation</h2>
        <p>
          Nous conservons tes données aussi longtemps que ton compte est actif, puis
          pendant une durée limitée conformément à nos obligations légales, à la
          prescription des actions ou à nos intérêts légitimes (ex. preuve de
          consentement, gestion de litiges).
        </p>
      </section>

      <section>
        <h2>7. Tes droits</h2>
        <p>
          Selon la législation applicable (notamment la loi suisse sur la protection des
          données et, le cas échéant, le RGPD), tu peux demander :
        </p>
        <ul>
          <li>l&apos;accès à tes données ;</li>
          <li>la rectification de données inexactes ;</li>
          <li>l&apos;effacement, dans les limites prévues par la loi ;</li>
          <li>la limitation ou l&apos;opposition à certains traitements ;</li>
          <li>la portabilité de tes données lorsque applicable.</li>
        </ul>
        <p>
          Tu peux retirer ton consentement à tout moment pour les traitements qui en
          dépendent, sans affecter la licéité des traitements antérieurs.
        </p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          Merline utilise des cookies et technologies similaires nécessaires au
          fonctionnement du site (session, authentification, sécurité). Nous n&apos;utilisons
          pas de cookies publicitaires tiers sans ton consentement préalable.
        </p>
      </section>

      <section>
        <h2>9. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables
          pour protéger tes données contre la perte, l&apos;accès non autorisé ou la
          divulgation. Aucune transmission sur Internet n&apos;est toutefois totalement
          sécurisée.
        </p>
      </section>

      <section>
        <h2>10. Modifications</h2>
        <p>
          Cette politique peut être mise à jour. La date de dernière mise à jour figure
          en haut de la page. Nous t&apos;encourageons à la consulter régulièrement.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Pour exercer tes droits ou poser une question :{" "}
          <a href="mailto:privacy@merline.app">privacy@merline.app</a>
        </p>
      </section>
    </LegalPageShell>
  );
}
