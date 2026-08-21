import Link from "next/link";

export default function CyclePage() {
  return (
    <main className="app-shell subpage">
      <Link className="back-link" href="/">← Back to dashboard</Link>
      <p className="eyebrow">CYCLE TRACKING</p>
      <h1>My Cycle</h1>

      <section className="card">
        <h2>Cycle overview</h2>
        <p>Your next period is estimated to arrive in 12 days.</p>
        <p className="muted">Start logging your periods to improve predictions.</p>
      </section>
    </main>
  );
}