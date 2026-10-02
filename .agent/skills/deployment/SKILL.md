---
name: deployment
description: Deployment guide for Ancient Scripts AI — local setup, prerequisites, process management, and production notes.
---

# Deployment — Ancient Scripts AI

## Purpose

Provides exact, reliable steps to set up, run, and deploy Ancient Scripts AI. Prevents configuration drift and "works on my machine" problems.

## When to Use

- When setting up the project on a new machine.
- When the backend or frontend fails to start.
- When preparing for production deployment.
- When sharing the project with a collaborator.

## Prerequisites

| Requirement | Minimum Version | Check Command |
| :--- | :--- | :--- |
| Python | 3.10+ | `python --version` |
| pip | 21.0+ | `pip --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

## Local Development Setup

### 1. Backend Setup

```powershell
# Navigate to backend
cd d:\NLP_Project\backend

# Create virtual environment (recommended)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start development server
python -m uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```powershell
# In a separate terminal
cd d:\NLP_Project\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Verify Both Are Running

- Open browser: `http://localhost:5173` → Should show the Ancient Scripts AI upload page.
- Open browser: `http://localhost:8000` → Should return `{"status": "online", ...}`.
- Upload an image and click "Start Epigraphic Analysis" → Should complete within ~6 seconds.

## Process Architecture

Two separate processes must run simultaneously:

```
Process 1: Uvicorn (Python)      Process 2: Vite (Node.js)
Port: 8000                        Port: 5173
Directory: backend/               Directory: frontend/
Command: uvicorn main:app --reload Command: npm run dev
```

**Both must be running at the same time.** If only one is running, the application will not work.

## Environment Variables

No environment variables are currently required.

If added in future phases, create `backend/.env`:
```env
DATABASE_URL=...
API_KEY=...
CORS_ORIGIN=http://localhost:5173
```

Load with `python-dotenv` in `main.py`. **Never commit `.env` to git.**

## Production Deployment Notes

When deploying to production, the following changes are required:

### Backend
- Set `allow_origins` to the specific production frontend URL.
- Replace `--reload` with production ASGI: `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`.
- Run behind a reverse proxy (nginx) with HTTPS.
- Pin all Python dependency versions in `requirements.txt`.
- Do not use the development server for production.

### Frontend
- Run `npm run build` to produce a production build in `frontend/dist/`.
- Serve the `dist/` folder via nginx or a CDN.
- Update the `fetch('http://localhost:8000/analyze', ...)` URL in `App.tsx` to the production API URL via an environment variable.
- Add `VITE_API_URL` to a `.env.production` file and use `import.meta.env.VITE_API_URL` in the frontend.

### Missing Production Features (to implement before go-live)
- Authentication / access control.
- Rate limiting on `POST /analyze`.
- Maximum file size enforcement (see security skill).
- HTTPS certificates.
- Health check endpoint.
- Logging and error monitoring.
- Database for analysis history.

## Troubleshooting

| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| `ModuleNotFoundError: No module named 'fastapi'` | Wrong Python env or not installed | `pip install -r requirements.txt` in active venv |
| `Address already in use :8000` | Another uvicorn instance is running | `taskkill /F /IM python.exe` (Windows) |
| `CORS error in browser` | Backend not running | Start backend |
| `Failed to analyze image` alert | Backend not running at port 8000 | Start backend |
| `npm: command not found` | Node.js not installed or not in PATH | Install Node.js |
| `npm install` fails | Node.js too old | Upgrade to Node.js 18+ |

## Definition of Done

- `GET http://localhost:8000/` returns 200.
- `http://localhost:5173` loads the upload page.
- Upload → Analyze → Results completes without error.
