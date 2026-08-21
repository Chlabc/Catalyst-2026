import Link from "next/link";

export default function PharmacyPage() {
  return (
    <main className="app-shell subpage">
      <Link className="back-link" href="/">← Back to dashboard</Link>
      <p className="eyebrow">FIND SUPPORT</p>
      <h1>Nearby Pharmacies</h1>

      <section className="card">
        <h2>Find a pharmacy near you</h2>
        <p className="muted">
          Location services will show nearby pharmacies, opening hours and
          directions.
        </p>
        <button className="primary-button">Use my location</button>
      </section>
    </main>
  );
}