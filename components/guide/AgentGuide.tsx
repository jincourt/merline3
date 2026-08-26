import type { ReactNode } from "react";
import Link from "next/link";
import { MotionDiv } from "@/components/ui/motion";
import { GuideViewer } from "./GuideViewer";

const CHAPTERS = [
  { id: "role", label: "Le rôle d'agent" },
  { id: "commissions", label: "Les commissions" },
  { id: "choisir", label: "Choisir les annonces" },
  { id: "premiers-clients", label: "Premiers clients" },
  { id: "sites-revente", label: "Sites de revente" },
  { id: "reseaux", label: "Réseaux sociaux" },
  { id: "appels", label: "Appels téléphone" },
  { id: "pub", label: "Publicité payante" },
  { id: "autres", label: "Autres leviers" },
  { id: "conclure", label: "Conclure la vente" },
  { id: "routine", label: "Routine & erreurs" },
] as const;

export function AgentGuide() {
  const chapters = [
    { ...CHAPTERS[0], content: <RoleChapter /> },
    { ...CHAPTERS[1], content: <CommissionsChapter /> },
    { ...CHAPTERS[2], content: <ChooseChapter /> },
    { ...CHAPTERS[3], content: <FirstClientsChapter /> },
    { ...CHAPTERS[4], content: <ResaleSitesChapter /> },
    { ...CHAPTERS[5], content: <SocialChapter /> },
    { ...CHAPTERS[6], content: <CallsChapter /> },
    { ...CHAPTERS[7], content: <AdsChapter /> },
    { ...CHAPTERS[8], content: <OtherChannelsChapter /> },
    { ...CHAPTERS[9], content: <CloseChapter /> },
    {
      ...CHAPTERS[10],
      content: (
        <>
          <RoutineChapter />
          <div className="mt-10">
            <GuideCta />
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <section className="section-indigo w-full">
        <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-20 md:pb-16 md:pt-28">
          <MotionDiv className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">
              Formation agent
            </p>
            <h1 className="section-title mt-4 text-white">
              Comment gagner des commissions sur Merline
            </h1>
            <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-white/85 md:text-lg md:leading-relaxed">
              Un guide pratique : comprendre ce que vous touchez, puis trouver
              des acheteurs — sites de revente suisses, réseaux sociaux,
              téléphone et publicité.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/#catalogue" className="btn-vendre-submit">
                Voir le catalogue
              </Link>
              <a href="#guide-content" className="btn-on-indigo-ghost">
                Commencer la formation
              </a>
            </div>
          </MotionDiv>
        </div>
      </section>

      <GuideViewer chapters={chapters} />
    </>
  );
}

function Chapter({
  index,
  title,
  lead,
  children,
}: {
  index: number;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <article className="min-w-0 max-w-full">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--indigo)]">
        Chapitre {String(index).padStart(2, "0")}
      </p>
      <h2 className="mt-2 break-words text-xl font-medium tracking-tight text-[var(--foreground)] md:text-2xl">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
        {lead}
      </p>
      <div className="mt-8 min-w-0 max-w-full space-y-6 break-words text-sm leading-relaxed text-[var(--foreground)] md:text-[0.9375rem]">
        {children}
      </div>
    </article>
  );
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-medium tracking-tight text-[var(--foreground)]">
        {title}
      </h3>
      <div className="mt-2 space-y-3 text-[var(--muted)]">{children}</div>
    </div>
  );
}

function Callout({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <aside className="min-w-0 max-w-full rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 md:p-5">
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--indigo)]">
        {label}
      </p>
      <div className="mt-2 space-y-2 text-sm text-[var(--muted)]">{children}</div>
    </aside>
  );
}

function Script({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-w-0 max-w-full rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] p-4 md:p-5">
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted-dim)]">
        {title}
      </p>
      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-[var(--foreground)]">
        {text}
      </p>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item} className="flex min-w-0 gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--indigo-soft)] font-mono text-[10px] font-medium text-[var(--indigo)]">
            {index + 1}
          </span>
          <span className="min-w-0 break-words text-[var(--muted)]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function RoleChapter() {
  return (
    <Chapter
      index={1}
      title="Le rôle d'agent"
      lead="Vous n'achetez pas le produit. Vous amenez un acheteur à une annonce déjà publiée, et vous touchez la commission affichée."
    >
      <p className="text-[var(--muted)]">
        Merline relie trois personnes. L&apos;annonceur publie un objet ou un
        service et indique ce qu&apos;il est prêt à verser à celui qui lui
        trouve un client. L&apos;agent parcourt le catalogue, prospecte, et
        met les deux parties en contact. L&apos;acheteur paie l&apos;annonceur
        — pas vous.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "Annonceur",
            d: "Publie l'offre et fixe la commission, en francs ou en pourcentage.",
          },
          {
            t: "Agent",
            d: "Trouve un acheteur sérieux, le présente, suit jusqu'à la vente.",
          },
          {
            t: "Acheteur",
            d: "Paie l'annonceur. Vous n'encaissez jamais le prix de l'objet.",
          },
        ].map((card) => (
          <div
            key={card.t}
            className="rounded-md border border-[var(--border)] p-4"
          >
            <p className="text-sm font-medium text-[var(--foreground)]">
              {card.t}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.d}</p>
          </div>
        ))}
      </div>
      <Sub title="Le parcours type">
        <Steps
          items={[
            "Vous ouvrez le catalogue et choisissez 3 à 5 annonces dont la commission et la zone vous conviennent.",
            "Vous contactez l'annonceur sur Merline pour confirmer la dispo, le prix de vente, et le versement de la commission.",
            "Vous cherchez un acheteur (réseau, Tutti, groupes, appels, pub).",
            "Vous qualifiez l'acheteur : budget, délai, lieu, sérieux.",
            "Vous le présentez à l'annonceur dans la conversation Merline.",
            "La vente se fait. L'annonceur vous verse la commission convenue.",
          ]}
        />
      </Sub>
      <Callout label="Règle d'or">
        <p>
          Ne promettez un bien à un acheteur qu&apos;après avoir écrit à
          l&apos;annonceur. Une annonce peut être déjà engagée, vendue, ou
          réservée. Dix minutes de message évitent un rendez-vous inutile.
        </p>
      </Callout>
    </Chapter>
  );
}

