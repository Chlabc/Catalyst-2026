# Divergence Log — Blossom (originally MenstraMission)

Built on the Figma design and research by **Team PADthai** (Ann — UX/UI
Design; Morn — Politics & Chinese Studies; Nana — Environmental Science;
Pam — Physiology), from `PADthai - Track2.pdf` / `PADthai - Track 2.fig`.
This log is the heart of our Forma submission — update it as you build,
not at the end.

PADthai's research: questionnaire survey, 140 participants (period-havers
only), target user = pre-teen girls with no prior menstruation knowledge,
target age before 12-13. Their own disclaimer: "we are not trying to
replace sex education" — we've carried that line into our own copy.

| Blueprint element | Kept / Changed / Cut | Why (tied to their research) |
|---|---|---|
| Name "MenstraMission" | Renamed to "Blossom" | Broadened audience (see below) meant a name centered on "mission" framing read narrower than the product now is; Blossom keeps the growth/biome metaphor without the narrower framing |
| Biome-based interactive scenarios | Kept | Core validated concept from their user research |
| Pre-teen-only audience → parents/educators | Broadened | **Confirmed by their research**: their "Future Expansion" slide explicitly lists "single-father, parents, educator/schools" as target users |
| Pre-teen-only audience → late teens | Broadened | **Our own call, not directly cited** — PADthai's research target is specifically pre-teens before 12-13; extending to late teens is a reasonable adjacent guess, not something their data says |
| Playful/bright visual tone | Changed to calm, muted, plain-language UI | Serves a broader age range and builds trust on a sensitive health topic |
| Static, education-only site | Added a period tracker/calendar | Turns a one-time education visit into an ongoing tool |
| — | Added, then cut myth-busting quiz | Built as an addition, but later judged redundant with scenarios + library as education formats — cut to keep the product focused rather than shipping a feature that wasn't earning its space |
| — | Added product library (pads/cups/tampons/discs) | Fills a practical gap the original research pointed at but didn't build |
| No account, local-only tracker data | Added as an explicit decision | Privacy-first, zero-friction for a young/sensitive-topic audience |
| General health info / symptom checker / pharmacy locator | Cut | Off-blueprint scope, dilutes focus, not supported by the original research |
| Single scenario | Expanded to 3 scenarios shown as a level-path (school, sleepover, sports cramps) with completion checkmarks | Reinforces the original's interactive-scenario concept with a light sense of progress, still built as branching stories, not a game overhaul |
| Tracker: calendar only | Added per-day symptom tagging, auto cycle-length count, a smooth/mild/difficult check-in, and general (non-personalized) cycle-phase education | Stays in the "education" lane the blueprint set — teaches through pattern-noticing, not a medical tracking tool. Framed deliberately as general info, not diagnosis |
| — | Added a support card (trusted adult + one verified helpline) shown only on a "difficult" cycle rating | Real safety net without fabricating hotline data; only surfaces when relevant, doesn't clutter the default experience |
| AI symptom assistant | Considered, not built | Needs a backend, an API key, and real safety review before an AI gives health-adjacent guidance to a young audience — too heavy and too risky for this timeline. Left as a "what's next," not shipped |
| Full pivot to general adult-women audience | Considered, not made | Not supported by PADthai's research — their stated expansion is the adults *around* a pre-teen (parents/educators), not adult menstruators as primary users. Going further would be an unsupported guess |
| Nameless biome concept | Adopted PADthai's own "Menstrome Island" name for the Learn section | This is literally their branding from the deck, not our invention — strengthens fidelity to the blueprint rather than diverging from it |
| Scenario titles | Two levels renamed to "Cramper" and "Bloodbury" (heavy-flow scenario, new) | Matches PADthai's own island-naming convention for the biome map |
| Tracker symptoms shown in isolation | Linked each symptom to its matching Menstrome Island mission (e.g. logging "Cramps" links to the "Cramper" mission) | Connects the tracker back into their biome/scenario concept instead of leaving it as a separate bolt-on tool |
| Symptom tips only | Added short factual "why is this happening" explanations alongside the existing comfort tips | Matches Gen-Alpha learning-style research PADthai cited (interactive, low cognitive load) — explains the "why," not just the "what to do" |
| Generic homepage | Added a local-only name greeting and a live cycle-day summary card, redesigned as an asymmetric (not centered) layout | Personalization without an account — consistent with the tracker's privacy-first stance already logged above |
| Flat product list | Added 3 situational quick-picks ("swimming tomorrow?" etc.) above the filters | Matches PADthai's own "practical solution, not theoretical" positioning from their market-analysis slide |
| Nearby pharmacy/supermarket finder | Considered, not built | Needs real geolocation + a paid maps API + ongoing data accuracy — too heavy and too risky (sending someone to a store that's wrong/closed) for this timeline |

## Notes as we build
_(add dated bullet points here as decisions get made — these become your
video script's strongest section)_

- 2026-08-21: Built out library, quiz, and tracker from placeholders to
  working features; added trusted-adult message generator and a shared
  growth-visual reused across tracker/quiz.
- 2026-08-21: Renamed MenstraMission → Blossom (see table above for why).
- 2026-08-21: Expanded Learn into a 3-scenario level-path; expanded
  tracker with symptom tagging, cycle-length calc, and phase education.
- 2026-08-21: Read PADthai's actual research (`PADthai - Track2.pdf`).
  Corrected the audience-broadening claim — parents/educators is
  research-backed, late-teens is our own reasonable guess, general adult
  women was considered and rejected as unsupported. Adopted their real
  "Menstrome Island" branding, which we hadn't known about before this.
- 2026-08-21: Replaced the text-list cycle-phase card with an interactive
  circular phase wheel (click a phase to read about it) — same content,
  more interactive presentation. Added daily mood check-in alongside
  symptom tagging. Gave the growth-visual companion a small face. Added
  a static, pre-written help panel (deliberately not an AI chatbot — see
  table above for why) accessible from every page.
- 2026-08-21: Started a homepage rework on a new branch, `New-Huey`
  (branched from `Huey`). Home is now a free-drag widget canvas —
  Menstrome Island and a new Flower widget are permanent, Tracking and
  Help are placeholders (for teammates' fuller tracker and helpline
  modules) that can be hidden and brought back. **Cut the quiz**
  entirely — team judged it redundant with the scenarios and library as
  education formats, not adding enough on its own to justify the space.
  Linked Menstrome Island and the Product Library to each other directly,
  since the library is conceptually part of the same learning module.
  Flower widget: petals fall with a real animation (not an instant
  swap) when a day gets logged.
- 2026-08-22: Reframed the homepage canvas as a customisable Beach/Desert
  desk and made the learning card deliver one plain-language, one-minute
  fact plus a single reward question. This honours PADthai's interactive,
  reward-based and low-cognitive-load learning direction, while avoiding a
  dense "health library" on the first screen. The fact is deliberately
  general health education, not personal medical advice.
