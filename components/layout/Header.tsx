import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/auth";
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

  const headerClass = transparent
    ? "border-transparent bg-transparent"
    : indigo
      ? "border-white/10 bg-[var(--indigo)]"
      : light
        ? "border-[rgba(0,0,0,0.08)] bg-white"
        : "border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl";

  return (
    <header className={`sticky top-0 z-50 border-b ${headerClass}`}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/merline.gif"
            alt="Merline"
            width={32}
            height={32}
            className={`h-8 w-8 object-contain ${gifIndigo ? "merline-gif-indigo" : ""}`}
            unoptimized
          />
          <span
            className={`text-sm font-semibold tracking-tight ${
              indigo
                ? "text-white"
                : light || transparent
                  ? "text-[#0a0a0a]"
                  : "text-[var(--foreground)]"
            }`}
          >
            Merline
          </span>
        </Link>

        <HeaderNav indigo={indigo} light={light || transparent} />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!hideAuthLink ? (
            user ? (
              <Link
                href="/dashboard"
                className={`whitespace-nowrap text-sm ${
                  indigo
                    ? "text-white/75 hover:text-white"
                    : light || transparent
                      ? "text-[#52525b] hover:text-[#0a0a0a]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Mon espace
              </Link>
            ) : (
              <Link
                href="/login"
                className={`whitespace-nowrap text-sm ${
                  indigo
                    ? "text-white/75 hover:text-white"
                    : light || transparent
                      ? "text-[#52525b] hover:text-[#0a0a0a]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Se connecter
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
