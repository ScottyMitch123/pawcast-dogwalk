import { CloudRain, Droplets, Sunrise, Sunset, Thermometer } from "lucide-react";
import { RatingRing, scoreToColor, scoreToRgba } from "./rating-ring";
import type { DailyWeather } from "@/lib/weather.types";

interface WeatherCardProps {
  day: DailyWeather;
  unit: "imperial" | "metric";
}

export function WeatherCard({ day, unit }: WeatherCardProps) {
  const cardColor = scoreToColor(day.score);

  return (
    <div
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{
        borderColor: scoreToRgba(day.score, 0.35),
        backgroundImage: `linear-gradient(145deg, ${scoreToRgba(day.score, 0.28)} 0%, ${scoreToRgba(day.score, 0.08)} 100%)`,
        backgroundColor: "var(--card)",
      }}
    >

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{day.dayName}</h3>
          <p className="text-xs text-muted-foreground">{day.date}</p>
        </div>
        <RatingRing score={day.score} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <Metric
          icon={<Thermometer className="h-4 w-4 text-orange-500" />}
          value={unit === "imperial" ? `${day.tempMaxF}°F` : `${day.tempMaxC}°C`}
          label="High"
        />
        <Metric
          icon={<CloudRain className="h-4 w-4 text-blue-500" />}
          value={`${day.rainChance}%`}
          label="Rain"
        />
        <Metric
          icon={<Droplets className="h-4 w-4 text-cyan-500" />}
          value={`${day.humidity}%`}
          label="Humidity"
        />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `color-mix(in srgb, ${cardColor} 20%, transparent)`,
            color: cardColor,
          }}
        >
          {day.ratingLabel}
        </span>

        <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Sunrise className="h-4 w-4 shrink-0 text-sunrise" strokeWidth={2.5} />
            <span>{day.sunrise}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="h-4 w-4 shrink-0 text-sunset" strokeWidth={2.5} />
            <span>{day.sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricProps {
  icon: React.ReactNode;
  value: string;
  sub?: string;
  label: string;
}

function Metric({ icon, value, sub, label }: MetricProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-background/60 p-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="font-semibold text-foreground">
        {value}
        {sub && <span className="ml-1 text-xs font-normal text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
