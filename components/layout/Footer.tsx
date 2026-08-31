import Image from "next/image";
import Link from "next/link";
import { MERLINE_GIF } from "@/lib/brand-assets";
import { MotionDiv } from "@/components/ui/motion";
import {
  footerLanguageLabels,
  footerLegalLinks,
  footerPlatformLinks,
  type FooterLink,
} from "./footer-links";

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="site-footer-links">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="site-footer-link">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div className="site-footer-column">
      <p className="site-footer-heading">{title}</p>
      <FooterLinkList links={links} />
    </div>
  );
}

function FooterTextColumn({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="site-footer-column">
      <p className="site-footer-heading">{title}</p>
      <ul className="site-footer-links">
        {items.map((item) => (
          <li key={item}>
            <span className="site-footer-text">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({
  light = false,
  indigo = false,
}: {
  light?: boolean;
  indigo?: boolean;
}) {
  const footerClass = [
    "site-footer",
    light ? "site-footer-light" : "",
    indigo ? "site-footer-after-indigo" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={footerClass}>
      <MotionDiv className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-logo">
              <Image
                src={MERLINE_GIF}
                alt=""
                width={32}
                height={32}
                className={`h-8 w-8 object-contain ${light ? "brand-logo-black" : ""}`}
                unoptimized
                aria-hidden
              />
              <span>Merline</span>
            </Link>
          </div>

          <FooterColumn title="Plateforme" links={footerPlatformLinks} />
          <FooterColumn title="Légal" links={footerLegalLinks} />
          <FooterTextColumn title="Langue" items={footerLanguageLabels} />
        </div>
      </MotionDiv>
    </footer>
  );
}
