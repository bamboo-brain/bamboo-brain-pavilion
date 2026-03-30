export function MicrosoftIcon({ size = 20, ...props }: { size?: number | string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" fill="none" aria-hidden {...props}>
      <rect x="0" y="0" width="10.8" height="10.8" fill="#F25022" />
      <rect x="12.2" y="0" width="10.8" height="10.8" fill="#7FBA00" />
      <rect x="0" y="12.2" width="10.8" height="10.8" fill="#00A4EF" />
      <rect x="12.2" y="12.2" width="10.8" height="10.8" fill="#FFB900" />
    </svg>
  );
}
