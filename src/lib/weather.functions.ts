import { createServerFn } from "@tanstack/react-start";
import { format, addDays, parseISO } from "date-fns";
import type { Coordinates, DailyWeather, WeatherForecast } from "./weather.types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export interface ForecastInput {
  latitude: number;
  longitude: number;
}

export const fetchForecast = createServerFn({ method: "POST" })
  .validator((data: ForecastInput) => data)
  .handler(async ({ data }): Promise<WeatherForecast> => {
    const url = new URL(OPEN_METEO_URL);
    url.searchParams.set("latitude", String(data.latitude));
    url.searchParams.set("longitude", String(data.longitude));
    url.searchParams.set(
      "daily",
      "temperature_2m_max,precipitation_probability_max,relative_humidity_2m_mean"
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("temperature_unit", "fahrenheit");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Weather service unavailable: ${response.status}`);
    }

    const payload = (await response.json()) as OpenMeteoResponse;
    const daily = payload.daily;

    const days: DailyWeather[] = daily.time.map((time, index) => {
      const tempMaxF = daily.temperature_2m_max[index] ?? 0;
      const tempMaxC = fahrenheitToCelsius(tempMaxF);
      const rainChance = daily.precipitation_probability_max[index] ?? 0;
      const humidity = daily.relative_humidity_2m_mean[index] ?? 0;
      const date = parseISO(time);
      const score = calculateWalkScore(tempMaxC, rainChance, humidity);

      return {
        date: time,
        dayName: index === 0 ? "Today" : format(date, "EEEE"),
        tempMaxC,
        tempMaxF,
        rainChance,
        humidity,
        score,
        ratingLabel: scoreToLabel(score),
      };
    });

    return {
      location: "Your location",
      days,
    };
  });

function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

function calculateWalkScore(tempC: number, rainChance: number, humidity: number): number {
  // Ideal walking temperature is around 15-22°C. Penalize deviation.
  const tempScore = Math.max(0, 100 - Math.pow(Math.max(0, Math.abs(tempC - 18.5) - 3.5), 2) * 2.5);

  // Lower rain chance is better.
  const rainScore = 100 - rainChance;

  // Humidity: 40-60% is ideal. Penalize high humidity more than low.
  const humidityPenalty = humidity > 60 ? (humidity - 60) * 1.5 : Math.max(0, (40 - humidity) * 0.5);
  const humidityScore = Math.max(0, 100 - humidityPenalty);

  const weights = { temp: 0.45, rain: 0.35, humidity: 0.2 };
  const raw = tempScore * weights.temp + rainScore * weights.rain + humidityScore * weights.humidity;

  return Math.min(100, Math.max(0, Math.round(raw)));
}

function scoreToLabel(score: number): string {
  if (score >= 90) return "Perfect";
  if (score >= 75) return "Great";
  if (score >= 60) return "Good";
  if (score >= 45) return "Fair";
  if (score >= 30) return "Poor";
  return "Ruff";
}

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    precipitation_probability_max: number[];
    relative_humidity_2m_mean: number[];
  };
}
