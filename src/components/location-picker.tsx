import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Loader2, Search, LocateFixed, ChevronDown } from "lucide-react";

import { searchLocations } from "@/lib/geocode.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { LocationResult } from "@/lib/weather.types";

interface LocationPickerProps {
  label: string;
  isLocating: boolean;
  onSelect: (location: LocationResult) => void;
  onUseCurrent: () => void;
}

export function LocationPicker({ label, isLocating, onSelect, onUseCurrent }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["geocode", debounced],
    queryFn: () => searchLocations({ data: { query: debounced } }),
    enabled: debounced.length >= 2,
    staleTime: 1000 * 60 * 60,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change location"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <MapPin className="h-4 w-4 text-primary" />
          )}
          <span className="max-w-[16rem] truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-80 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or town..."
            aria-label="Search for a location"
            className="pl-9"
          />
        </div>

        <div className="mt-2 max-h-64 overflow-y-auto">
          {isFetching && (
            <p className="px-2 py-3 text-sm text-muted-foreground">Searching...</p>
          )}
          {!isFetching && debounced.length >= 2 && results.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted-foreground">No matches found.</p>
          )}
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => {
                onSelect(result);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{result.label}</span>
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => {
            onUseCurrent();
            setOpen(false);
          }}
        >
          <LocateFixed className="h-4 w-4 text-primary" />
          Use my current location
        </Button>
      </PopoverContent>
    </Popover>
  );
}
