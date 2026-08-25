import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapPin, Loader2, Dog } from "lucide-react";

import { fetchForecast } from "@/lib/weather.functions";
import { WeatherCard } from "@/components/weather-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Coordinates } from "@/lib/weather.types";

const DEFAULT_COORDS: Coordinates = { latitude: 40.7128, longitude: -74.006 }; // New York City

const forecastQueryOptions = (coords: Coordinates) =>
  queryOptions({
    queryKey: ["forecast", coords.latitude, coords.longitude],
    queryFn: () => fetchForecast({ data: coords }),
    staleTime: 1000 * 60 * 10,
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PawCast | Dog Walking Weather" },
      { name: "description", content: "7-day dog walking weather forecast with walk quality ratings based on temperature, rain chance, and humidity." },
      { property: "og:title", content: "PawCast | Dog Walking Weather" },
      { property: "og:description", content: "7-day dog walking weather forecast with walk quality ratings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(forecastQueryOptions(DEFAULT_COORDS));
  },
  component: Index,
  errorComponent: ({ error }) => (
    <div role="alert" className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Forecast failed</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
});

function Index() {
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [locationStatus, setLocationStatus] = useState<string>("Using default location");
  const [isLocating, setIsLocating] = useState(false);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus("Using your location");
          setIsLocating(false);
        },
        () => {
          setLocationStatus("Location unavailable — using default");
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const { data: forecast } = useSuspenseQuery(forecastQueryOptions(coords));

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <Dog className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            PawCast
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground md:text-lg">
            7-day dog walking weather with a quality score for every day. Green means go, red means
            maybe a quick potty break.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{locationStatus}</span>
            </div>
            <ToggleGroup
              type="single"
              value={unit}
              onValueChange={(value) => {
                if (value === "imperial" || value === "metric") setUnit(value);
              }}
              aria-label="Temperature units"
              className="rounded-full border border-border bg-card p-1"
            >
              <ToggleGroupItem value="imperial" aria-label="Use Fahrenheit" className="h-7 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                °F
              </ToggleGroupItem>
              <ToggleGroupItem value="metric" aria-label="Use Celsius" className="h-7 rounded-full px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                °C
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {forecast.days.map((day) => (
            <WeatherCard key={day.date} day={day} unit={unit} />
          ))}
        </section>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          Weather data provided by Open-Meteo. Ratings are estimates for light walks; adjust for
          your dog's breed, age, and health.
        </footer>
      </div>
    </main>
  );
}
