import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { MERLINE_GIF, MERLINE_GIF_INDIGO } from "@/lib/brand-assets";
import { MotionDiv } from "@/components/ui/motion";
import {
  footerAccountLinks,
  footerGuestLinks,
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

export async function Footer({
  light = false,
  indigo = false,
}: {
  light?: boolean;
  indigo?: boolean;
}) {
  const user = await getUser();
  const accountLinks = user ? footerAccountLinks : footerGuestLinks;
  const footerClass = [
    "site-footer",
    light ? "site-footer-on-light" : "",
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
                src={light ? MERLINE_GIF_INDIGO : MERLINE_GIF}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                unoptimized
                aria-hidden
              />
              <span>Merline</span>
            </Link>
            <p className="site-footer-tagline">
              Merline connecte annonceurs et agents autour d&apos;une commission
              transparente.
            </p>
          </div>

          <FooterColumn title="Plateforme" links={footerPlatformLinks} />
          <FooterColumn title={user ? "Mon compte" : "Compte"} links={accountLinks} />
          <FooterColumn title="Légal" links={footerLegalLinks} />
        </div>

        <div className="site-footer-bottom">
          <p className="site-footer-copy">
            © {new Date().getFullYear()} Merline. Tous droits réservés.
          </p>
          <p className="site-footer-note">Plateforme suisse de mise en relation.</p>
        </div>
      </MotionDiv>
    </footer>
  );
}
