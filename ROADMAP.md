# Yogya — Roadmap

**Problem Statement 26034** · Legal Metrology (Packaged Commodities) Rules,
2011 compliance system

Status legend: ✅ done · 🔲 to do

---

## Phase 0 — Where you are right now

- ✅ Frontend fully built (Landing, Login, Dashboard, New Inspection, History,
  Products, Product Details, Report, Settings, Help)
- ✅ Rule engine (`compliance.ts`) with real Legal Metrology rule references —
  `parseDeclarationsFromOcr()` and `evaluateCompliance()`
- ✅ Report generation, HTML export, inspection history UI
- 🔲 Real OCR — currently hardcoded to a demo "Kissan Peanut Butter" label
  regardless of uploaded image
- 🔲 Any backend — everything currently lives in browser `localStorage`
- 🔲 Font-size / readability analysis — doesn't exist anywhere yet
- 🔲 Auth, multi-user, role-based access
- 🔲 PDF export (HTML export exists, PDF doesn't)

---

## Phase 1 — Backend skeleton + persistence
**Goal:** Replace `localStorage` with a real API, no behavior change visible
to a demo audience yet.

- 🔲 Stand up FastAPI + PostgreSQL project (use `PROMPT.md`)
- 🔲 Auth (login/register, JWT, officer/admin roles)
- 🔲 CRUD endpoints for `InspectionReport` matching `types.ts` exactly
- 🔲 Image upload + storage (local disk to start)
- 🔲 `GET /products` and `GET /dashboard/stats` endpoints replicating what
  `deriveProductCatalog()` computes client-side today
- 🔲 Point the frontend's `fetch`/API calls at the backend instead of
  `localStorage` (swap in `App.tsx` where `STORAGE_KEY` is read/written)

**Exit criteria:** you can create an inspection, refresh the page, and it's
still there — served from Postgres, not the browser.

---

## Phase 2 — Real OCR
**Goal:** Upload any label photo and get real extracted text back, not the
demo Kissan data.

- 🔲 Wire `pytesseract` into the upload endpoint
- 🔲 Feed OCR output into ported `parseDeclarationsFromOcr()` logic
- 🔲 Feed declarations into ported `evaluateCompliance()` logic
- 🔲 Test against 10–15 real product label photos (mix of good and bad
  labels — you want some that legitimately fail compliance for the demo)
- 🔲 Tune the regex patterns in `parseDeclarationsFromOcr()` against real
  OCR noise (Tesseract output is messier than clean demo text — expect to
  adjust the field-extraction regexes)

**Exit criteria:** upload 3 different real product photos, get 3 different,
plausible, correctly-cited compliance reports.

**This is your top priority after Phase 1** — it's the single feature that
turns this from "a nice UI with fake data" into "a working compliance
scanner," which is the actual core ask of the problem statement.

---

## Phase 3 — Font size / readability analysis
**Goal:** Add the technically differentiated feature most competing teams
won't attempt.

- 🔲 OpenCV text-region detection on uploaded images
- 🔲 Estimate character height (mm) relative to image scale
- 🔲 Encode the Legal Metrology minimum font-size table (varies by
  declaration type and net-quantity slab, under Rule 8) as a lookup table
- 🔲 Emit `ComplianceFinding` entries for font-size violations, with proper
  `ruleReference`
- 🔲 Surface this visually in the existing `CompliancePanel` /
  `FindingsPanel` components (already built, just need real data)

**Exit criteria:** a label with visibly tiny MRP text gets flagged as a
finding with a specific rule citation, not just a generic "looks small."

**Note:** this is the hardest, least-defined phase. Start it early and in
parallel with Phase 2 if you have more than one person working on this —
don't leave it for the last 48 hours.

---

## Phase 4 — Reports, dashboards, polish
**Goal:** Judge-facing polish and the remaining checklist items from the
problem statement.

- 🔲 Server-side PDF export (`GET /inspections/:id/report.pdf`)
- 🔲 Search/filter across inspection history (product name, date, status)
- 🔲 Dashboard charts (compliance rate over time, violation categories
  breakdown) — frontend `Dashboard.tsx` may already have chart placeholders
  to wire up
- 🔲 Role-based access polish (what admins see vs. officers)
- 🔲 Seed the database with a handful of realistic demo inspections so the
  Dashboard/History/Products views aren't empty on first load

---

## Phase 5 — Submission prep
- 🔲 Technical documentation (architecture diagram, deployment notes — reuse
  `ARCHITECTURE.md` as a starting point)
- 🔲 Record a demo video: upload → OCR → declarations → findings → report →
  history → dashboard, end to end, on a real (not staged) product photo
- 🔲 Prepare 2–3 test products in advance that you know will produce a mix
  of PASSED / VIOLATION / NEEDS_REVIEW results — a demo where everything
  is COMPLIANT looks less convincing than one that catches a real issue

---

## Suggested order of attack if you're short on time

If you only get through some of this before a deadline, prioritize in this
order — each one is independently demoable:

1. Phase 1 (backend + persistence) — needed for everything else
2. Phase 2 (real OCR) — this is the actual core deliverable
3. Phase 4's PDF export + seeded demo data — cheap, high demo impact
4. Phase 3 (font analysis) — high value but highest effort; do a simplified
   version (e.g. just flag if text height is below a fixed pixel threshold)
   if you're tight on time, rather than skipping it entirely
