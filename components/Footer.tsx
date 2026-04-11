"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on messages pages
  if (pathname?.startsWith("/messages")) {
    return null;
  }

  return (
    <footer className="simple-footer">
      <p>&copy; {new Date().getFullYear()} Joyin | {t.builtWith} Next.js</p>
      <div className="footer-links">
        <a href="#">{t.privacy}</a>
        <a href="#">{t.terms}</a>
        <a href="#">{t.support}</a>
      </div>
    </footer>
  );
}
