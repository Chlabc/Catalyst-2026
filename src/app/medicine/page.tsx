import Link from "next/link";

export default function MedicinePage() {
  return (
    <main className="app-shell subpage">
      <Link className="back-link" href="/">← Back to dashboard</Link>
      <p className="eyebrow">HEALTH INFORMATION</p>
      <h1>Medicine Guide</h1>

      <section className="card">
        <h2>Period pain relief</h2>
        <p>
          Learn about common options for managing period discomfort.
        </p>
        <p className="muted">
          Always read the label and consult a pharmacist or healthcare
          professional before taking medication.
        </p>
      </section>
    </main>
  );
}