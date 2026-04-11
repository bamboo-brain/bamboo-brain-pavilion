export function previewNextInterval(
  intervalDays: number,
  easeFactor: number,
  repetitions: number,
  grade: number,
): number {
  if (grade < 3) return 1;                    // fail → 1 day always
  if (repetitions === 0) return grade === 5 ? 4 : 1; // new card: Easy skips to 4 days, Good stays 1
  if (repetitions === 1) return grade === 5 ? 9 : 6; // second rep: Easy gets slight boost
  return Math.round(intervalDays * easeFactor);
}

export function formatInterval(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 14) return '1 week';
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 60) return '1 month';
  return `${Math.round(days / 30)} months`;
}
