"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

export function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide footer on messages pages
  if (pathname?.startsWith("/messages")) {
    return null;
  }

  return (
    <footer className="simple-footer">
      <p>&copy; {new Date().getFullYear()} Joyin | {t.builtWith} Next.js</p>
      <div className="footer-links">
        <a href="#">{t.privacy}</a>
        <Link href="/terms">{t.terms}</Link>
        <a href="#">{t.support}</a>
      </div>
    </footer>
  );
}
