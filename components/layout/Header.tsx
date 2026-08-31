import Link from "next/link";
import Image from "next/image";
import { getProfile, getUser } from "@/lib/auth";
import { MERLINE_GIF, MERLINE_GIF_INDIGO } from "@/lib/brand-assets";
import { HeaderNav } from "./HeaderNav";

export async function Header({
  light = false,
  indigo = false,
  gifIndigo = false,
  transparent = false,
  hideAuthLink = false,
}: {
  light?: boolean;
  indigo?: boolean;
  gifIndigo?: boolean;
  transparent?: boolean;
  hideAuthLink?: boolean;
}) {
  const user = await getUser();
  const profile = user ? await getProfile() : null;
  const username = profile?.username?.trim();

  const headerClass = transparent
    ? "border-transparent bg-transparent"
    : indigo
      ? "border-white/10 bg-[var(--indigo)]"
      : light
        ? "border-[#e3e8ee] bg-[#f6f9fc]"
        : "border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl";

  const themeClass = indigo
    ? "section-indigo"
    : light || transparent
      ? "section-light"
      : "section-dark";

  return (
    <header className={`sticky top-0 z-50 overflow-visible border-b ${headerClass} ${themeClass}`}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src={gifIndigo && light ? MERLINE_GIF_INDIGO : MERLINE_GIF}
            alt="Merline"
            width={32}
            height={32}
            className={`h-8 w-8 object-contain ${light && !gifIndigo && !indigo ? "brand-logo-black" : ""}`}
            unoptimized
          />
          <span
            className={`text-lg font-normal tracking-tight ${
              indigo
                ? "text-white"
                : light || transparent
                  ? "text-[#0a2540]"
                  : "text-[var(--foreground)]"
            }`}
          >
            Merline
          </span>
        </Link>

        <HeaderNav
          indigo={indigo}
          light={light || transparent}
          loggedIn={!!user}
          username={username}
          hideAuthLink={hideAuthLink}
        />
      </div>
    </header>
  );
}
