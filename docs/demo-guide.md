# Demo Guide — 3-5 Minute Presentation Script

## Before You Start
1. Backend running: `npm run dev` in `backend/`
2. Frontend running: `npm run dev` in `frontend/`
3. Database seeded: `npm run db:seed` in `backend/`
4. Sample PDFs generated: `npx ts-node src/utils/generateSamplePdfs.ts` in `backend/`
5. Open: http://localhost:5173

---

## Step 1 — Login as a Legal Reviewer (30 seconds)
- Open http://localhost:5173
- Click **"Use"** next to the Reviewer demo credential
- Click **Sign in**
- **Point out**: Login form validation, password masking, JWT-based session (Module 4)

---

## Step 2 — Upload a Synthetic Agreement (60 seconds)
- Click **Upload Document** in the sidebar
- Select `sample_documents/sample_service_agreement.pdf`
- Enter title: "TechServe Service Agreement"
- Click **Upload & Extract**
- **Point out**:
  - File validation (type, size, magic bytes)
  - Random UUID stored filename (not original name)
  - Extraction status: "Text Extracted"
  - Page count shown
  - **Module 2**: PDF → page-by-page extraction pipeline

---

## Step 3 — View Extracted Text (30 seconds)
- After upload, you're on the Document Details page
- The **Extracted Text** tab shows page-by-page content
- Expand page 1 and 4
- **Point out**: Original page order preserved, each page stored separately

---

## Step 4 — Search for a Clause (45 seconds)
- Click the **Search** tab
- Type `termination` → click Search
- **Show**: results with page numbers and matched terms
- Try also: `confidentiality`, `governing law`
- **Point out**: Module 2 — keyword + TF-IDF retrieval, page references always shown

---

## Step 5 — Ask a Question with Evidence (60 seconds)
- Click the **Ask a Question** tab
- Click the suggestion: "What is the termination notice period?"
- **Show**: the answer cites page numbers, evidence passages are displayed
- Try: "Is there a confidentiality clause?"
- If no evidence: the system says "I could not find sufficient evidence…" — no fabrication
- **Point out**: Module 3 — RAG baseline, evidence grounded, disclaimer displayed

---

## Step 6 — Run the Compliance Checklist (45 seconds)
- Click the **Checklist** tab
- Click **Run Checklist**
- **Show**: each item with FOUND / NOT_DETECTED / NEEDS_REVIEW
- Click **Add Note** on one item — add a reviewer note
- **Point out**:
  - Module 2 — rule-based classification
  - Results are **preliminary flags only** — disclaimer shown
  - Reviewer notes recorded with timestamp

---

## Step 7 — Demonstrate Access Control (30 seconds)
- Log out (click logout icon in sidebar)
- Log in as **readonly1 / Readonly@1234!**
- Go to Document Library — it's empty (Read-Only users see only shared docs)
- Try navigating directly to the document URL — gets 403
- Try accessing /admin/users — redirected away
- **Point out**: Module 4 — RBAC enforced server-side, IDOR prevention

---

## Step 8 — View Audit Logs as Admin (30 seconds)
- Log out, log in as **admin / Admin@1234!**
- Go to **Audit Logs** in the sidebar
- **Show**: all events from the demo — logins, upload, extraction, search, checklist, review
- **Point out**: Module 4 — governance, every security event recorded with actor + outcome

---

## Step 9 — Show CPPE Module Mapping (30 seconds)
- Click **CPPE Modules** in the sidebar
- Walk through each module card quickly
- **Point out**: AWS mapping column — distinguish local equivalents from actual AWS services

---

## Key Messages for Assessors
- **Module 1**: Modular REST API, Swagger docs at /api/docs, Docker, CI workflow
- **Module 2**: PDF ingestion pipeline, page-level storage, keyword retrieval, rule-based classification
- **Module 3**: Retrieve-then-generate RAG, evidence citations, no fabrication, optional LLM extension
- **Module 4**: bcrypt hashing, JWT, RBAC, IDOR prevention, file validation, audit logs, secrets in env

---

## Disclaimer to Include in Presentation
> "This prototype demonstrates document search and preliminary checklist assistance for educational purposes only. It does not provide legal advice and all results require verification by a qualified human reviewer. No confidential documents were used."
