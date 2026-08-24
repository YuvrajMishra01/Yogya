# PROMPT.md — Hand this to your AI coding tool (Claude Code / Cursor / etc.)

Copy everything below the line into your AI coding assistant when you start
the backend. Fill in the two `[FILL IN]` spots first — everything else is
ready to use as-is.

---

## Project context

I'm building the backend for **Yogya**, a compliance-checking system for
packaged commodities under India's Legal Metrology (Packaged Commodities)
Rules, 2011. This is for SIH Problem Statement 26034 (Dept. of Consumer
Affairs).

The **frontend already exists** and is fully built (React 19 + Vite +
TypeScript + Tailwind). It currently runs entirely client-side using
`localStorage`. Your job is to build a backend that this frontend can be
pointed at, with minimal changes to the frontend's existing code.

**Do not redesign the frontend's data model.** Match it exactly. Here it is:

```typescript
interface DeclarationField {
  id: string;
  category: string;
  categoryNumber: string;
  label: string;
  description: string;
  statutoryRuleRef: string;
  extractedValue: string;
  currentValue: string;
  isEdited: boolean;
  status: 'DETECTED' | 'NOT_DETECTED' | 'REVIEW_REQUIRED';
  confidence: 'High confidence' | 'Medium confidence' | 'Low confidence' | 'Review required';
  evidenceImageIndex: number;
}

interface ComplianceFinding {
  id: string;
  categoryNumber: string;
  requirement: string;
  status: 'PASSED' | 'NEEDS_REVIEW' | 'VIOLATION';
  severity: 'Critical' | 'Major' | 'Minor' | 'Advisory';
  reason: string;
  expectedCondition: string;
  detectedCondition: string;
  ruleReference: string;
  inspectorNote?: string;
}

interface InspectionReport {
  id: string;
  referenceNumber: string;
  inspectionDate: string;
  createdAt: number;
  status: 'Draft' | 'Under Review' | 'Completed';
  productName: string;
  manufacturer: string;
  address: string;
  netQuantity: string;
  mrp: string;
  dateInfo: string;
  consumerCare: string;
  countryOfOrigin: string;
  otherDeclarations: string;
  declarations: DeclarationField[];
  overallStatus: 'COMPLIANT' | 'NEEDS REVIEW' | 'NON-COMPLIANT' | 'INCONCLUSIVE';
  stats: { totalChecked: number; passed: number; needsReview: number; failed: number; };
  findings: ComplianceFinding[];
  evidenceImages: { id: string; previewUrl: string; name: string; relatedRequirement?: string; description: string; }[];
  observations: string;
  reviewConfirmation: {
    declarationsReviewed: boolean;
    evidenceReviewed: boolean;
    complianceReviewed: boolean;
    inspectorConfirmed: boolean;
  };
}
```

The frontend already has a working **rule engine** in
`src/lib/compliance.ts` — a TypeScript file with two key functions:

- `parseDeclarationsFromOcr(text: string, imageIndex: number, confidenceAvg?: number): DeclarationField[]`
  — uses regex to pull Product Name, Manufacturer/Packer/Importer, Net
  Quantity, MRP, Date info, Consumer Care, Country of Origin, and Other
  Declarations (batch/license/FSSAI numbers) out of raw OCR text, and tags
  each with the relevant Legal Metrology rule reference (e.g. Rule 6(1)(a)).
- `evaluateCompliance(declarations: DeclarationField[], images): { overallStatus, stats, findings }`
  — turns the declarations into pass/fail findings against actual Legal
  Metrology (Packaged Commodities) Rules, 2011 provisions.

**I'm attaching/pasting `compliance.ts` below — port this logic into the
backend rather than re-deriving the rules from scratch.** [FILL IN: paste the
full contents of `src/lib/compliance.ts` here, or attach the file, when you
send this prompt]

---

## What I need you to build

Build a backend with these capabilities, in this priority order:

### Phase 1 — Core API + persistence (get this working first)
1. `POST /auth/login`, `POST /auth/register` — JWT-based auth, two roles:
   `officer`, `admin`
2. `POST /inspections` — accepts one or more uploaded images (multipart),
   creates a new `InspectionReport` record (status `Draft`), stores images in
   object storage (local disk is fine for now), returns the created report
3. `GET /inspections` — list, with pagination and filters (status,
   date range, product name search)
4. `GET /inspections/:id` — full report detail
5. `PATCH /inspections/:id` — update declarations/observations/status
   (used when the officer manually edits a field)
6. `DELETE /inspections/:id`
7. `GET /products` — aggregated product summaries, computed the same way
   `deriveProductCatalog()` does client-side today (group inspections by
   product name, compute latest status + stats per product)
8. `GET /dashboard/stats` — counts for compliant/non-compliant/needs-review,
   recent inspections, trends over time

### Phase 2 — Real OCR + rule engine wiring
9. When an image is uploaded to `POST /inspections`, run OCR (Tesseract to
   start — see notes below) to get raw text
10. Feed that text into the ported `parseDeclarationsFromOcr()` logic to get
    `DeclarationField[]`
11. Feed those into the ported `evaluateCompliance()` logic to get
    `findings` + `overallStatus` + `stats`
12. Return the fully-populated report, not just the raw upload

### Phase 3 — Font size / readability analysis (new capability)
13. Add an image-analysis step using OpenCV that detects text regions and
    estimates character height relative to the package/image dimensions,
    and flags fields where the detected font size looks below the Legal
    Metrology minimum for that declaration category and net-quantity slab.
    Add these as additional `ComplianceFinding` entries with
    `ruleReference` pointing to the relevant font-size rule.

### Phase 4 — Reports & polish
14. `GET /inspections/:id/report.pdf` — server-generated PDF export
    (the frontend already has `exportReportAsHtml()` for HTML export —
    match that report's content/layout for the PDF version)
15. Role-based access enforcement (officers can't see/edit other officers'
    drafts unless they're admin — [FILL IN: confirm if this permission rule
    is actually what you want, or if all officers should see all inspections])

---

## Technical preferences

- **Language/framework:** FastAPI (Python) — best ecosystem for OCR/OpenCV,
  easy for an AI tool to scaffold cleanly, good for a hackathon judge demo
- **Database:** PostgreSQL, accessed via SQLAlchemy or SQLModel
- **OCR:** start with `pytesseract` (open-source Tesseract wrapper) since
  it requires no API key/billing setup; structure the OCR call as a swappable
  service/interface so I can later switch to Google Cloud Vision or Gemini
  Vision without touching the rest of the pipeline
- **Image storage:** local disk under a static-served folder for now
  (e.g. `/uploads`), structured so it's a one-line change to swap in S3 later
- **Auth:** JWT, `passlib` for password hashing
- **CORS:** allow the frontend's dev origin (`http://localhost:3000` — the
  Vite dev server is configured to run on port 3000, see `package.json`)

## What to give me back

1. A runnable FastAPI project (or your recommended equivalent) with a clear
   folder structure
2. A `requirements.txt` / `pyproject.toml`
3. Alembic migrations (or equivalent) for the database schema
4. A short `README.md` with setup + run instructions
5. Point out clearly which parts are still stubbed/placeholder (e.g. if you
   stub the font-analysis step first and wire OCR before it) so I know what's
   real vs. fake in a demo

Ask me clarifying questions before you start if anything about the data
model, auth rules, or deployment target above is ambiguous — don't guess
silently on things that would be expensive to redo.
