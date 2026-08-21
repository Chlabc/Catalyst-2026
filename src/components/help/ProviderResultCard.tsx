import { Card } from "@/components/ui/Card";
import {
  formatDistance,
  getDirectionsUrl,
  type HealthcareProvider,
} from "@/lib/osmProviderSearch";

export function ProviderResultCard({
  provider,
  origin,
}: {
  provider: HealthcareProvider;
  origin: { latitude: number; longitude: number };
}) {
  const typeLabel = {
    pharmacy: "Pharmacy",
    gp: "GP / doctor",
    clinic: "Clinic",
    "sexual-health-clinic": "Sexual health clinic",
  }[provider.kind];

  const actionClass =
    "inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25";

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-xl font-semibold text-secondary">
          +
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{typeLabel}</p>
              <h3 className="mt-0.5 text-lg font-semibold text-foreground">{provider.name ?? typeLabel}</h3>
            </div>
            <span className="shrink-0 rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-foreground">
              {formatDistance(provider.distanceMetres)} away
            </span>
          </div>
          {provider.address && (
            <p className="mt-1 text-sm text-text-muted">{provider.address}</p>
          )}
          {provider.openingHours && (
            <p className="mt-2 text-xs text-text-muted">
              <span className="font-semibold text-foreground">Hours:</span>{" "}
              {provider.openingHours}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {provider.phone && (
              <a className={actionClass} href={`tel:${provider.phone}`}>
                Call
              </a>
            )}
            {provider.website && (
              <a
                className={actionClass}
                href={provider.website}
                target="_blank"
                rel="noreferrer"
              >
                Website
              </a>
            )}
            <a
              href={getDirectionsUrl(origin, provider)}
              target="_blank"
              rel="noreferrer"
              className={`${actionClass} border-primary bg-primary text-white hover:bg-primary-dark`}
            >
              Directions →
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
