export function SolidBookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden>
      <rect x="0" y="20" width="8" height="60" />
      <rect x="92" y="20" width="8" height="60" />
      <path d="M11 14 C 28 14, 40 18, 48 23 V 77 C 40 70, 28 66, 11 66 Z" />
      <path d="M89 14 C 72 14, 60 18, 52 23 V 77 C 60 70, 72 66, 89 66 Z" />
      <path d="M11 68 C 28 68, 40 72, 48 79 L 50 78 L 52 79 C 60 72, 72 68, 89 68 V 72 c -15 0, -25 3, -33 8 L 50 85 L 44 80 c -8 -5, -18 -8, -33 -8 Z" />
    </svg>
  );
}
