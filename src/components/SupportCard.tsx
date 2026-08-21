// Shown when a cycle is rated "difficult." Deliberately doesn't try to
// diagnose anything — just points to a real person and one verified,
// real helpline. Do not add fabricated hotline numbers here.
export function SupportCard() {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
      <p className="text-sm font-medium text-foreground">
        If this feels like a lot right now, you don&apos;t have to handle it
        alone.
      </p>
      <p className="mt-2 text-sm text-text-muted">
        Talk to a trusted adult, a school nurse, or a doctor if symptoms feel
        severe or something feels off.
      </p>
      <p className="mt-2 text-sm text-text-muted">
        <strong>Kids Helpline (Australia):</strong> 1800 55 1800 — free,
        24/7, for ages 5-25.
      </p>
      <p className="mt-2 text-xs italic text-text-muted">
        Team: verify this number is current and add a local equivalent for
        your audience before submitting.
      </p>
    </div>
  );
}
