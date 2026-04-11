"use client";

import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/lib/language-context";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      
      <div className="terms-content-container">
        <header className="page-header">
           <h1 className="terms-title">{t.termsOfService}</h1>
        </header>

        <section className="terms-body glass-lux">
           <p className="empty-state">{t.comingSoon}</p>
        </section>
      </div>

      <style jsx>{`
        .terms-content-container {
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .terms-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .terms-body {
          padding: 32px;
          border-radius: 20px;
          background: var(--card-background);
          border: 1px solid var(--border);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state {
          color: var(--secondary-text);
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .terms-content-container { padding: 20px; }
        }
      `}</style>
    </>
  );
}
