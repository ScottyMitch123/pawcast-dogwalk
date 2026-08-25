import { createServerFn } from "@tanstack/react-start";
import type { LocationResult } from "./weather.types";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const searchLocations = createServerFn({ method: "POST" })
  .validator((data: { query: string }) => data)
  .handler(async ({ data }): Promise<LocationResult[]> => {
    const query = data.query.trim();
    if (query.length < 2) return [];

    const url = new URL(GEOCODE_URL);
    url.searchParams.set("name", query);
    url.searchParams.set("count", "6");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const payload = (await response.json()) as {
      results?: Array<{
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        admin1?: string;
        country?: string;
      }>;
    };

    return (payload.results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  });
