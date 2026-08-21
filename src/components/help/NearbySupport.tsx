"use client";

import { FormEvent, useRef, useState } from "react";
import { ProviderResultCard } from "@/components/help/ProviderResultCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DIRECT_HELP_SERVICES,
  HELP_SERVICES,
  type HelpServiceType,
} from "@/lib/helpResources";
import {
  INITIAL_SEARCH_RADIUS_METRES,
  WIDE_SEARCH_RADIUS_METRES,
  geocodeAustralianArea,
  isSupportedProviderService,
  searchHealthcareProviders,
  type Coordinates,
  type HealthcareProvider,
  type SupportedProviderService,
} from "@/lib/osmProviderSearch";
import {
  cacheProviderResults,
  formatCacheAge,
  isCacheableProviderService,
  readCachedProviderResults,
} from "@/lib/providerResultCache";

type SearchState = "idle" | "locating" | "geocoding" | "searching" | "success" | "cached" | "empty" | "error";

type SearchOrigin = Coordinates & {
  label: string;
};

export function NearbySupport({
  initialService,
  onBack,
}: {
  initialService?: HelpServiceType;
  onBack: () => void;
}) {
  const [service, setService] = useState<HelpServiceType>(initialService ?? "pharmacy");
  const [area, setArea] = useState("");
  const [origin, setOrigin] = useState<SearchOrigin | null>(null);
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [message, setMessage] = useState("");
  const [searchedWide, setSearchedWide] = useState(false);
  const [canRetryProviderSearch, setCanRetryProviderSearch] = useState(false);
  const [cachedTimestamp, setCachedTimestamp] = useState<number | null>(null);
  const requestController = useRef<AbortController | null>(null);
  const providerSearchInFlight = useRef(false);

  const selectedService = HELP_SERVICES.find((item) => item.id === service);
  const serviceSupported = isSupportedProviderService(service);

  async function runProviderSearch(
    searchOrigin: SearchOrigin,
    selected: SupportedProviderService,
    radiusMetres = INITIAL_SEARCH_RADIUS_METRES,
  ) {
    if (providerSearchInFlight.current) return;
    providerSearchInFlight.current = true;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setSearchState("searching");
    setMessage("");
    setProviders([]);
    setCanRetryProviderSearch(false);
    setCachedTimestamp(null);

    try {
      const results = await searchHealthcareProviders({
        service: selected,
        origin: searchOrigin,
        radiusMetres,
        signal: controller.signal,
      });
      setProviders(results);
      if (results.length > 0 && isCacheableProviderService(selected)) {
        cacheProviderResults({
          service: selected,
          origin: searchOrigin,
          providers: results,
        });
      }
      setSearchState(results.length > 0 ? "success" : "empty");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCanRetryProviderSearch(true);
      const cached = isCacheableProviderService(selected)
        ? readCachedProviderResults(selected, searchOrigin)
        : null;
      if (cached) {
        setProviders(cached.providers);
        setCachedTimestamp(cached.timestamp);
        setSearchState("cached");
        setMessage("");
      } else {
        setSearchState("error");
        setMessage(
          "Nearby services could not be loaded right now. Please wait a moment and try again.",
        );
      }
    } finally {
      providerSearchInFlight.current = false;
    }
  }

  function useLocation() {
    if (!serviceSupported) return;
    if (!navigator.geolocation) {
      setSearchState("error");
      setCanRetryProviderSearch(false);
      setMessage(
        "Location is not available in this browser. Enter a suburb or postcode instead.",
      );
      return;
    }

    setSearchState("locating");
    setMessage("");
    setCanRetryProviderSearch(false);
    setCachedTimestamp(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextOrigin: SearchOrigin = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: "your location",
        };
        setOrigin(nextOrigin);
        setSearchedWide(false);
        void runProviderSearch(nextOrigin, service);
      },
      () => {
        setSearchState("error");
        setCanRetryProviderSearch(false);
        setMessage(
          "We could not use your location. You can still enter a suburb or postcode below.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function searchArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = area.trim();
    if (!trimmed || !serviceSupported) return;

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setSearchState("geocoding");
    setMessage("");
    setProviders([]);
    setCanRetryProviderSearch(false);
    setCachedTimestamp(null);

    try {
      const place = await geocodeAustralianArea(trimmed, controller.signal);
      if (!place) {
        setSearchState("error");
        setCanRetryProviderSearch(false);
        setMessage(
          "We could not find that Australian suburb or postcode. Check the spelling and try again.",
        );
        return;
      }

      const nextOrigin: SearchOrigin = {
        latitude: place.latitude,
        longitude: place.longitude,
        label: place.displayName,
      };
      setOrigin(nextOrigin);
      setSearchedWide(false);
      await runProviderSearch(nextOrigin, service);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSearchState("error");
      setCanRetryProviderSearch(false);
      setMessage(
        "The suburb or postcode search is unavailable right now. Please try again shortly.",
      );
    }
  }

  function changeService(nextService: HelpServiceType) {
    setService(nextService);
    setSearchedWide(false);
    setMessage("");
    setCanRetryProviderSearch(false);
    setCachedTimestamp(null);

    if (!isSupportedProviderService(nextService)) {
      requestController.current?.abort();
      setProviders([]);
      setSearchState("idle");
      return;
    }

    if (origin) void runProviderSearch(origin, nextService);
  }

  function searchWider() {
    if (!origin || !serviceSupported || searchedWide) return;
    setSearchedWide(true);
    void runProviderSearch(origin, service, WIDE_SEARCH_RADIUS_METRES);
  }

  function retryProviderSearch() {
    if (!origin || !serviceSupported || providerSearchInFlight.current) return;
    const radius = searchedWide
      ? WIDE_SEARCH_RADIUS_METRES
      : INITIAL_SEARCH_RADIUS_METRES;
    void runProviderSearch(origin, service, radius);
  }

  const isBusy = searchState === "locating" || searchState === "geocoding" || searchState === "searching";
  const resultHeading = {
    pharmacy: "Nearby pharmacies",
    gp: "Nearby GPs and clinics",
    "sexual-health-clinic": "Nearby sexual health clinics",
    "other-health-service": "Nearby health services",
  }[service];
  const searchingMessage = {
    pharmacy: "Finding nearby pharmacies…",
    gp: "Finding nearby GPs…",
    "sexual-health-clinic": "Finding nearby sexual health services…",
    "other-health-service": "Finding nearby health services…",
  }[service];

  return (
    <div className="pb-12 pt-16 sm:pt-14">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex rounded-full bg-surface px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:text-primary-dark hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
      >
        ← Back
      </button>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-accent">Find Help</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Find support near you</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-text-muted">
        With your permission, Blossom can use your location to look for nearby healthcare services. Your location is not stored.
      </p>

      <Card className="mt-8">
        <fieldset disabled={isBusy}>
          <legend className="text-base font-semibold text-foreground">What kind of support do you need?</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {DIRECT_HELP_SERVICES.map((item) => {
              const selected = service === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => changeService(item.id)}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:opacity-60 ${selected ? "border-primary bg-primary-soft text-foreground" : "border-border bg-surface text-text-muted hover:border-primary/50 hover:text-foreground"}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {!serviceSupported ? (
          <div className="mt-6 rounded-xl border border-secondary/30 bg-secondary-soft p-4">
            <p className="text-sm font-semibold text-foreground">Nearby search for {selectedService?.label.toLowerCase()} is not available yet.</p>
            <p className="mt-1 text-sm text-text-muted">Pharmacy, GP / doctor, and sexual health clinic searches are available in this version.</p>
          </div>
        ) : (
          <div className="mt-6 border-t border-border pt-6">
            <Button type="button" onClick={useLocation} disabled={isBusy}>
              {searchState === "locating" ? "Finding your location…" : "Use my location"}
            </Button>

            <div className="my-5 flex items-center gap-3" aria-hidden>
              <div className="h-px flex-1 bg-border" />
              <span className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Or enter your suburb / postcode</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={searchArea} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="help-area">Suburb or postcode</label>
              <input
                id="help-area"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="For example, Carlton or 3053"
                disabled={isBusy}
                className="min-w-0 flex-1 rounded-full border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-60"
              />
              <Button type="submit" variant="secondary" disabled={!area.trim() || isBusy}>
                {searchState === "geocoding" ? "Finding area…" : "Search this area"}
              </Button>
            </form>
            <p className="mt-4 text-xs leading-relaxed text-text-muted">
              Nearby results may occasionally take a moment to load. If they
              do not appear, try again or browse nearby options on Google Maps.
            </p>
          </div>
        )}
      </Card>

      {searchState === "searching" && (
        <Card className="mt-5 border-secondary/30 bg-secondary-soft">
          <p role="status" className="text-sm font-semibold text-foreground">{searchingMessage}</p>
        </Card>
      )}

      {searchState === "error" && message && (
        <Card className="mt-5 border-warning/50 bg-warning/10">
          <p role="alert" className="text-sm font-semibold text-foreground">{message}</p>
          {canRetryProviderSearch && origin && serviceSupported && (
            <div className="mt-4">
              <Button type="button" variant="secondary" onClick={retryProviderSearch} disabled={isBusy}>
                Try again
              </Button>
            </div>
          )}
        </Card>
      )}

      {searchState === "cached" && cachedTimestamp && origin && serviceSupported && (
        <Card className="mt-5 border-warning/50 bg-warning/10">
          <h2 className="text-lg font-semibold text-foreground">
            Live search is temporarily unavailable
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            These real OpenStreetMap results were retrieved recently and may
            not reflect changes made since then.
          </p>
          <p className="mt-2 text-xs font-semibold text-foreground">
            {formatCacheAge(cachedTimestamp)}
          </p>
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={retryProviderSearch} disabled={isBusy}>
              Try again
            </Button>
          </div>
        </Card>
      )}

      {searchState === "empty" && (
        <Card className="mt-5 border-secondary/30 bg-secondary-soft">
          <h2 className="text-lg font-semibold text-foreground">No {selectedService?.label.toLowerCase()} services found nearby</h2>
          <p className="mt-1 text-sm text-text-muted">
            OpenStreetMap did not return a matching service {searchedWide ? "within 8 km" : "within 4 km"}. Its listings may not be complete.
          </p>
          {!searchedWide && (
            <div className="mt-4">
              <Button type="button" variant="secondary" onClick={searchWider}>Search within 8 km</Button>
            </div>
          )}
        </Card>
      )}

      {(searchState === "success" || searchState === "cached") && providers.length > 0 && origin && (
        <section className="mt-8" aria-labelledby="nearby-results-heading">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="nearby-results-heading" className="text-2xl font-semibold text-foreground">
                {searchState === "cached"
                  ? service === "pharmacy"
                    ? "Showing recently found pharmacies"
                    : "Showing recently found GPs and clinics"
                  : resultHeading}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-text-muted">Closest results near {origin.label}</p>
            </div>
            <p className="text-xs text-text-muted">
              {searchState === "cached"
                ? "Recently retrieved near this area"
                : `${service === "gp" ? "Best service match, then distance" : "Nearest first"} · within ${searchedWide ? "8 km" : "4 km"}`}
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {providers.map((provider) => (
              <ProviderResultCard key={provider.id} provider={provider} origin={origin} />
            ))}
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Provider data ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-foreground">OpenStreetMap contributors</a>.
            Details may be incomplete; contact the service to confirm.
          </p>
        </section>
      )}

      {(service === "pharmacy" || service === "gp") && (
        <GoogleMapsBrowse service={service} origin={origin} />
      )}
    </div>
  );
}

function GoogleMapsBrowse({
  service,
  origin,
}: {
  service: "pharmacy" | "gp";
  origin: SearchOrigin | null;
}) {
  const options =
    service === "pharmacy"
      ? [
          { label: "All pharmacies", query: "pharmacies" },
          { label: "Chemist Warehouse", query: "Chemist Warehouse" },
          { label: "Priceline Pharmacy", query: "Priceline Pharmacy" },
        ]
      : [{ label: "GPs near me", query: "GP doctors" }];

  return (
    <Card className="mt-8 border-secondary/30 bg-secondary-soft p-5">
      <h2 className="text-lg font-semibold text-foreground">
        Want to see more options?
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Browse nearby services on Google Maps.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <a
            key={option.label}
            href={getGoogleMapsSearchUrl(option.query, origin)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border-2 border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/25"
          >
            {option.label} →
          </a>
        ))}
      </div>
    </Card>
  );
}

function getGoogleMapsSearchUrl(query: string, origin: SearchOrigin | null) {
  const location = origin
    ? `${origin.latitude.toFixed(6)},${origin.longitude.toFixed(6)}`
    : null;
  const params = new URLSearchParams({
    api: "1",
    query: location ? `${query} near ${location}` : query,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