function CommissionsChapter() {
  return (
    <Chapter
      index={2}
      title="Lire les commissions du catalogue"
      lead="Chaque carte du catalogue affiche un badge : soit un montant en CHF, soit un pourcentage. C'est votre rémunération si vous amenez la vente, pas le prix de l'objet."
    >
      <p className="text-[var(--muted)]">
        L&apos;annonceur choisit le type au moment de publier. Il n&apos;y a
        que deux formats. Le catalogue ne montre pas le prix de vente de
        l&apos;objet : seulement ce que vous gagnez. Pour un pourcentage, il
        faut donc connaître (ou demander) le prix auquel l&apos;annonceur
        vend.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] p-5">
          <span className="inline-flex rounded-sm bg-[var(--indigo)] px-3 py-1 text-xs font-semibold text-white">
            CHF 150.-
          </span>
          <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
            Commission fixe
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Vous touchez 150 francs, que l&apos;objet parte à 400 ou à 900 CHF.
            Idéal pour démarrer : le gain est lisible sans calcul, et vous
            n&apos;avez pas besoin du prix de vente pour décider si ça vaut
            votre temps.
          </p>
          <p className="mt-3 text-xs text-[var(--muted-dim)]">
            Ex. canapé Lausanne, vendu 650 CHF → vous : 150 CHF.
          </p>
        </div>
        <div className="rounded-md border border-[var(--border)] p-5">
          <span className="inline-flex rounded-sm bg-[var(--indigo)] px-3 py-1 text-xs font-semibold text-white">
            12%
          </span>
          <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
            Commission en pourcentage
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Votre gain = prix de vente × le %. Un vélo électrique à 2&apos;500
            CHF à 12% = 300 CHF. Plus le ticket monte, plus vous gagnez — à
            condition que le prix soit réel et que l&apos;acheteur suive.
          </p>
          <p className="mt-3 text-xs text-[var(--muted-dim)]">
            Ex. 8% sur un service à 1&apos;800 CHF → vous : 144 CHF.
          </p>
        </div>
      </div>

      <Sub title="Faire le calcul avant d'agir">
        <p>
          Pour du fixe : si le badge indique CHF 80.-, votre heure de travail
          doit rester rentable. Une commission de 40 CHF peut valoir le coup
          si l&apos;acheteur est déjà dans votre immeuble. Elle ne vaut
          presque jamais une campagne pub.
        </p>
        <p>
          Pour du % : messagez l&apos;annonceur. « Bonjour, je peux vous
          trouver un acheteur. À quel prix vendez-vous, pour que je calcule
          la commission ? » Sans ce chiffre, 10% ne veut rien dire — 10% de
          200 CHF n&apos;est pas 10% de 4&apos;000 CHF.
        </p>
      </Sub>

      <div className="min-w-0 max-w-full overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-[var(--surface)] text-[10px] uppercase tracking-wider text-[var(--muted-dim)]">
            <tr>
              <th className="px-4 py-3 font-medium">Annonce</th>
              <th className="px-4 py-3 font-medium">Badge</th>
              <th className="px-4 py-3 font-medium">Prix de vente</th>
              <th className="px-4 py-3 font-medium">Vous touchez</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted)]">
            {[
              ["iPhone 13", "CHF 80.-", "280 CHF", "80 CHF"],
              ["Canapé 3 places", "CHF 120.-", "600 CHF", "120 CHF"],
              ["Vélo électrique", "10%", "2'400 CHF", "240 CHF"],
              ["Cours de piano (pack)", "15%", "800 CHF", "120 CHF"],
              ["Déménagement 2 pièces", "CHF 200.-", "—", "200 CHF"],
              ["MacBook Pro", "8%", "1'100 CHF", "88 CHF"],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-[var(--border)]">
                {row.map((cell) => (
                  <td key={cell} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sub title="Ce que la commission couvre — et ce qu'elle ne couvre pas">
        <p>
          La commission rémunère l&apos;apport d&apos;un client. Elle ne
          vous oblige pas à stocker l&apos;objet, à l&apos;encaisser, ni à
          garantir l&apos;état. L&apos;annonceur reste vendeur. Vous
          n&apos;êtes pas un revendeur : vous êtes un apporteur d&apos;affaires.
        </p>
        <p>
          Merline ne prélève pas cette commission et ne la reverse pas à
          votre place. L&apos;accord se fait entre vous et l&apos;annonceur,
          dans la messagerie. C&apos;est pour cela que les conditions doivent
          être écrites <em>avant</em> d&apos;envoyer l&apos;acheteur.
        </p>
      </Sub>

      <Callout label="Avant d'amener un client, faites confirmer">
        <p>Dans la conversation Merline, obtenez au minimum :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>l&apos;objet ou le créneau est toujours disponible ;</li>
          <li>le prix de vente actuel (surtout si le badge est en %) ;</li>
          <li>
            le montant exact de votre commission, et à quel moment elle est
            due (en général : dès que la vente est conclue) ;
          </li>
          <li>
            le moyen de paiement (Twint, virement, cash au rendez-vous).
          </li>
        </ul>
      </Callout>

      <Script
        title="Message type à l'annonceur"
        text={`Bonjour,

Je suis agent sur Merline. Votre annonce « [titre] » m'intéresse : je pense pouvoir vous trouver un acheteur.

Pouvez-vous confirmer :
1. que c'est toujours disponible ;
2. le prix de vente actuel ;
3. que la commission affichée ([montant]) me sera versée si j'amène un acheteur qui conclut.

Dès votre OK, je commence la recherche. Merci.`}
      />
    </Chapter>
  );
}

function ChooseChapter() {
  return (
    <Chapter
      index={3}
      title="Quelles annonces travailler en premier"
      lead="Les premiers clients se ferment plus vite sur des offres locales, demandées, et dont la commission paie réellement votre temps."
    >
      <Sub title="Filtrez en 60 secondes">
        <p>Gardez une annonce si elle coche au moins quatre points :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Commission ≥ 80 CHF en fixe, ou ≥ 10% sur un prix de vente que
            vous connaissez et qui dépasse ~800 CHF.
          </li>
          <li>
            Zone à portée : même canton, ou l&apos;acheteur n&apos;a pas
            besoin de se déplacer (service à distance, livraison possible).
          </li>
          <li>
            Catégorie demandée : meubles, électronique, sport, services du
            quotidien (ménage, bricolage, transport).
          </li>
          <li>Photos nettes et description complète — ça se revend mieux.</li>
          <li>
            Pas trop « niche » pour un premier deal (art contemporain rare,
            pièce introuvable).
          </li>
        </ul>
      </Sub>
      <Sub title="Objets vs services">
        <p>
          Les objets se placent naturellement sur Tutti, Anibis et Facebook
          Marketplace : l&apos;acheteur veut une photo, un prix, un
          rendez-vous. Les services se vendent mieux par le réseau, LinkedIn,
          le téléphone et les groupes locaux — le besoin est moins visible
          dans une recherche « canapé Genève ».
        </p>
        <p>
          Pour vos 2–3 premières ventes, privilégiez un objet local avec
          commission fixe. Le cycle est plus court, le rendez-vous est
          concret, et vous apprenez le process sans attendre trois semaines.
        </p>
      </Sub>
      <Callout label="Piège fréquent">
        <p>
          Un badge « 20% » n&apos;est intéressant que si le prix de vente
          est élevé <em>et</em> réaliste. 20% de 150 CHF = 30 CHF. Un badge
          « CHF 180.- » sur un meuble courant à Lausanne bat souvent un
          pourcentage spectaculaire sur un objet trop cher pour le marché.
        </p>
      </Callout>
    </Chapter>
  );
}

function FirstClientsChapter() {
  return (
    <Chapter
      index={4}
      title="Comment trouver ses premiers clients"
      lead="Le premier client ne vient presque jamais de la publicité. Il vient de ce que vous connaissez déjà, puis des gens qui cherchent déjà l'objet."
    >
      <Sub title="Les 48 premières heures">
        <Steps
          items={[
            "Créez votre compte, parcourez le catalogue, notez 5 annonces (titre, ville, commission, lien).",
            "Écrivez aux 5 annonceurs avec le message du chapitre 2. Travaillez seulement ceux qui confirment.",
            "Listez 20 personnes de votre entourage (famille, collègues, voisins, groupes WhatsApp de quartier).",
            "Pour chaque annonce confirmée, cherchez qui en a besoin autour de vous avant d'aller sur les sites.",
            "Ensuite seulement : Tutti / Anibis / Marketplace, en ciblant les demandes (« cherche… »), pas en spammant.",
          ]}
        />
      </Sub>
      <Sub title="Deux stratégies, à mener en parallèle">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] p-4">
            <p className="font-medium text-[var(--foreground)]">
              Produit d&apos;abord
            </p>
            <p className="mt-2 text-[var(--muted)]">
              Vous partez d&apos;une annonce Merline et vous chassez un
              acheteur. Utile quand la commission est élevée et que
              l&apos;objet se photographie bien. Risque : vous dépensez du
              temps sans demande réelle.
            </p>
          </div>
          <div className="rounded-md border border-[var(--border)] p-4">
            <p className="font-medium text-[var(--foreground)]">
              Acheteur d&apos;abord
            </p>
            <p className="mt-2 text-[var(--muted)]">
              Vous voyez quelqu&apos;un qui cherche un canapé, un MacBook,
              un déménagement. Vous ouvrez le catalogue, vous trouvez
              l&apos;offre, vous faites le pont. Souvent plus rapide pour
              les premières commissions.
            </p>
          </div>
        </div>
      </Sub>
      <Sub title="Qualifier avant de déranger l'annonceur">
        <p>Un « client » n&apos;est pas quelqu&apos;un qui a dit « ça m&apos;intéresse ». C&apos;est quelqu&apos;un qui peut acheter cette semaine, au bon endroit, au bon budget.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Budget : il accepte le prix (ou une fourchette proche).</li>
          <li>Lieu : il peut se déplacer ou recevoir.</li>
          <li>Délai : cette semaine / ce week-end, pas « un jour ».</li>
          <li>
            Sérieux : il répond, il pose des questions précises, il propose
            un créneau.
          </li>
        </ul>
      </Sub>
      <Script
        title="Message à votre réseau (WhatsApp / SMS)"
        text={`Salut [prénom], je t'écris pour un truc concret.

Je travaille avec des vendeurs sur Merline. Là j'ai [objet / service] à [ville], en bon état, autour de [prix].

Tu en aurais besoin, ou tu connais quelqu'un qui cherche ça en ce moment ? Je peux envoyer les photos.`}
      />
    </Chapter>
  );
}

function ResaleSitesChapter() {
  return (
    <Chapter
      index={5}
      title="Sites de revente suisses"
      lead="Tutti, Anibis, Ricardo et Marketplace sont les endroits où la demande d'objets se voit déjà. Votre job n'est pas de spammer : c'est de répondre à des gens qui cherchent."
    >
      <Sub title="Où aller, et pour quoi">
        <div className="min-w-0 max-w-full overflow-x-auto rounded-md border border-[var(--border)]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-[var(--surface)] text-[10px] uppercase tracking-wider text-[var(--muted-dim)]">
              <tr>
                <th className="px-4 py-3 font-medium">Plateforme</th>
                <th className="px-4 py-3 font-medium">Force</th>
                <th className="px-4 py-3 font-medium">Comment l&apos;utiliser</th>
              </tr>
            </thead>
            <tbody className="text-[var(--muted)]">
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 text-[var(--foreground)]">Tutti.ch</td>
                <td className="px-4 py-3">Volume n°1 en Suisse, gratuit, local</td>
                <td className="px-4 py-3">
                  Filtrez par canton. Cherchez les annonces « Demande » /
                  « cherche [objet] ».
                </td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 text-[var(--foreground)]">Anibis.ch</td>
                <td className="px-4 py-3">Très lu, électronique et maison</td>
                <td className="px-4 py-3">
                  Même logique. Alerte email sur le mot-clé + votre ville.
                </td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 text-[var(--foreground)]">Ricardo.ch</td>
                <td className="px-4 py-3">Enchères et « acheter maintenant »</td>
                <td className="px-4 py-3">
                  Utile pour jauger le prix réel. Moins pour prospecter un
                  acheteur unitaire.
                </td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 text-[var(--foreground)]">
                  Facebook Marketplace
                </td>
                <td className="px-4 py-3">Très fort meubles, déco, local</td>
                <td className="px-4 py-3">
                  Recherche + messages. Les groupes d&apos;achat/vente de
                  ville convertissent souvent mieux que le fil public.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub title="Méthode « demandes » (la plus rentable)">
        <p>
          Sur Tutti et Anibis, beaucoup d&apos;annonces sont des{" "}
          <strong className="font-medium text-[var(--foreground)]">
            demandes
          </strong>{" "}
          : quelqu&apos;un cherche un canapé, un iPhone, un vélo. C&apos;est
          un acheteur déjà chaud. Vous n&apos;avez pas à le convaincre
          d&apos;avoir besoin de l&apos;objet — seulement que vous en avez
          un de correspondant.
        </p>
        <Steps
          items={[
            "Recherche : « cherche canapé Genève », « cherche iPhone Lausanne », « demande vélo Vaud », etc. Alternez objet + ville / canton.",
            "Ouvrez 10 annonces récentes (moins de 7 jours). Plus c'est vieux, plus c'est déjà pourvu.",
            "Vérifiez que le catalogue Merline a une offre proche (catégorie, état, zone, budget).",
            "Écrivez un message court, honnête : vous n'êtes pas le propriétaire, vous pouvez mettre en relation.",
            "Si la personne répond, confirmez budget + délai, puis contactez l'annonceur Merline le jour même.",
          ]}
        />
      </Sub>

      <Script
        title="Message sur Tutti / Anibis / Marketplace"
        text={`Bonjour,

J'ai vu que vous cherchez [objet] vers [ville]. Je ne vends pas le mien : je mets en relation avec un particulier qui a exactement ça, photos et description à l'appui.

Prix indiqué : [prix]. Lieu : [ville]. Je peux vous envoyer les photos et organiser la visite si ça correspond.

Dites-moi votre budget et si vous pouvez vous déplacer cette semaine.`}
      />

      <Sub title="Méthode « offre » (republier, avec accord)">
        <p>
          Si l&apos;annonceur vous autorise à diffuser ses photos, vous
          pouvez publier une annonce sur Tutti / Marketplace. Conditions
          non négociables :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Accord écrit dans la conversation Merline (photos + prix +
            ville).
          </li>
          <li>
            Transparence : vous êtes un intermédiaire, pas le propriétaire.
            Les plateformes et les acheteurs sanctionnent le mensonge.
          </li>
          <li>
            Un seul canal de contact (votre téléphone ou « message
            plateforme »). Ne publiez pas l&apos;email de l&apos;annonceur.
          </li>
          <li>
            Dès qu&apos;un acheteur sérieux se manifeste, vous le ramenez
            sur Merline / au rendez-vous convenu. Vous ne contournez pas
            l&apos;annonceur.
          </li>
        </ul>
      </Sub>

      <Sub title="Règles pour rester efficace (et pas banni)">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Pas de copier-coller identique à 40 personnes. Personnalisez
            ville, objet, prix.
          </li>
          <li>
            Pas de scraping, pas de listes achetées, pas de faux comptes.
            Un compte réel, une photo de profil, un historique propre.
          </li>
          <li>
            Répondez le jour même. Sur ces sites, le premier message
            clair gagne souvent la visite.
          </li>
          <li>
            Créez des alertes (Tutti / Anibis) sur 3 mots-clés × votre
            canton. 10 minutes le matin suffisent.
          </li>
        </ul>
      </Sub>

      <Callout label="Lire le marché avant de promettre un prix">
        <p>
          Avant de jurer qu&apos;un canapé « partira à 800 », cherchez 8
          annonces comparables sur Tutti dans le même rayon. Si tout le
          monde affiche 350–450 CHF, un % calculé sur 800 CHF est un
          mirage. Ajustez votre promesse, ou changez d&apos;annonce.
        </p>
      </Callout>
    </Chapter>
  );
}

function SocialChapter() {
  return (
    <Chapter
      index={6}
      title="Réseaux sociaux"
      lead="Les groupes locaux ferment plus de ventes qu'un compte Instagram neuf. La pub organique marche si vous parlez à des gens qui se connaissent déjà."
    >
      <Sub title="Facebook : groupes d'achat / vente">
        <p>
          Chaque ville suisse a ses groupes : « Achat Vente Genève »,
          « Lausanne marketplace », « Annonces [quartier] », plus les
          groupes d&apos;expatriés et d&apos;étudiants. Rejoignez-en 5 à
          10 près de chez vous, lisez le règlement, puis postez rarement
          et répondez souvent.
        </p>
        <Steps
          items={[
            "Pendant 2–3 jours, commentez et aidez (sans vendre). Les admins et les membres voient les profils qui dumpent des pubs dès J1.",
            "Surveillez les posts « Je cherche… ». Répondez en message privé, même script que sur Tutti, adapté au tutoiement du groupe.",
            "Si le règlement autorise les offres : un post = un objet, photos de l'annonceur, prix, ville, et « intermédiaire, visite chez le propriétaire ».",
            "Ne publiez pas 8 objets d'affilée. Un par jour, aux heures où les gens scrollent (7h–8h, 12h, 20h–22h).",
          ]}
        />
      </Sub>

      <Sub title="Instagram et TikTok">
        <p>
          Utile pour les objets photogéniques (meuble, vélo, déco, vêtements)
          et pour les services visuels. Inutile si vous n&apos;avez pas les
          photos de l&apos;annonceur. Un compte neuf ne convertit pas en 48
          h : traitez-le comme un complément, pas comme votre premier canal.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Stories : 3 photos + prix + ville + « DM si visite cette
            semaine ».
          </li>
          <li>
            Carrousel : détail, défauts inclus (confiance), puis appel à
            l&apos;action.
          </li>
          <li>
            Géolocalisation de la ville, hashtags sobres (#geneve #lausanne
            #aachenete plutôt que 30 tags internationaux).
          </li>
          <li>
            TikTok : 15 secondes, objet + prix + « je peux organiser la
            visite ». La virality n&apos;est pas le but ; un acheteur local
            l&apos;est.
          </li>
        </ul>
      </Sub>

      <Sub title="WhatsApp, Telegram, LinkedIn">
        <p>
          WhatsApp reste le canal n°1 en Suisse romande une fois le premier
          contact établi. Statut WhatsApp : photo + prix, renouvelé 2–3
          fois par semaine, uniquement vers des gens qui vous connaissent.
        </p>
        <p>
          LinkedIn convient aux <em>services</em> (informatique,
          événementiel, transport professionnel). Un message InMail générique
          ne marche pas. Un message à un gérant de PME de votre ville, avec
          une offre précise du catalogue, peut rapporter une commission
          unique élevée.
        </p>
      </Sub>

      <Script
        title="Post de groupe Facebook"
        text={`[Ville] — [Objet], [état]

Prix : [prix] CHF
Lieu : [quartier / commune]
Visite possible [jours]

Je mets en relation avec le propriétaire (je ne stocke pas l'objet). Photos réelles en commentaire / en MP.

MP uniquement si vous pouvez vous déplacer cette semaine.`}
      />

      <Callout label="Ce qui fait bannir">
        <p>
          Liens agressifs, la même annonce postée 4 fois, faux « c&apos;est
          chez moi », tags de 50 membres. Un groupe local est un village.
          Un ban sur 3 groupes de Genève coupe un canal entier. Restez
          humain, lent, et utile.
        </p>
      </Callout>
    </Chapter>
  );
}

function CallsChapter() {
  return (
    <Chapter
      index={7}
      title="Appels téléphone"
      lead="Le téléphone accélère quand le besoin est déjà public, ou quand vous parlez à une entreprise. Ce n'est pas du démarchage sauvage sur des listes achetées."
    >
      <Sub title="Qui appeler (légitime et utile)">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            La personne a laissé son numéro sur une annonce « je cherche
            [objet / service] ». Elle a demandé à être contactée.
          </li>
          <li>
            Un professionnel dont le besoin est public : café qui cherche un
            frigo d&apos;occasion, PME qui cherche un déménagement, salon
            qui cherche un prestataire du catalogue.
          </li>
          <li>
            Un lead qui vous a déjà écrit mais ne conclut pas : un appel de
            3 minutes débloque souvent le créneau de visite.
          </li>
        </ul>
        <p>
          N&apos;achetez pas de fichiers d&apos;appels, n&apos;appelez pas
          des particuliers au hasard. En Suisse, le démarchage téléphonique
          non sollicité vers les consommateurs est encadré. Restez sur des
          gens qui ont signalé un besoin, ou sur du B2B ciblé.
        </p>
      </Sub>

      <Sub title="Structure d'un appel de 90 secondes">
        <Steps
          items={[
            "Qui vous êtes, en une phrase : « Je m'appelle [prénom], je mets en relation des acheteurs et des vendeurs sur Merline. »",
            "Pourquoi vous appelez : « J'ai vu votre annonce Tutti, vous cherchez un canapé 3 places vers Renens. »",
            "L'offre, sans roman : prix, ville, état, possibilité de visite.",
            "Une question fermée : « Vous pouvez passer samedi entre 10h et 12h ? »",
            "Si oui : prenez nom, créneau, et rappelez que vous confirmez avec le propriétaire dans l'heure.",
            "Si non : « Quel est le vrai frein — prix, taille, délai ? » Notez, et ne relancez pas 8 fois.",
          ]}
        />
      </Sub>

      <Script
        title="Ouverture d'appel (demande Tutti)"
        text={`Bonjour, je vous dérange deux minutes. Je m'appelle [prénom]. J'ai vu que vous cherchez [objet] vers [ville].

Je ne suis pas le vendeur : je peux vous mettre en contact avec un particulier qui l'a, photos à l'appui, à [prix] CHF, à [commune].

Est-ce que ça correspond encore à ce que vous cherchez, et pour quand ?`}
      />

      <Sub title="Après l'appel">
        <p>
          Envoyez tout de suite un SMS / WhatsApp avec les 3 photos, le
          prix, l&apos;adresse de visite (quand l&apos;annonceur l&apos;a
          autorisée), et le créneau. L&apos;oral ouvre ; l&apos;écrit
          confirme. Puis messagez l&apos;annonceur Merline : « Acheteur
          qualifié, créneau samedi 10h, il connaît le prix. »
        </p>
      </Sub>
    </Chapter>
  );
}

function AdsChapter() {
  return (
    <Chapter
      index={8}
      title="Publicité payante"
      lead="La pub ne remplace pas les premiers clients. Elle devient intéressante quand vous savez déjà quel objet part, dans quelle ville, et que la commission couvre largement le coût d'un lead."
    >
      <Sub title="Le calcul avant de dépenser un franc">
        <p>
          Coût d&apos;acquisition maximum ≈ 25–35% de votre commission.
          Si vous touchez 200 CHF, vous pouvez viser 50–70 CHF de pub pour
          amener <em>un</em> acheteur qui conclut. Si Facebook vous coûte
          80 CHF de clics sans visite, vous arrêtez.
        </p>
        <p>
          Ne lancez pas de pub sur une commission de 40 CHF. Ne lancez pas
          non plus sans photos de qualité et sans confirmation de
          disponibilité le matin même.
        </p>
      </Sub>

      <Sub title="Où mettre 30 à 80 CHF pour tester">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="font-medium text-[var(--foreground)]">
              Annonce boostée Tutti / Anibis
            </strong>{" "}
            — si vous avez l&apos;accord de republier. Souvent le meilleur
            premier test : l&apos;audience cherche déjà à acheter.
          </li>
          <li>
            <strong className="font-medium text-[var(--foreground)]">
              Facebook / Instagram Ads
            </strong>{" "}
            — rayon 15–25 km autour de la ville de l&apos;objet, 25–55 ans,
            intérêts maison / sport / tech selon la catégorie. Budget 5–10
            CHF / jour, 4–5 jours.
          </li>
          <li>
            <strong className="font-medium text-[var(--foreground)]">
              Boost de post de groupe
            </strong>{" "}
            — parfois plus rentable qu&apos;une campagne Ads complète, si
            le groupe est local et actif.
          </li>
          <li>
            Google Ads uniquement sur un service à fort ticket (ex.
            déménagement, prestation &gt; 1&apos;000 CHF) avec une
            commission fixe élevée. Trop cher pour un canapé.
          </li>
        </ul>
      </Sub>

      <Sub title="Créa et page d'arrivée">
        <p>
          Une seule offre par annonce. Première image = la meilleure photo
          de l&apos;annonceur. Texte : objet, état, prix, ville, « visite
          cette semaine ». Bouton : message WhatsApp ou formulaire très
          court (prénom + téléphone + créneau).
        </p>
        <p>
          N&apos;envoyez pas la pub vers le catalogue entier. Un prospect
          payé qui arrive sur 40 fiches part. Une offre, un prix, un
          prochain pas.
        </p>
      </Sub>

      <div className="rounded-md border border-[var(--border)] p-5">
        <p className="text-sm font-medium text-[var(--foreground)]">
          Exemple de test sur 5 jours
        </p>
        <ul className="mt-3 space-y-2 text-[var(--muted)]">
          <li>Commission visée : CHF 180.- (canapé, fixe).</li>
          <li>Budget : 8 CHF/jour × 5 = 40 CHF.</li>
          <li>Cible : 20 km autour de Lausanne, intérêts mobilier.</li>
          <li>
            Succès : 1 visite qualifiée qui achète → +140 CHF net. Échec :
            0 visite après 25 CHF → vous coupez, vous changez photo ou
            offre, vous ne « laissez tourner ».
          </li>
        </ul>
      </div>

      <Callout label="Discipline">
        <p>
          Notez chaque franc, chaque message, chaque visite. La pub sans
          suivi est un hobby. Si après deux tests l&apos;objet ne génère
          aucun lead à moins de 40 CHF, le problème est l&apos;offre (prix,
          photos, demande), pas « Facebook qui ne marche pas ».
        </p>
      </Callout>
    </Chapter>
  );
}

function OtherChannelsChapter() {
  return (
    <Chapter
      index={9}
      title="Autres leviers d'acquisition"
      lead="Les canaux discrets ferment souvent la première commission : le quartier, les métiers qui voient des gens déménager, les conversations déjà ouvertes."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            t: "Réseau chaud",
            d: "Famille, collègues, voisins, club de sport. Un message ciblé à 20 personnes bat 200 messages froids. C'est le canal n°1 des premières ventes.",
          },
          {
            t: "Partenaires de terrain",
            d: "Déménageurs, concierges, décorateurs, coaches sportifs, réparateurs. Ils voient le besoin avant l'annonce. Proposez une petite rétro-commission si quelqu'un leur envoie un acheteur — uniquement en accord avec l'annonceur.",
          },
          {
            t: "Groupes de quartier",
            d: "WhatsApp d'immeuble, association de locataires, groupes d'étudiants, communautés d'expat. Un objet local + un ton d'entraide, pas de catalogue.",
          },
          {
            t: "Brocantes et affichage",
            d: "Marchés aux puces, tableaux d'immeuble (si autorisé), flyers chez un partenaire. Utile pour le très local (meuble, électroménager). Toujours avec l'accord de l'annonceur pour les photos.",
          },
          {
            t: "Relance de « presque »",
            d: "Toute personne qui a demandé des photos et n'a pas donné suite : un message 48h plus tard, puis un dernier 7 jours plus tard. Beaucoup d'achats se décident au 2e contact.",
          },
          {
            t: "Catalogue inversé",
            d: "Entendez un besoin dans une conversation (« on cherche une table »). Ouvrez Merline, trouvez l'annonce, proposez le jour même. C'est de l'acquisition sans prospecter.",
          },
        ].map((card) => (
          <div
            key={card.t}
            className="rounded-md border border-[var(--border)] p-4"
          >
            <p className="text-sm font-medium text-[var(--foreground)]">
              {card.t}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.d}</p>
          </div>
        ))}
      </div>
    </Chapter>
  );
}

