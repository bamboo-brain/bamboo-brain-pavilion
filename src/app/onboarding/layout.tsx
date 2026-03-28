"use client";

import { usePathname, useRouter } from "next/navigation";
import { LeafIcon } from "@/components/icons/LeafIcon";
import styles from "./layout.module.css";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  let step = 1;
  if (pathname.includes("/interests")) step = 2;
  if (pathname.includes("/calendar")) step = 3;
  if (pathname.includes("/ready")) step = 4;

  const handleStepClick = (s: number) => {
    if (s >= step) return; // Only allow jumping backward
    const qs = window.location.search; // Read dynamically inside click to avoid layout SSR deopts
    if (s === 1) router.push(`/onboarding/welcome${qs}`);
    if (s === 2) router.push(`/onboarding/interests${qs}`);
    if (s === 3) router.push(`/onboarding/calendar${qs}`);
  };

  return (
    <div className={styles.container}>
      
      {/* Absolute background watermark abstract blocks */}
      <div className={styles.watermarkBg}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="maze" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
              <path d="M0,100 L100,100 L100,400 M200,0 L200,200 L400,200 M300,300 L300,400" stroke="#154212" strokeWidth="60" fill="none" strokeLinecap="square" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#maze)" />
        </svg>
      </div>

      <div className={styles.wrapper}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <LeafIcon className={styles.logoIcon} />
            </div>
            <span className={styles.logoText}>BambooBrain</span>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.stepText}>Step {step} of 4</span>
            
            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`${styles.progressSegment} ${s <= step ? styles.filled : ''}`}
                  onClick={() => s < step && handleStepClick(s)}
                  style={{ cursor: s < step ? 'pointer' : 'default' }}
                  title={s < step ? `Go to step ${s}` : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
