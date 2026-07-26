// Rotating radial-ray backdrop used behind "reveal" moments (top page hero, result screen
// portrait) so both share the same dramatic, gacha-reveal energy as the character art
// itself, rather than a plain flat background.
export function Sunburst({ glowColor, className = "" }: { glowColor: string; className?: string }) {
  return (
    <div
      className={`animate-slow-spin pointer-events-none absolute rounded-full ${className}`}
      style={{
        background: `repeating-conic-gradient(${glowColor} 0deg 4deg, transparent 4deg 18deg)`,
      }}
    />
  );
}
