"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import { IoPersonOutline } from "react-icons/io5";
import styles from "./login.module.css";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (user && !loading) {
      router.push("/explore");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const renderButton = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { 
            theme: "outline", 
            size: "large", 
            width: 320,
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left"
          }
        );
      } else {
        setTimeout(renderButton, 1000);
      }
    };

    renderButton();
  }, [user, loading]);

  if (loading) {
    return (
      <div className={styles.authLoading}>
        <div className={styles.spinnerAuth}></div>
      </div>
    );
  }

  return (
    <div className={styles.authPageContainer}>
      {/* Dynamic Blurred Background */}
      <div className={styles.authBackgroundBlobs}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>
      
      <div className={styles.authCardWrapper}>
        <div className={styles.authCard}>
          <div className={styles.authCardHeader}>
            <div className={styles.authIconWrapper}>
              <div className={styles.authIconCircle}>
                <IoPersonOutline size={32} color="#ed2939" />
              </div>
            </div>
            <h1>{t.welcomeBack}</h1>
            <p>{t.signInSubtitle}</p>
          </div>

          <div className={styles.authCardBody}>
            <div id="google-signin-button" className={styles.googleAuthButtonWrapper}></div>
          </div>

          <div className={styles.authCardFooter}>
            <p className={styles.footerTerms}>
              {t.termsAgreement} <a href="#">{t.termsOfService}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
