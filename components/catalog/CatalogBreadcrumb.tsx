import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildCatalogHref } from "@/lib/catalog";
import type { ListingType } from "@/lib/types";
import { getListingTypeLabel } from "@/lib/types";

type CatalogBreadcrumbProps = {
  listingType: ListingType;
  category: string;
  className?: string;
};

export function CatalogBreadcrumb({
  listingType,
  category,
  className = "",
}: CatalogBreadcrumbProps) {
  const typeLabel = getListingTypeLabel(listingType);

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`catalog-breadcrumb ${className}`.trim()}
    >
      <Link href="/" className="catalog-breadcrumb-link">
        Page d&apos;accueil
      </Link>

      <span className="catalog-breadcrumb-separator" aria-hidden>
        <ChevronRight className="catalog-breadcrumb-separator-icon" strokeWidth={1.75} aria-hidden />
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
            <ChevronRight className="catalog-breadcrumb-separator-icon" strokeWidth={1.75} aria-hidden />
          </span>
          <Link
            href={buildCatalogHref({ listingType, category })}
            className="catalog-breadcrumb-link catalog-breadcrumb-current"
            aria-current="page"
          >
            {category}
          </Link>
        </>
      ) : null}
    </nav>
  );
}
