# CloudSync Python Backend

This directory contains the Python replacement for the initial Java/Spring Boot backend.

## Requirements

- Python 3.12+
- Docker Desktop (for the PostgreSQL service in the repository root)

## Windows PowerShell setup

Run these commands from the repository root:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

If PowerShell blocks virtual-environment activation, use Command Prompt:

```cmd
.venv\Scripts\activate.bat
```

## macOS / Linux setup

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Verify the API

- API root: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/health
- Swagger documentation: http://127.0.0.1:8000/docs

The health endpoint currently checks that the API process responds. PostgreSQL connectivity will be added in the next phase.

## Run tests and lint

Run from the `backend/` directory with the virtual environment activated:

```bash
pytest
ruff check .
```

## Environment variables

Copy `.env.example` to `.env` and keep real secrets in `.env` only. Never commit database passwords, JWT secrets, cloud connection strings, or service-account JSON files.
