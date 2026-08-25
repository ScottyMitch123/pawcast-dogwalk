interface RatingRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function RatingRing({ score, size = 72, strokeWidth = 8 }: RatingRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreToColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{score}</span>
    </div>
  );
}

export function scoreToColor(score: number): string {
  // Red (0) -> Yellow (50) -> Green (100)
  if (score <= 50) {
    const t = score / 50;
    return interpolateColor("#ef4444", "#eab308", t);
  }
  const t = (score - 50) / 50;
  return interpolateColor("#eab308", "#22c55e", t);
}

function interpolateColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const bh = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const rh = Math.round(ah + (bh - ah) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);

  return `rgb(${rh}, ${rg}, ${rb})`;
}