function CloseChapter() {
  return (
    <Chapter
      index={10}
      title="De l'intérêt à la commission versée"
      lead="Un lead n'est pas une vente. Votre travail se termine quand l'annonceur a vendu et que vous êtes payé — pas quand quelqu'un a dit « super »."
    >
      <Steps
        items={[
          "Qualifiez (budget, lieu, délai). Si ça ne colle pas, vous ne dérangez pas l'annonceur.",
          "Écrivez à l'annonceur : qui est l'acheteur, ce qu'il a compris du prix, le créneau proposé.",
          "Faites confirmer par écrit la commission une dernière fois (« OK pour 120 CHF à la conclusion samedi »).",
          "Organisez la visite. Idéalement vous n'avez pas à y aller, mais vous restez joignable.",
          "Après la visite : un message aux deux. Si ça bloque (prix, défaut), proposez un ajustement — vous n'imposez rien.",
          "Vente faite : rappelez le montant et le moyen convenus. Un seul rappel courtois le lendemain, pas une chasse.",
        ]}
      />
      <Script
        title="Présentation de l'acheteur à l'annonceur"
        text={`Bonjour,

J'ai un acheteur pour « [titre] ».

- Prénom : [prénom]
- Budget OK pour [prix]
- Peut se déplacer [jour / heure]
- A vu les photos, connaît l'état décrit

On confirme le créneau ? Dès que c'est vendu, je vous envoie mon Twint pour la commission de [montant], comme convenu.`}
      />
      <Callout label="Protégez-vous sans bloquer la vente">
        <p>
          Ne donnez pas le numéro de l&apos;annonceur à un inconnu avant
          d&apos;avoir un accord écrit sur la commission. Ne retenez pas
          non plus l&apos;acheteur en otage : le bon équilibre, c&apos;est
          la conversation Merline comme preuve, puis la visite. Si un
          annonceur refuse de confirmer la commission par écrit, passez à
          l&apos;annonce suivante.
        </p>
      </Callout>
    </Chapter>
  );
}

