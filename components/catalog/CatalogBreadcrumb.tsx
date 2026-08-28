import Link from "next/link";
import { buildCatalogHref } from "@/lib/catalog";
import type { ListingType } from "@/lib/types";
import { getListingTypeLabel } from "@/lib/types";

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}

type CatalogBreadcrumbProps = {
  listingType: ListingType;
  category: string;
};

export function CatalogBreadcrumb({ listingType, category }: CatalogBreadcrumbProps) {
  const typeLabel = getListingTypeLabel(listingType);

  return (
    <nav aria-label="Fil d'Ariane" className="catalog-breadcrumb">
      <Link href="/" className="catalog-breadcrumb-link">
        Page d&apos;accueil
      </Link>

      <span className="catalog-breadcrumb-separator" aria-hidden>
        <ChevronIcon />
      </span>

      <Link
        href={buildCatalogHref({ listingType })}
        className="catalog-breadcrumb-link"
      >
        {typeLabel}
      </Link>

      {category ? (
        <>
          <span className="catalog-breadcrumb-separator" aria-hidden>
            <ChevronIcon />
          </span>
          <Link
            href={buildCatalogHref({ listingType, category })}
            className="catalog-breadcrumb-link"
          >
            {category}
          </Link>
        </>
      ) : null}
    </nav>
  );
}
