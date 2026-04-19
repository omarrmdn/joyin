import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
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

const graphikArabic = localFont({
  src: [
    {
      path: "../../public/fonts/graphik-arabic-thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic-extralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic-light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic-semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/graphik-arabic-black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-graphik-arabic",
});

export const metadata: Metadata = {
  title: "Joyin | Discover & Join Events",
  description: "Join exciting events happening near you. Create, manage, and book event tickets easily.",
};

import { GlobalShareModal } from "@/components/GlobalShareModal";

import { LanguageProvider } from "@/lib/language-context";
import { Language } from "@/lib/translations";
import Script from "next/script";
import { cookies, headers } from "next/headers";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const cookieStore = await cookies();
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  
  // Prefer URL lang, then cookie, then header
  let language: Language;
  
  if (lang === "ar") {
    language = "ar-EG";
  } else if (lang === "en") {
    language = "en";
  } else {
    language = (cookieStore.get("app-language")?.value as Language) || 
               (acceptLanguage?.startsWith("ar") ? "ar-EG" : "en");
  }
  
  const dir = language === "ar-EG" ? "rtl" : "ltr";

  return (
    <html 
      lang={language.split("-")[0]} 
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${graphikArabic.variable}`} 
      data-theme="dark"
    >
      <body className="antialiased">
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <LanguageProvider initialLanguage={language}>
          <AuthProvider>
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