function RoutineChapter() {
  return (
    <Chapter
      index={11}
      title="Routine d'une semaine, et erreurs à éviter"
      lead="Cinq heures bien placées battent quinze heures de scroll. Une routine simple, répétée, suffit à encaisser les premières commissions."
    >
      <div className="min-w-0 max-w-full overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-[var(--surface)] text-[10px] uppercase tracking-wider text-[var(--muted-dim)]">
            <tr>
              <th className="px-4 py-3 font-medium">Moment</th>
              <th className="px-4 py-3 font-medium">Quoi faire</th>
              <th className="px-4 py-3 font-medium">Durée</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted)]">
            {[
              [
                "Lundi matin",
                "Catalogue : 5 annonces, messages aux annonceurs, trier les OK.",
                "45 min",
              ],
              [
                "Tous les matins",
                "Alertes Tutti / Anibis / Marketplace : nouvelles demandes.",
                "15 min",
              ],
              [
                "Mardi – jeudi",
                "Réponses aux demandes, 1 post de groupe, relances J+2.",
                "45–60 min",
              ],
              [
                "1 créneau semaine",
                "5 appels sur des demandes qui ont laissé un numéro.",
                "30 min",
              ],
              [
                "Vendredi",
                "Point : visites du week-end, commissions en attente, pub à couper ou non.",
                "20 min",
              ],
              [
                "Week-end",
                "Visites, statuts WhatsApp, un passage Marketplace le dimanche soir.",
                "selon leads",
              ],
            ].map((row) => (
              <tr key={row[0]} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 text-[var(--foreground)]">{row[0]}</td>
                <td className="px-4 py-3">{row[1]}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sub title="Erreurs qui coûtent des semaines">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Travailler 20 annonces à la fois. Trois confirmées valent
            mieux qu&apos;une liste que vous ne suivez pas.
          </li>
          <li>
            Promettre un objet non confirmé. Vous brûlez l&apos;acheteur et
            votre crédibilité sur le groupe.
          </li>
          <li>
            Cacher que vous êtes intermédiaire. Ça se voit, et ça se paie
            en signalements.
          </li>
          <li>
            Lancer de la pub avant d&apos;avoir fermé un deal « à la main ».
          </li>
          <li>
            Amener un acheteur sans accord écrit sur la commission.
          </li>
          <li>
            Relancer dix fois la même personne. Deux relances, puis vous
            passez au suivant.
          </li>
          <li>
            Choisir sur le % le plus haut sans regarder le prix de vente ni
            la demande locale.
          </li>
        </ul>
      </Sub>

      <Sub title="Ce que « bon » ressemble au début">
        <p>
          Semaine 1 : compte, 5 messages annonceurs, 20 messages réseau,
          10 réponses à des demandes Tutti. Semaine 2–3 : première visite
          organisée. Première commission : souvent 80 à 200 CHF, locale,
          sans pub. Ce n&apos;est pas un salaire. C&apos;est la preuve
          que le process tient — ensuite vous répétez, puis seulement vous
          scalez (plus d&apos;annonces, un peu de pub, un partenaire).
        </p>
      </Sub>
    </Chapter>
  );
}

function GuideCta() {
  return (
    <div className="rounded-md bg-[var(--indigo)] px-6 py-8 text-center text-white md:px-10">
      <p className="text-lg font-medium tracking-tight md:text-xl">
        Passez du guide au catalogue
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
        Choisissez trois annonces, écrivez aux annonceurs, puis cherchez
        un acheteur autour de vous avant d&apos;élargir.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/#catalogue" className="btn-vendre-submit">
          Ouvrir le catalogue
        </Link>
        <Link href="/connexion" className="btn-on-indigo-ghost">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
