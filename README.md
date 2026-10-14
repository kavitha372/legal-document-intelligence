# Secure AI-Powered Legal Document Intelligence and Compliance Platform

> **Wipro CPPE (Cloud Product and Platform Engineering) — Assessment Project**

A local-first, full-stack web application that extracts text from legal PDF documents, enables keyword search and evidence-grounded question answering, and runs a configurable compliance checklist — all mapped to all four CPPE curriculum modules.

⚠️ **Disclaimer**: This application provides document search and preliminary checklist assistance only. It does not provide legal advice or determine whether a contract is legally valid or enforceable. All findings must be reviewed by a qualified human reviewer. Use synthetic or public documents only — never upload confidential client documents.

---

## Features

| Feature | Module |
|---------|--------|
| PDF upload and page-by-page text extraction | 2 |
| Keyword + TF-IDF search with page references | 2 |
| Evidence-grounded question answering (RAG baseline) | 3 |
| Configurable compliance checklist (FOUND/NOT_DETECTED/NEEDS_REVIEW) | 2 |
| JWT authentication + bcrypt password hashing | 4 |
| Role-based access control (Admin / Reviewer / Read-Only) | 4 |
| IDOR prevention (ownership check on every record access) | 4 |
| Audit logging for all security-relevant events | 4 |
| REST API with Swagger documentation | 1 |
| Docker + Docker Compose | 1 |
| GitHub Actions CI pipeline | 1 |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Plain CSS with CSS custom properties |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite + Prisma ORM |
| PDF Extraction | pdfjs-dist |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| API Docs | Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express) |
| Testing | Vitest + Supertest |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Prerequisites

- **Node.js 18+** — https://nodejs.org/en/download
- **npm 9+** (bundled with Node.js)
- **Git** (optional, for CI/CD demo)
- **Docker Desktop** (optional, for Docker demo) — https://www.docker.com/products/docker-desktop

---

## Installation — Windows

### 1. Install Node.js (if not installed)
Download and install from https://nodejs.org — choose the LTS version.
Verify: `node --version` and `npm --version`

### 2. Clone or extract the project
```powershell
# If using git:
git clone <repo-url>
cd legal-document-intelligence

# Or extract the ZIP and cd into the folder
```

### 3. Set up the backend
```powershell
cd backend

# Copy environment template
Copy-Item .env.example .env

# Install dependencies
npm install

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Seed demo users
npm run db:seed

# Generate sample PDF documents
npx ts-node src/utils/generateSamplePdfs.ts
```

### 4. Set up the frontend
```powershell
cd ..\frontend
npm install
```

### 5. Start the application (two terminals)

**Terminal 1 — Backend:**
```powershell
cd backend
npm run dev
# Backend starts on http://localhost:3001
# API docs at http://localhost:3001/api/docs
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Environment Configuration

Edit `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# IMPORTANT: Change this to a long random string
JWT_SECRET=your-very-long-random-secret-here

DATABASE_URL=file:./dev.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
MAX_PAGE_COUNT=200
CORS_ORIGIN=http://localhost:5173
```

Generate a secure JWT secret:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Administrator | `admin` | `Admin@1234!` |
| Legal Reviewer | `reviewer1` | `Reviewer@1234!` |
| Read-Only | `readonly1` | `Readonly@1234!` |

⚠️ **These are demo credentials only — change before any real use.**

---

## Running with Docker

```powershell
# From the project root
# Copy and edit the JWT secret
Copy-Item .env.example .env
# Edit .env and set JWT_SECRET

docker-compose up --build

# Frontend: http://localhost:80
# Backend API: http://localhost:3001/api/docs
```

To seed demo data inside Docker:
```powershell
docker exec legal-doc-backend npx ts-node src/utils/seed.ts
```

---

## Running Tests

**Backend:**
```powershell
cd backend
npx prisma db push   # ensure test DB exists
npm test
```

**Frontend:**
```powershell
cd frontend
npm test
```

**Type checks:**
```powershell
cd backend && npm run typecheck
cd ..\frontend && npm run typecheck
```

---

## API Documentation

Swagger UI is available at:
```
http://localhost:3001/api/docs
```

OpenAPI JSON spec:
```
http://localhost:3001/api/docs.json
```

---

## Project Structure

```
legal-document-intelligence/
  frontend/                  React + TypeScript + Vite
    src/
      api/                   Axios API client wrappers
      components/            Reusable UI components
      hooks/                 useAuth context hook
      layouts/               AppLayout with sidebar
      pages/                 Route-level page components
      styles/                global.css
      types/                 TypeScript type definitions
      utils/                 Date/status formatters
  backend/                   Node.js + Express + TypeScript
    src/
      config/                Environment configuration
      controllers/           Route handlers
      middleware/            Auth, upload, error handler
      routes/                Express router
      services/              PDF extractor, search, QA, checklist, audit
      types/                 TypeScript type definitions
      utils/                 Logger, Prisma client, seed, PDF generator
    prisma/
      schema.prisma          Database schema
    tests/                   Vitest test files
  docs/                      Architecture, security, AWS mapping, API docs
  sample_documents/          Synthetic demo PDFs
  .github/workflows/ci.yml   GitHub Actions CI
  docker-compose.yml
  README.md
```

---

## CPPE Module Mapping Summary

| Module | Evidence |
|--------|---------|
| 1 — Cloud Product & Platform Engineering | Express REST API, Swagger docs, Docker, Docker Compose, GitHub Actions CI, health endpoint |
| 2 — Data Engineering, Big Data & ML Insights | PDF ingestion pipeline, page-level extraction, normalization, SQLite storage, TF-IDF search, rule-based checklist |
| 3 — Generative AI, Foundation Models & RAG | Retrieve-then-generate pipeline, evidence passages, page citations, insufficient-evidence handling, no fabrication |
| 4 — Cloud Security, Cryptography & Governance | bcrypt, JWT, RBAC, IDOR prevention, file validation, audit logs, rate limiting, Helmet, Zod validation, secrets in env |

See `docs/aws-mapping.md` for a full comparison of local implementations to AWS services.

---

## Limitations

- Scanned PDFs (images) are detected but cannot be processed without OCR installation
- The question-answering baseline uses keyword retrieval — a local LLM (Ollama) can be added as an optional extension
- SQLite is suitable for local demos only; a production deployment would use PostgreSQL
- No TLS in local development — use a reverse proxy with HTTPS in any real deployment
- Demo credentials must be changed before any real use
- This is a prototype demonstrating CPPE concepts — it is not production-ready security software

---

## Troubleshooting

**Port already in use:**
```powershell
# Change PORT in backend/.env (default 3001)
# Change server.port in frontend/vite.config.ts (default 5173)
```

**Prisma migration errors:**
```powershell
cd backend
Remove-Item dev.db -ErrorAction SilentlyContinue
npx prisma db push
npm run db:seed
```

**pdfjs-dist worker warning:**
This is expected in Node.js — it does not affect text extraction functionality.

**npm install fails:**
Ensure Node.js 18+ is installed: `node --version`
