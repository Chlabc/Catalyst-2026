# Bloom

A calm first stop for period questions — built for CISSA Catalyst Forma,
on Team PADthai’s MenstraMission / Menstrome Island blueprint.

Bloom is a Next.js app with a widget Home canvas and tabs for Learn,
Tracker, Find Help, FAQ, and Health report. The Product Library lives
off Menstrome Island rather than as its own tab.

See `DIVERGENCE.md` for what we kept, changed, or cut, and `SCRIPT.md`
for the video pitch draft.

## Getting started

```bash
git clone https://github.com/Chlabc/Catalyst-2026.git
cd Catalyst-2026
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run a second branch at the same time, use a git worktree and a
different port, for example `PORT=3001 npm run dev`.

## What is in the app

- **Home** — draggable widgets on a Beach / Macaron scene: island, plant,
  tracker, find help, FAQ, health report.
- **Learn** (`/scenarios`) — Menstrome Island, seven towns. Each town is
  scenario → facts → one decision → reward. We are not trying to replace
  sex education.
- **Tracker** (`/tracker`) — local cycle log, calendar, check-in streak.
- **Find Help** (`/find-help`) — guided next steps and nearby pharmacy / GP
  search (OpenStreetMap), with Google Maps as a fallback.
- **FAQ** (`/faq`) — pre-written answers, not a chatbot.
- **Health report** (`/report`) — on-device stats and a downloadable PDF
  with diagrams, for a GP or pharmacist.
- **Product Library** (`/library`) — plain-language products, opened from
  Island (especially Divursity) with shared filters.

## Where things live

- `src/app/*/page.tsx` — one folder per route (`scenarios`, `tracker`,
  `find-help`, `faq`, `report`, `library`).
- `src/components/canvas/` — Home widgets and the drag canvas.
- `src/components/scenario/` — island map and town lessons.
- `src/components/ui/` — shared `Button`, `Card`, `Container`, `NavBar`,
  `PageHeader`, back buttons.
- `src/components/icons.tsx` — inline SVG icons, including the Bloom
  flower wordmark. Colour hex codes belong in `src/app/globals.css`.
- `src/lib/` — content and helpers (towns, FAQs, products, report PDF).
- `public/menstrome/` — island and town art (swap files here when new
  assets land).

## Working on your own feature

Don’t push straight to `main`. Branch first:

```bash
git checkout -b your-name-feature
# ...make changes...
git push -u origin your-name-feature
```

Then open a Pull Request into `main` when it’s ready for review.

Current product work is on `eeva`.

## Before you commit

```bash
npm run build
```

This catches type errors and broken imports that `npm run dev` will not
always show.

## Data & privacy

Tracker logs, widget layout, and the welcome-gate flag stay on this
device (`localStorage`). There is no Bloom account.

Find Help’s nearby search talks to public Overpass / Nominatim servers
from the browser. If those servers are down, the Google Maps links still
work. Health report PDFs are built in the browser and never uploaded.
