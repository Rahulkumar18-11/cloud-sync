# CloudSync Python Backend

This directory contains the Python replacement for the initial Java/Spring Boot backend.

The API is built with FastAPI. File storage will work locally during development and will gain an Amazon S3 implementation in a later phase.

## Requirements

- Python 3.12+
- Docker Desktop (for the PostgreSQL service in the repository root)

## Windows Git Bash setup

Run these commands from the repository root:

```bash
cd backend
py -3 -m venv .venv
source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Windows PowerShell setup

```powershell
cd backend
py -3 -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

If PowerShell blocks virtual-environment activation, use Command Prompt:

```cmd
.venv\\Scripts\\activate.bat
```

## macOS / Linux setup

```bash
cd backend
python3 -m venv .venv
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

The health endpoint currently checks that the API process responds. PostgreSQL connectivity and file operations are the next implementation steps.

## Run tests and lint

Run from the `backend/` directory with the virtual environment activated:

```bash
python -m pytest
python -m ruff check .
```

## Storage configuration

The application will default to local file storage for development. Amazon S3 is the planned cloud object-storage target. When S3 support is implemented, the backend will use Boto3 and the AWS credential provider chain.

Expected settings:

- `STORAGE_BACKEND=local` or `s3`
- `AWS_REGION` for the bucket's AWS Region
- `AWS_S3_BUCKET` for the bucket name

No AWS credentials are needed for the current local starter. For local AWS development, use an AWS CLI profile or another supported Boto3 credential provider. On AWS-hosted compute, use an IAM role with only the required S3 permissions. Never hardcode or commit access keys.

## Environment variables

Copy `.env.example` to `.env` and keep real secrets in `.env` only. Never commit database passwords, JWT secrets, AWS credentials, or other private configuration.
