"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SolidBookIcon } from "@/components/icons/SolidBookIcon";
import styles from "./calendar.module.css";

function CalendarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gcalEnabled, setGcalEnabled] = useState(false);
  const [microsoftEnabled, setMicrosoftEnabled] = useState(false);

  const handleNext = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("gcal", gcalEnabled ? "1" : "0");
    params.set("microsoft", microsoftEnabled ? "1" : "0");
    router.push(`/onboarding/ready?${params.toString()}`);
  };

  const handleSkip = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("gcal", "0");
    params.set("microsoft", "0");
    router.push(`/onboarding/ready?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>

        {/* Left Column */}
        <div className={styles.leftColumn}>
          <h1 className={styles.title}>
            Sync Your <br className="hidden lg:block"/>
            <span className={styles.titleItalic}>Scholar's Path</span>
          </h1>

          <p className={styles.description}>
            Architecture requires timing. By integrating your calendar, BambooBrain weaves study sessions and HSK deadlines directly into your daily flow, preventing the clutter of missed opportunities.
          </p>

          <div className={styles.featuresGrid}>
            {/* Feature 1 */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.type1}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Automated Rhythm</h3>
              <p className={styles.featureDesc}>We find the quiet gaps in your day for deep Mandarin focus.</p>
            </div>

            {/* Feature 2 */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.type2}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Gentle Reminders</h3>
              <p className={styles.featureDesc}>Sync HSK exam dates and review milestones to stay on track.</p>
            </div>
          </div>

          {/* Confucius Quote */}
          <div className={styles.quoteCard}>
            <p className={styles.quoteHanzi}>温故而知新，可以为师矣。</p>
            <p className={styles.quoteText}>"Review the past to know the future." — Confucius</p>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>

          <div className={styles.connectCard}>
            <h2 className={styles.connectTitle}>Connect Account</h2>

            <div className={styles.connectOptions}>
              {/* Google connect */}
              <button
                className={`${styles.connectOption} ${gcalEnabled ? styles.connectOptionActive : ''}`}
                onClick={() => setGcalEnabled(v => !v)}
              >
                <div className={styles.connectOptionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className={styles.connectOptionContent}>
                  <p className={styles.connectOptionLabel}>Connect Google Calendar</p>
                  <p className={styles.connectOptionDesc}>Sync with your personal planner</p>
                </div>
                <div className={styles.connectOptionArrow}>
                  {gcalEnabled
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#154212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  }
                </div>
              </button>

              {/* Microsoft connect */}
              <button
                className={`${styles.connectOption} ${microsoftEnabled ? styles.connectOptionActive : ''}`}
                onClick={() => setMicrosoftEnabled(v => !v)}
              >
                <div className={styles.connectOptionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0078D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className={styles.connectOptionContent}>
                  <p className={styles.connectOptionLabel}>Connect Microsoft Account</p>
                  <p className={styles.connectOptionDesc}>Outlook & Office 365 events</p>
                </div>
                <div className={styles.connectOptionArrow}>
                  {microsoftEnabled
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#154212" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  }
                </div>
              </button>
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleNext} className={styles.primaryButton}>
                Next Step
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12h14m-7-7 7 7-7 7"/></svg>
              </button>

              <button onClick={handleSkip} className={styles.skipButton}>
                Skip for now
              </button>
            </div>

            <div className={styles.securityInfo}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-7 7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM17 11V7a5 5 0 0 0-10 0v4h2V7a3 3 0 0 1 6 0v4h2z"/></svg>
              <span>Privacy First. We never read your private events.</span>
            </div>
          </div>

          {/* Bamboo Gradient Image */}
          <div className={styles.bambooImage}>
             <div className={styles.bambooImageWrapper}>
               <img
                 src="/img/bamboo-onboarding.jpg"
                 alt="Bamboo forest"
               />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-[#f2f4f1] rounded-2xl w-full max-w-4xl mx-auto"></div>}>
      <CalendarPageContent />
    </Suspense>
  )
}
