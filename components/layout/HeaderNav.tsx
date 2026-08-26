"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/motion";

const nav: { href: string; label: string }[] = [];

export function HeaderNav({
  indigo = false,
  light = false,
}: {
  indigo?: boolean;
  light?: boolean;
}) {
  const linkClass = indigo
    ? "text-white/75 hover:text-white"
    : light
      ? "text-[#52525b] hover:text-[#0a0a0a]"
      : "text-[var(--muted)] hover:text-[var(--foreground)]";

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {nav.map((item, index) => (
        <motion.div
          key={item.href}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={item.href} className={`text-sm transition-colors ${linkClass}`}>
            {item.label}
          </Link>
        </motion.div>
      ))}
    </nav>
  );
}
