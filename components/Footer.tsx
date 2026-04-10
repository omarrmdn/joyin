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
      <p>&copy; {new Date().getFullYear()} Joyin | Built with Next.js</p>
      <div className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Support</a>
      </div>
    </footer>
  );
}
