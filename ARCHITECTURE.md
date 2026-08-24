# Yogya — System Architecture

**Project:** Software System to check compliance of Packaged Commodities under the
Legal Metrology (Packaged Commodities) Rules, 2011
**Problem Statement:** SIH 26034 — Ministry of Consumer Affairs, Food & Public
Distribution, Department of Consumer Affairs (DoCA)

---

## 1. High-level overview

```
┌─────────────────────┐      ┌──────────────────────┐      ┌───────────────────┐
│   Frontend (done)    │      │   Backend (to build)  │      │   Data / Storage   │
│  React 19 + Vite     │◄────►│  FastAPI (Python)     │◄────►│  PostgreSQL        │
│  Tailwind CSS        │ REST │  or Node/Express      │      │  Object storage    │
│  "Yogya" app         │ JSON │                        │      │  (S3 / local disk) │
└─────────────────────┘      └──────────────────────┘      └───────────────────┘
                                        │
                         ┌──────────────┼───────────────┐
                         ▼              ▼                ▼
                  OCR Engine     Rule Engine       Font/Readability
                (Tesseract /    (already exists   Analysis Engine
                 Google Vision   as compliance.ts  (OpenCV — new,
                 / Gemini)       logic — port to    backend-only)
                                 backend)
```

The frontend already implements the UI, the inspection workflow, and a working
rule-engine (`src/lib/compliance.ts`) that turns raw OCR text into structured
declarations and compliance findings. Today it runs entirely in the browser
with `localStorage` as its only "database" and a hardcoded demo OCR result.
The job of the backend is to replace those two things — real OCR/AI extraction,
and real persistent, multi-user storage — without changing the shapes the
frontend already expects.

---

## 2. Components

### 2.1 Frontend (existing — do not rebuild)
- React 19 + Vite + TypeScript + Tailwind CSS
- Pages: Landing, Login, Dashboard, New Inspection, History, Products,
  Product Details, Report, Settings, Help
- State/types already defined in `src/types.ts`:
  `InspectionReport`, `DeclarationField`, `ComplianceFinding`, `ProductSummary`
- Rule engine already defined in `src/lib/compliance.ts`:
  `parseDeclarationsFromOcr()`, `evaluateCompliance()`,
  `generateInspectionReport()`, `deriveProductCatalog()`, `exportReportAsHtml()`
- Currently persists reports to `localStorage` under key
  `yogya_inspection_reports` — this is what the backend's API replaces.

### 2.2 Backend API (to build)
A REST (or GraphQL, but REST is simpler for an AI to scaffold correctly) API
that:
- Accepts image uploads for a new inspection
- Runs OCR + rule-based declaration extraction (reusing the *same* logic
  currently in `compliance.ts`, ported to the backend language)
- Runs font-size / readability analysis on the uploaded image (new capability,
  not currently in the frontend)
- Persists `InspectionReport` records, `ProductSummary` aggregates, and
  uploaded evidence images
- Serves inspection history, search, and dashboard aggregate stats
- Handles authentication and role-based access (Enforcement Officer / Admin)
- Generates/exports PDF reports (frontend currently only exports HTML)

### 2.3 OCR / Extraction layer
- **MVP:** Tesseract (server-side, e.g. `pytesseract` in Python) — free,
  offline, good enough for a hackathon demo
- **Stretch:** Google Cloud Vision API or Gemini Vision for higher accuracy on
  low-quality label photos, curved surfaces, multiple fonts
- Output: raw text string, passed into the same declaration-parsing logic
  currently in `parseDeclarationsFromOcr()`

### 2.4 Font-size / Readability analysis (new — doesn't exist yet anywhere)
- OpenCV-based: detect text bounding boxes on the image, estimate character
  height in mm using image DPI/dimensions vs. a reference object or the
  package's stated dimensions, compare against Legal Metrology minimum font
  size rules (varies by net quantity slab, per Rule 8)
- This is the most technically differentiated part of the whole project —
  budget real time for it, don't leave it for the last day

### 2.5 Rule Engine
- Not new — port the existing `evaluateCompliance()` and
  `parseDeclarationsFromOcr()` logic from `src/lib/compliance.ts`
  (TypeScript) into the backend language. If the backend is also
  Node/TypeScript, you can literally reuse the file. If Python, translate the
  same regex patterns and rule references 1:1 so both layers stay consistent.

### 2.6 Database
- **PostgreSQL** — relational fits this data well (products, inspections,
  declarations, findings, users, all relate to each other)
- Suggested tables: `users`, `inspection_reports`, `declaration_fields`,
  `compliance_findings`, `evidence_images`, `products` (or derive products
  from reports the same way `deriveProductCatalog()` already does)
- **Object storage** for uploaded label images (S3-compatible, or local disk
  + served URLs for an MVP/hackathon deployment)

### 2.7 Auth
- JWT-based session auth
- Two roles minimum: `officer` (create/view inspections) and `admin`
  (view all, manage users, dashboard-wide stats)

---

## 3. Data flow (a single inspection, end to end)

1. Officer logs in → JWT issued
2. Officer uploads 1+ label images via **New Inspection** flow
3. Backend runs OCR on each image → raw text
4. Backend runs font/readability analysis on each image → font findings
5. Backend runs `parseDeclarationsFromOcr(text)` → structured `DeclarationField[]`
6. Backend runs `evaluateCompliance(declarations)` → `ComplianceFinding[]` +
   `overallStatus`
7. Backend saves the full `InspectionReport` (matching the existing
   `types.ts` shape) to Postgres, with images in object storage
8. Backend returns the report JSON → frontend renders it exactly like it
   renders local demo data today
9. Officer reviews/edits declarations → PATCH request updates the record
10. Report appears in History, Products, and Dashboard aggregates —
    computed server-side the way `deriveProductCatalog()` does client-side
    today

---

## 4. Why this shape

- **Keep the frontend's data contracts fixed.** The single biggest risk in
  "add a backend to an existing frontend" is data-shape drift. The backend's
  API responses should match `types.ts` field-for-field so the frontend
  barely needs to change — mostly just swapping `localStorage` reads/writes
  for `fetch()` calls.
- **Reuse the rule engine, don't rewrite it.** `compliance.ts` already encodes
  real Legal Metrology rule references. Rewriting it from scratch risks
  losing that domain accuracy under time pressure.
- **Treat OCR and font-analysis as separate, swappable services.** Start with
  the cheapest option (Tesseract, basic OpenCV) to get an end-to-end demo
  working, then upgrade individual pieces (Gemini Vision, better font
  estimation) if time allows.
