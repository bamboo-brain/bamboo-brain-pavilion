"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SolidBookIcon } from "@/components/icons/SolidBookIcon";
import { LeafIcon } from "@/components/icons/LeafIcon";
import styles from "./welcome.module.css";

const LEVELS = [
  { id: "absolute", title: "Absolute Beginner", desc: "No prior knowledge of Mandarin", watermark: "新", hsk: "NONE", badgeColor: "bg-[#154212]" },
  { id: "foundation", hsk: "HSK 1", title: "Foundation", desc: "Basic phrases and essential characters.", watermark: "壹", badgeColor: "bg-[#2a5185]" },
  { id: "elementary", hsk: "HSK 2", title: "Elementary", desc: "Daily interactions and sentence patterns.", watermark: "贰", badgeColor: "bg-[#2a5185]" },
  { id: "intermediate", hsk: "HSK 3", title: "Intermediate", desc: "Complex thoughts and social topics.", watermark: "叁", badgeColor: "bg-[#2a5185]" },
  { id: "proficient", hsk: "HSK 4", title: "Proficient", desc: "Professional dialogue and news media.", watermark: "肆", badgeColor: "bg-[#154212]" },
  { id: "master", hsk: "HSK 5", title: "Master", desc: "Literature, history, and deep culture.", watermark: "伍", badgeColor: "bg-[#154212]" },
  { id: "native", hsk: "HSK 6", title: "Native-Like", desc: "Full flueny and academic research.", watermark: "陆", badgeColor: "bg-[#154212]" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedLevel) {
      router.push(`/onboarding/interests?level=${selectedLevel}`);
    }
  };

  const handlePlacementTest = () => {
    router.push('/onboarding/placement');
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainGrid}>

        {/* Left Column: Typography & Narrative */}
        <div className={styles.leftColumn}>

        {/* Pill */}
          <div className={styles.badge}>
            <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            The Scholar's Path
          </div>

          {/* Title */}
          <div className={styles.title}>
            <span className={styles.titleLine}>Begin your</span>
            <span className={`${styles.titleLine} ${styles.italic}`}>Mandarin</span>
            <span className={`${styles.titleLine} ${styles.last}`}>journey here.</span>
          </div>

          {/* Description */}
          <div className={styles.description}>
            Welcome to the Digital Scholar's Pavilion. To personalize your curriculum, please select your current proficiency level.
          </div>

        {/* Confucius Quote Box */}
        <div className={styles.quoteBox}>
          <div className={styles.quoteContent}>
            <p className={styles.quoteHanzi}>
              学而不思则罔
            </p>
            <p className={styles.quoteText}>
              "Learning without thought is labor lost." — Confucius
            </p>
          </div>
          <div className={styles.bookIcon}>
            <SolidBookIcon />
          </div>
        </div>
        </div>

        {/* Right Column: Interaction Cards */}
        <div className={styles.rightColumn}>

          {/* Absolute Beginner Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedLevel(LEVELS[0].id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedLevel(LEVELS[0].id); }}
            className={`${styles.card} ${styles.largeCard} ${selectedLevel === LEVELS[0].id ? styles.selected : ''}`}
          >
            <div className={styles.largeCardIcon}>
              <LeafIcon className={styles.largeCardIconInner} />
            </div>
            <div className={styles.largeCardContent}>
              <h3 className={styles.largeCardTitle}>{LEVELS[0].title}</h3>
              <p className={styles.largeCardDesc}>{LEVELS[0].desc}</p>
            </div>
            <span className={styles.largeCardWatermark}>
              {LEVELS[0].watermark}
            </span>
          </div>

          {/* 3 Col Grid */}
          <div className={styles.cardGrid}>
            {LEVELS.slice(1).map((lvl) => (
              <div
                key={lvl.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedLevel(lvl.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedLevel(lvl.id); }}
                className={`${styles.card} ${styles.levelCard} ${selectedLevel === lvl.id ? styles.selected : ''}`}
              >
                <div className={styles.levelCardHeader}>
                  <div 
                    className={styles.levelCardBadge}
                    style={{ backgroundColor: lvl.badgeColor.replace('bg-[', '').replace(']', '') }}
                  >
                    {lvl.hsk}
                  </div>
                  <svg className={styles.levelCardChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
                  </svg>
                </div>

                <h3 className={styles.levelCardTitle}>{lvl.title}</h3>
                <p className={styles.levelCardDesc}>{lvl.desc}</p>

                <span className={styles.levelCardWatermark}>
                  {lvl.watermark}
                </span>
              </div>
            ))}
          </div>

          {/* Placement Test CTA */}
          <div className={`${styles.card} ${styles.placementCard}`}>
            <div className={styles.placementCardLeft}>
              <div className={styles.placementCardIcon}>
                <SolidBookIcon className={styles.placementCardIconInner} />
              </div>
              <div className={styles.placementCardText}>
                <h3>Need a placement test?</h3>
                <p>Let our AI assess your current vocabulary.</p>
              </div>
            </div>
            <button
              onClick={handlePlacementTest}
              className={styles.placementButton}
            >
              Get Started
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Next Step Action */}
          <div className={styles.footerActions}>
            <button
              onClick={handleNext}
              disabled={!selectedLevel}
              className={styles.nextButton}
            >
              Next Step
              <svg className={styles.nextButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
