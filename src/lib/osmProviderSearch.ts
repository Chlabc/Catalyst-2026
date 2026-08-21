import type { HelpServiceType } from "@/lib/helpResources";

export const INITIAL_SEARCH_RADIUS_METRES = 4000;
export const WIDE_SEARCH_RADIUS_METRES = 8000;
export const OVERPASS_REQUEST_TIMEOUT_MS = 12000;
export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
] as const;

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const FALLBACK_DELAY_MS = 400;

export type SupportedProviderService = Extract<
  HelpServiceType,
  "pharmacy" | "gp" | "sexual-health-clinic"
>;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type HealthcareProvider = Coordinates & {
  id: string;
  kind: "pharmacy" | "gp" | "clinic" | "sexual-health-clinic";
  name?: string;
  address?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  distanceMetres: number;
};

export type GeocodedArea = Coordinates & {
  displayName: string;
};

type OsmTags = Record<string, string | undefined>;

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
};

type OverpassResponse = { elements?: OverpassElement[] };

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export function isSupportedProviderService(
  service: HelpServiceType,
): service is SupportedProviderService {
  return (
    service === "pharmacy" ||
    service === "gp" ||
    service === "sexual-health-clinic"
  );
}

export async function searchHealthcareProviders({
  service,
  origin,
  radiusMetres = INITIAL_SEARCH_RADIUS_METRES,
  signal,
  endpoints = OVERPASS_ENDPOINTS,
  timeoutMs = OVERPASS_REQUEST_TIMEOUT_MS,
}: {
  service: SupportedProviderService;
  origin: Coordinates;
  radiusMetres?: number;
  signal?: AbortSignal;
  endpoints?: readonly string[];
  timeoutMs?: number;
}): Promise<HealthcareProvider[]> {
  const query = buildOverpassQuery(service, origin, radiusMetres);
  if (endpoints.length === 0) {
    throw new Error("No Overpass endpoints are configured.");
  }

  let data: OverpassResponse | null = null;
  let lastError: unknown;

  for (const [index, endpoint] of endpoints.entries()) {
    try {
      data = await requestOverpass(endpoint, query, timeoutMs, signal);
      break;
    } catch (error) {
      if (signal?.aborted) {
        throw new DOMException("Provider search cancelled.", "AbortError");
      }

      lastError = error;
      const mayFailOver =
        error instanceof OverpassAttemptError && error.retryable;
      const hasFallback = index < endpoints.length - 1;
      if (!mayFailOver || !hasFallback) throw error;

      await waitForFallback(FALLBACK_DELAY_MS, signal);
    }
  }

  if (!data) {
    throw lastError ?? new Error("Provider search failed.");
  }

  const providers = (data.elements ?? [])
    .map((element) => toProvider(element, origin, service))
    .filter((provider): provider is HealthcareProvider => provider !== null)
    .sort((a, b) => compareProviders(a, b, service));

  return providers.slice(0, 5);
}

class OverpassAttemptError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "OverpassAttemptError";
  }
}

async function requestOverpass(
  endpoint: string,
  query: string,
  timeoutMs: number,
  externalSignal?: AbortSignal,
): Promise<OverpassResponse> {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new OverpassAttemptError(
        `Provider search failed with status ${response.status}.`,
        retryable,
      );
    }

    let data: OverpassResponse;
    try {
      data = (await response.json()) as OverpassResponse;
    } catch {
      throw new OverpassAttemptError(
        "Provider search returned an invalid response.",
        true,
      );
    }

    if (!Array.isArray(data.elements)) {
      throw new OverpassAttemptError(
        "Provider search returned an incomplete response.",
        true,
      );
    }
    return data;
  } catch (error) {
    if (error instanceof OverpassAttemptError) throw error;
    if (externalSignal?.aborted) {
      throw new DOMException("Provider search cancelled.", "AbortError");
    }
    if (controller.signal.aborted) {
      throw new OverpassAttemptError("Provider search timed out.", true);
    }
    throw new OverpassAttemptError("Provider search network request failed.", true);
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromCaller);
  }
}

function waitForFallback(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Provider search cancelled.", "AbortError"));
      return;
    }

    const finish = () => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    };
    const cancel = () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Provider search cancelled.", "AbortError"));
    };
    const timeoutId = setTimeout(finish, milliseconds);
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

