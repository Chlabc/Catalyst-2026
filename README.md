# Blossom

Built for CISSA Catalyst's Forma track — implementing and improving on the
"MenstraMission" Product-thon blueprint. See `DIVERGENCE.md` for what we
kept/changed/cut and why, and `SCRIPT.md` for the video pitch draft.

## Getting started (for teammates)

```bash
git clone https://github.com/Chlabc/Catalyst-2026.git
cd Catalyst-2026
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Working on your own feature

Don't push straight to `main`. Branch first:

```bash
git checkout -b your-name-feature
# ...make changes...
git push -u origin your-name-feature
```

Then open a Pull Request on GitHub into `main` when it's ready for review.

## Where things live

- `src/app/*/page.tsx` — one folder per route (`scenarios`, `library`,
  `tracker`, `quiz`). This is where each feature's page lives.
- `src/components/ui/` — shared building blocks (`Button`, `Card`,
  `Container`, `NavBar`). Use these instead of writing new ones.
- `src/components/icons.tsx` — hand-drawn inline SVG icons, no image
  files needed. Add more here in the same style if you need a new one.
- `src/lib/` — the actual content (scenario scripts, quiz questions,
  product entries, symptom tips). Most "add more content" work happens
  here, not in the components.
- `src/app/globals.css` — the only place color hex codes should exist.
  Everywhere else, use the token classes (`bg-primary`, `text-muted`, etc).

## Before you commit

```bash
npm run build
```

Run this locally before pushing — it catches type errors and broken
imports that `npm run dev` won't always show you.

## Data & privacy

Nothing in this app calls an external API or stores data outside the
browser. The tracker uses `localStorage` only — no account, no backend.
If you add anything that needs a real secret/API key later, put it in a
`.env.local` file (already gitignored) and never hardcode it in a
`.tsx`/`.ts` file.
