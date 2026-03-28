"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./interests.module.css";

const INTERESTS = [
  { id: "business", title: "Business Chinese", desc: "Negotiation, professional etiquette, and corporate vocabulary for the modern market.", watermark: "商务" },
  { id: "travel", title: "Travel & Culture", desc: "Navigate landscapes and customs with grace. Essential phrases for the curious traveler.", watermark: "旅行" },
  { id: "calligraphy", title: "Calligraphy", desc: "The art of the brush. Master the aesthetic structure and history of traditional Hanzi characters.", watermark: "书法" },
  { id: "hsk", title: "HSK Exam Prep", desc: "Rigorous structured learning aligned with official proficiency standards.", watermark: "考试" },
  { id: "history", title: "History", desc: "The lineage of the Middle Kingdom through classic literature and dynastic tales.", watermark: "历史" },
  { id: "literature", title: "Classical Literature", desc: "From Tang Poetry to modern prose. Explore the soul of the language through its greatest writers.", watermark: "文学" },
];

function getIconForInterest(id: string, isSelected: boolean) {
  const color = isSelected ? "currentColor" : "#154212";
  switch (id) {
    case "business":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case "travel":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
    case "calligraphy":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2z"/><path d="m9 18 3-3 3 3"/></svg>;
    case "hsk":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
    case "history":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case "literature":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    default:
      return null;
  }
}

function InterestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "foundation";

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    params.set("level", level);
    selectedInterests.forEach(int => params.append("interest", int));
    router.push(`/onboarding/calendar?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div className={styles.headerArea}>
        <div className={styles.watermarkText}>兴趣</div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Cultivate your path</h1>
          <p className={styles.description}>
            Select 3 or more areas that align with your scholarly pursuits. We will tailor your curriculum to reflect these disciplines.
          </p>
        </div>
      </div>

      {/* Interest Cards Grid */}
      <div className={styles.cardsGrid}>
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <div
              key={interest.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => toggleInterest(interest.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleInterest(interest.id); }}
            >
              <div className={styles.cardIcon}>
                {getIconForInterest(interest.id, isSelected)}
              </div>
              
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{interest.title}</h3>
                <p className={styles.cardDesc}>{interest.desc}</p>
              </div>

              <div className={styles.cardWatermark}>{interest.watermark}</div>

              {isSelected && (
                <div className={styles.checkmark}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Bottom Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.selectionStatus}>
          Selected: <span className={`${styles.statusCount} ${selectedInterests.length >= 3 ? '' : styles.error}`}>{selectedInterests.length}</span> / 3 minimum
        </div>
        
        <div className={styles.actionButtons}>
          <button 
            onClick={() => router.push(`/onboarding/calendar?level=${level}`)}
            className={styles.skipButton}
          >
            Skip for now
          </button>
          <button 
            onClick={handleNext}
            disabled={selectedInterests.length < 3}
            className={styles.nextButton}
          >
            Next Step
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterestsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-[#f2f4f1] rounded-2xl w-full max-w-4xl mx-auto"></div>}>
      <InterestsPageContent />
    </Suspense>
  )
}
