import type { HelpServiceType } from "@/lib/helpResources";
import type {
  Coordinates,
  HealthcareProvider,
} from "@/lib/osmProviderSearch";

export const PROVIDER_CACHE_TTL_MS = 45 * 60 * 1000;

const CACHE_VERSION = 1;
const ORIGIN_DECIMAL_PLACES = 3;
const MAX_ORIGIN_DISTANCE_METRES = 5000;
const CACHE_KEY_PREFIX = "blossom_osm_provider_cache_";

type CacheableProviderService = Extract<HelpServiceType, "pharmacy" | "gp">;

export type CachedProviderResults = {
  service: CacheableProviderService;
  origin: Coordinates;
  providers: HealthcareProvider[];
  timestamp: number;
};

type StoredProviderResults = CachedProviderResults & {
  version: number;
};

export function isCacheableProviderService(
  service: HelpServiceType,
): service is CacheableProviderService {
  return service === "pharmacy" || service === "gp";
}

export function cacheProviderResults({
  service,
  origin,
  providers,
}: {
  service: CacheableProviderService;
  origin: Coordinates;
  providers: HealthcareProvider[];
}) {
  if (providers.length === 0 || typeof window === "undefined") return;

  const stored: StoredProviderResults = {
    version: CACHE_VERSION,
    service,
    origin: {
      latitude: roundCoordinate(origin.latitude),
      longitude: roundCoordinate(origin.longitude),
    },
    providers,
    timestamp: Date.now(),
  };

  try {
    window.sessionStorage.setItem(cacheKey(service), JSON.stringify(stored));
  } catch {
    // Storage can be unavailable or full. Live results still work normally.
  }
}

export function readCachedProviderResults(
  service: CacheableProviderService,
  currentOrigin: Coordinates,
): CachedProviderResults | null {
  if (typeof window === "undefined") return null;

  const key = cacheKey(service);
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const stored = JSON.parse(raw) as unknown;

    if (!isValidStoredResults(stored, service)) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    const age = Date.now() - stored.timestamp;
    const nearSameOrigin =
      distanceBetween(currentOrigin, stored.origin) <=
      MAX_ORIGIN_DISTANCE_METRES;
    if (age < 0 || age > PROVIDER_CACHE_TTL_MS || !nearSameOrigin) {
      if (age > PROVIDER_CACHE_TTL_MS) window.sessionStorage.removeItem(key);
      return null;
    }

    return {
      ...stored,
      providers: stored.providers.map((provider) => ({
        ...provider,
        distanceMetres: distanceBetween(currentOrigin, provider),
      })),
    };
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore unavailable storage.
    }
    return null;
  }
}

export function formatCacheAge(timestamp: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Updated just now";
  if (minutes === 1) return "Updated 1 minute ago";
  return `Updated ${minutes} minutes ago`;
}

function cacheKey(service: CacheableProviderService) {
  return `${CACHE_KEY_PREFIX}${service}`;
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(ORIGIN_DECIMAL_PLACES));
}

function isValidStoredResults(
  value: unknown,
  service: CacheableProviderService,
): value is StoredProviderResults {
  if (!value || typeof value !== "object") return false;
  const stored = value as Partial<StoredProviderResults>;
  return (
    stored.version === CACHE_VERSION &&
    stored.service === service &&
    isCoordinates(stored.origin) &&
    typeof stored.timestamp === "number" &&
    Number.isFinite(stored.timestamp) &&
    Array.isArray(stored.providers) &&
    stored.providers.length > 0 &&
    stored.providers.every(isHealthcareProvider)
  );
}

function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") return false;
  const coordinates = value as Partial<Coordinates>;
  return (
    typeof coordinates.latitude === "number" &&
    Number.isFinite(coordinates.latitude) &&
    typeof coordinates.longitude === "number" &&
    Number.isFinite(coordinates.longitude)
  );
}

function isHealthcareProvider(value: unknown): value is HealthcareProvider {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HealthcareProvider>;
  const validKinds: HealthcareProvider["kind"][] = [
    "pharmacy",
    "gp",
    "clinic",
    "sexual-health-clinic",
  ];
  return (
    typeof candidate.id === "string" &&
    typeof candidate.kind === "string" &&
    validKinds.includes(candidate.kind as HealthcareProvider["kind"]) &&
    isCoordinates(value) &&
    typeof candidate.distanceMetres === "number" &&
    Number.isFinite(candidate.distanceMetres) &&
    optionalString(candidate.name) &&
    optionalString(candidate.address) &&
    optionalString(candidate.openingHours) &&
    optionalString(candidate.phone) &&
    optionalString(candidate.website)
  );
}

function optionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function distanceBetween(from: Coordinates, to: Coordinates) {
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
