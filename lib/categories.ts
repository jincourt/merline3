import type { ListingType } from "@/lib/types";

export type CategorySelection = {
  parent: string;
  sub: string;
};

export type CategoryGroup = {
  label: string;
  subcategories: readonly string[];
};

export const OBJECT_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: "Meubles",
    subcategories: [
      "Canapés & fauteuils",
      "Tables & chaises",
      "Rangements",
      "Lits & matelas",
      "Autre",
    ],
  },
  {
    label: "Électronique",
    subcategories: [
      "Téléphones",
      "Ordinateurs",
      "TV & audio",
      "Photo & vidéo",
      "Autre",
    ],
  },
  {
    label: "Vêtements",
    subcategories: ["Homme", "Femme", "Enfant", "Accessoires", "Autre"],
  },
  {
    label: "Livres",
    subcategories: ["Romans", "BD & mangas", "Scolaire", "Jeunesse", "Autre"],
  },
  {
    label: "Art & Déco",
    subcategories: [
      "Tableaux",
      "Objets déco",
      "Luminaires",
      "Antiquités",
      "Autre",
    ],
  },
  {
    label: "Sport",
    subcategories: [
      "Fitness",
      "Vélos",
      "Sports d'hiver",
      "Sports collectifs",
      "Autre",
    ],
  },
  {
    label: "Véhicule",
    subcategories: [
      "Voitures",
      "Motos & scooters",
      "Utilitaires & camions",
      "Bateaux & nautique",
      "Caravanes & camping-cars",
      "Pièces & accessoires",
      "Autre",
    ],
  },
  {
    label: "Personnalisé",
    subcategories: [],
  },
];

export const SERVICE_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: "Réparation & Bricolage",
    subcategories: [
      "Petites réparations",
      "Électricité",
      "Plomberie",
      "Montage meubles",
      "Autre",
    ],
  },
  {
    label: "Beauté & Bien-être",
    subcategories: ["Coiffure", "Esthétique", "Massage", "Fitness", "Autre"],
  },
  {
    label: "Informatique & Tech",
    subcategories: [
      "Dépannage",
      "Développement",
      "Design",
      "Formation",
      "Autre",
    ],
  },
  {
    label: "Ménage & Entretien",
    subcategories: [
      "Ménage",
      "Repassage",
      "Jardinage",
      "Nettoyage",
      "Autre",
    ],
  },
  {
    label: "Transport & Déménagement",
    subcategories: [
      "Déménagement",
      "Livraison",
      "Transport personnes",
      "Autre",
    ],
  },
  {
    label: "Événementiel",
    subcategories: [
      "Photographie",
      "Musique",
      "Traiteur",
      "Animation",
      "Autre",
    ],
  },
  {
    label: "Personnalisé",
    subcategories: [],
  },
];

export function getCategoryGroupsForType(
  type: ListingType,
): readonly CategoryGroup[] {
  return type === "service" ? SERVICE_CATEGORY_GROUPS : OBJECT_CATEGORY_GROUPS;
}

export function formatCategoryLabel(selection: CategorySelection) {
  return `${selection.parent} › ${selection.sub}`;
}

export function formatCategorySelections(selections: CategorySelection[]) {
  return selections
    .map((selection) => {
      if (selection.parent === "Personnalisé") {
        return selection.sub.trim()
          ? `Personnalisé › ${selection.sub.trim()}`
          : "";
      }
      return formatCategoryLabel(selection);
    })
    .filter(Boolean)
    .join(" · ");
}

export function parseCategorySelections(value: string): {
  selections: CategorySelection[];
} {
  if (!value.trim()) {
    return { selections: [] };
  }

  const parts = value.split(" · ").map((part) => part.trim()).filter(Boolean);
  const selections: CategorySelection[] = [];

  for (const part of parts) {
    const separatorIndex = part.indexOf(" › ");
    if (separatorIndex === -1) {
      selections.push({ parent: part, sub: "Autre" });
      continue;
    }

    const parent = part.slice(0, separatorIndex);
    const sub = part.slice(separatorIndex + 3);
    selections.push({ parent, sub });
  }

  return { selections };
}

export function isSameCategorySelection(
  a: CategorySelection,
  b: CategorySelection,
) {
  return a.parent === b.parent && a.sub === b.sub;
}
