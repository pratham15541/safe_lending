# Safe Lending Dashboard

Full-stack monitoring dashboard for lending risk governance.

## Features

- Active monitoring of quarterly grade drift
- Quarterly grade-boundary recalibration recommendations
- State-level and application-type risk overlays
- Probability-based model inference used alongside existing grade policy

## Backend (FastAPI)

```bash
cd dashboard/backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## Frontend (React + Vite)

```bash
cd dashboard/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to backend `http://127.0.0.1:8000`.
