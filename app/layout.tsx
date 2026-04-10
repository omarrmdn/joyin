import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joyin | Discover & Join Events",
  description: "Join exciting events happening near you. Create, manage, and book event tickets easily.",
};

import { GlobalShareModal } from "@/components/GlobalShareModal";

import { LanguageProvider } from "@/lib/language-context";
import { GoogleOneTap } from "@/components/GoogleOneTap";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} data-theme="dark">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <GoogleOneTap />
            <div className="app-shell">
              <Sidebar />
              <main className="main-content-area">
                {children}
                <Footer />
              </main>
              <BottomTabBar />
              <GlobalShareModal />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