export async function geocodeAustralianArea(
  area: string,
  signal?: AbortSignal,
): Promise<GeocodedArea | null> {
  const params = new URLSearchParams({
    q: `${area}, Australia`,
    format: "jsonv2",
    countrycodes: "au",
    limit: "1",
  });
  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json", "Accept-Language": "en-AU,en" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Area search failed with status ${response.status}.`);
  }

  const results = (await response.json()) as NominatimResult[];
  const first = results[0];
  if (!first) return null;

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return { latitude, longitude, displayName: first.display_name };
}

export function formatDistance(distanceMetres: number) {
  if (distanceMetres < 1000) return `${Math.round(distanceMetres)} m`;
  return `${(distanceMetres / 1000).toFixed(1)} km`;
}

export function getDirectionsUrl(origin: Coordinates, provider: Coordinates) {
  const start = `${origin.latitude.toFixed(6)},${origin.longitude.toFixed(6)}`;
  const destination = `${provider.latitude},${provider.longitude}`;
  const params = new URLSearchParams({
    api: "1",
    origin: start,
    destination,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildOverpassQuery(
  service: SupportedProviderService,
  origin: Coordinates,
  radiusMetres: number,
) {
  const around = `(around:${radiusMetres},${origin.latitude},${origin.longitude})`;
  let selectors: string[];
  if (service === "pharmacy") {
    selectors = [`nwr${around}["amenity"="pharmacy"];`];
  } else if (service === "gp") {
    selectors = [
          `nwr${around}["amenity"="doctors"];`,
          `nwr${around}["healthcare"="doctor"];`,
          `nwr${around}["healthcare"="general_practitioner"];`,
          `nwr${around}["amenity"="clinic"];`,
    ];
  } else {
    const sexualName = "(sexual health|reproductive health|family planning)";
    selectors = [
      `nwr${around}["healthcare:speciality"~"(^|;)(family_planning|venereology|sexual_health|sexual_and_reproductive_health)(;|$)",i];`,
      `nwr${around}["healthcare:counselling"="sexual"];`,
      `nwr${around}["name"~"${sexualName}",i]["amenity"~"^(clinic|doctors|hospital)$"];`,
      `nwr${around}["name"~"${sexualName}",i]["healthcare"];`,
    ];
  }

  return `[out:json][timeout:25];(${selectors.join("")});out center tags;`;
}

function toProvider(
  element: OverpassElement,
  origin: Coordinates,
  service: SupportedProviderService,
): HealthcareProvider | null {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (latitude === undefined || longitude === undefined) return null;

  const tags = element.tags ?? {};
  return {
    id: `${element.type}-${element.id}`,
    kind: classifyProvider(tags, service),
    latitude,
    longitude,
    name: tags.name,
    address: formatAddress(tags),
    openingHours: tags.opening_hours,
    phone: tags.phone ?? tags["contact:phone"],
    website: normaliseWebsite(tags.website ?? tags["contact:website"]),
    distanceMetres: haversineDistance(origin, { latitude, longitude }),
  };
}

function classifyProvider(
  tags: OsmTags,
  service: SupportedProviderService,
): HealthcareProvider["kind"] {
  if (service === "pharmacy") return "pharmacy";
  if (service === "sexual-health-clinic") return "sexual-health-clinic";

  const explicitDoctor =
    tags.amenity === "doctors" ||
    tags.healthcare === "doctor" ||
    tags.healthcare === "general_practitioner";
  return explicitDoctor ? "gp" : "clinic";
}

function compareProviders(
  a: HealthcareProvider,
  b: HealthcareProvider,
  service: SupportedProviderService,
) {
  if (service !== "gp") return a.distanceMetres - b.distanceMetres;

  // A generic clinic receives a 1 km ranking penalty. This lets a nearby
  // explicit GP rank first while preserving a substantially closer clinic.
  const rankDistance = (provider: HealthcareProvider) =>
    provider.distanceMetres + (provider.kind === "clinic" ? 1000 : 0);
  return rankDistance(a) - rankDistance(b);
}

function formatAddress(tags: OsmTags) {
  if (tags["addr:full"]) return tags["addr:full"];

  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  const locality =
    tags["addr:suburb"] ?? tags["addr:city"] ?? tags["addr:town"];
  const parts = [street, locality, tags["addr:postcode"]].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function normaliseWebsite(website: string | undefined) {
  if (!website) return undefined;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function haversineDistance(from: Coordinates, to: Coordinates) {
  const earthRadiusMetres = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMetres * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
