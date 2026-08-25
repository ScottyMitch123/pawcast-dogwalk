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

export function scoreToRgb(score: number): [number, number, number] {
  const s = Math.min(100, Math.max(0, score));
  if (s <= 50) return interpolateRgb([239, 68, 68], [234, 179, 8], s / 50);
  return interpolateRgb([234, 179, 8], [34, 197, 94], (s - 50) / 50);
}

export function scoreToColor(score: number): string {
  const [r, g, b] = scoreToRgb(score);
  return `rgb(${r}, ${g}, ${b})`;
}

export function scoreToRgba(score: number, alpha: number): string {
  const [r, g, b] = scoreToRgb(score);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function interpolateRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
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
