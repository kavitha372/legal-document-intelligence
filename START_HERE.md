# Quick Start — Legal Document Intelligence Platform

## Step 1: Install Node.js (Required — one-time)
Download from https://nodejs.org (LTS version, 20.x recommended)
After installation, open a **new** PowerShell window and verify:
```
node --version   # should show v20.x.x
npm --version    # should show 10.x.x
```

## Step 2: Set up the Backend
Open PowerShell in this folder and run:
```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npx ts-node src/utils/generateSamplePdfs.ts
```

## Step 3: Set up the Frontend
Open a second PowerShell window:
```powershell
cd frontend
npm install
```

## Step 4: Run the Application

**Backend** (PowerShell window 1):
```powershell
cd backend
npm run dev
```
→ Backend: http://localhost:3001  
→ API Docs: http://localhost:3001/api/docs

**Frontend** (PowerShell window 2):
```powershell
cd frontend
npm run dev
```
→ App: http://localhost:5173

## Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| Administrator | admin | Admin@1234! |
| Legal Reviewer | reviewer1 | Reviewer@1234! |
| Read-Only | readonly1 | Readonly@1234! |

## Upload Sample Documents
After logging in as `reviewer1`, go to **Upload Document** and upload:
- `sample_documents/sample_service_agreement.pdf`
- `sample_documents/sample_software_subscription_agreement.pdf`

## Run Tests
```powershell
cd backend && npm test
cd frontend && npm test
```

## Docker (Optional)
```powershell
# From project root — requires Docker Desktop
docker-compose up --build
# Then: docker exec legal-doc-backend npx ts-node src/utils/seed.ts
```
