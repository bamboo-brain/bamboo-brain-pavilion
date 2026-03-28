"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ready.module.css";

const LEVELS = [
  { id: "absolute", title: "Absolute Beginner", desc: "No prior knowledge of Mandarin" },
  { id: "foundation", title: "Foundation", desc: "Basic phrases and essential characters." },
  { id: "elementary", title: "Elementary", desc: "Daily interactions and sentence patterns." },
  { id: "intermediate", title: "Intermediate", desc: "Complex thoughts and social topics." },
  { id: "proficient", title: "Proficient", desc: "Professional dialogue and news media." },
  { id: "master", title: "Master", desc: "Literature, history, and deep culture." },
  { id: "native", title: "Native-Like", desc: "Full fluency and academic research." },
];

const INTERESTS = [
  { id: "business", title: "Business" },
  { id: "travel", title: "Travel" },
  { id: "calligraphy", title: "Calligraphy" },
  { id: "hsk", title: "HSK Prep" },
  { id: "history", title: "History" },
  { id: "literature", title: "Literature" },
];

function getInterestIcon(id: string) {
  switch (id) {
    case "business":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
    case "travel":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
    case "calligraphy":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2z" /><path d="m9 18 3-3 3 3" /></svg>;
    case "hsk":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
    case "history":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
    case "literature":
    default:
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
  }
}

function ReadyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const levelParam = searchParams.get("level") || "intermediate";
  const interestParams = searchParams.getAll("interest").length > 0 ? searchParams.getAll("interest") : ["business", "history"];

  const selectedLevel = LEVELS.find(l => l.id === levelParam);

  const displayedInterests = interestParams.slice(0, 2); // Show up to 2 for layout

  return (
    <div className={styles.container}>
      <div className={styles.grid}>

        {/* Left Typography Column */}
        <div className={styles.leftColumn}>
          <div className={styles.badge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0c4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            Journey Prepared
          </div>

          <h1 className={styles.title}>
            The Grove is <br />
            <span className={styles.titleItalic}>Calling.</span>
          </h1>

          <p className={styles.description}>
            Your curriculum has been curated. You are ready to step into your dedicated study space.
          </p>

          <div className={styles.avatarGroup}>
            <div className={styles.avatars}>
              <img src="https://i.pravatar.cc/100?img=68" alt="Scholar" className={styles.avatar} />
              <img src="https://i.pravatar.cc/100?img=47" alt="Scholar" className={styles.avatar} />
              <img src="https://i.pravatar.cc/100?img=33" alt="Scholar" className={styles.avatar} />
            </div>
            <p className={styles.avatarText}>Join 12,000 scholars today</p>
          </div>
        </div>

        {/* Right Card Column */}
        <div className={styles.rightColumn}>

          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Pathway Summary</h2>
            </div>

            <div className={styles.summaryContent}>

              {/* Level Tag */}
              <div className={styles.summaryItem}>
                <div className={styles.summaryIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                </div>
                <div className={styles.summaryItemContent}>
                  <p className={styles.summaryItemLabel}>Current Level</p>
                  <p className={styles.summaryItemText}>
                    {selectedLevel?.title || "HSK 3 - Intermediate"}
                  </p>
                </div>
              </div>

              {/* Interests Grid */}
              <div className={styles.interestsGrid}>
                {displayedInterests.map(id => {
                  const interest = INTERESTS.find(i => i.id === id);
                  return (
                    <div key={id} className={styles.interestCard}>
                      <p className={styles.interestLabel}>Interest</p>
                      <p className={styles.interestName}>
                        <span className="text-[#154212] flex items-center">{getInterestIcon(id)}</span>
                        {interest ? interest.title : "Topic"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Daily Target */}
              <div className={styles.dailyTargetCard}>
                <div className={styles.targetContent}>
                  <p className={styles.targetLabel}>Daily Target</p>
                  <p className={styles.targetDesc}>
                    "Deep Fluency focus, 30 min daily"
                  </p>
                </div>
                <div className={styles.targetIcon}>
                  <p className={styles.targetPercentage}>100%</p>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={() => router.push('/')}
                className={styles.enterButton}
              >
                Enter the Pavilion
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12h14m-7-7 7 7-7 7" /></svg>
              </button>

              <button
                onClick={() => router.push(`/onboarding/interests?${searchParams.toString()}`)}
                className={styles.adjustButton}
              >
                Adjust Selections
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ReadyPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen w-full bg-[#f8faf7]"></div>}>
      <ReadyPageContent />
    </Suspense>
  )
}
