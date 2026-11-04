# CloudSync Frontend

The CloudSync frontend is built with React, TypeScript, Vite and Tailwind CSS. It is connected to the Python FastAPI MVP in the repository root.

## Current frontend features

- Account registration and login
- JWT-backed session validation
- File dashboard with search and grid/list views
- Multi-file upload with progress display
- File download and deletion
- Share-link generation with 7-day, 30-day or no-expiry options
- Public shared-file page and download
- Storage badge reflects whether a file is stored locally or in Amazon S3
- Light/dark theme

Folders, file renaming, file versions, admin tools, activity logs and profile/quota screens are not part of the current connected MVP.

## Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React icons
- React Context for authentication, theme and toast messages

## Run locally (Windows Git Bash)

Start PostgreSQL and the FastAPI backend first. The backend should be available at `http://127.0.0.1:8000`.

From the repository root, open a second Git Bash terminal:

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Open http://localhost:5173.

The tracked `.env.example` contains:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_USE_MOCK_DATA=false
VITE_PUBLIC_APP_URL=http://localhost:5173
```

- `VITE_API_BASE_URL` is the FastAPI base URL and must include `/api/v1`.
- `VITE_PUBLIC_APP_URL` is the base URL placed in generated share links.
- In local development, `http://localhost:5173` is expected. It works only on the developer's computer.
- For a public deployment, set `VITE_PUBLIC_APP_URL` to the public frontend HTTPS URL and `VITE_API_BASE_URL` to the public FastAPI HTTPS URL ending in `/api/v1`. Rebuild/restart Vite after changing Vite environment variables.

Do not commit the local `.env` file.

## How sharing works

A share link points to the CloudSync frontend's shared-file page, for example:

```text
https://cloudsync.example.com/shared/<share-token>
```

The React page asks FastAPI to validate the token and its expiry. When the recipient downloads, FastAPI retrieves the file from its recorded storage backend (local disk or private S3) and streams it to the browser.

The link is not an S3 URL. Keeping the bucket private means recipients do not get direct public bucket access. A localhost link is not internet-accessible; to share with other people, deploy the frontend and backend to public HTTPS addresses or expose both through correctly configured temporary HTTPS tunnels.

## Connected API operations

| Method | Endpoint | Frontend use |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Create account; the UI then signs the user in |
| POST | `/api/v1/auth/login` | Authenticate and store JWT |
| GET | `/api/v1/auth/me` | Validate the current session |
| POST | `/api/v1/files` | Upload a file using multipart form data |
| GET | `/api/v1/files` | List the current user's files |
| GET | `/api/v1/files/{file_id}/download` | Download an owned file |
| DELETE | `/api/v1/files/{file_id}` | Delete an owned file |
| POST | `/api/v1/files/{file_id}/share` | Generate a share link |
| GET | `/api/v1/shares/{token}` | Load public shared-file details, including storage backend |
| GET | `/api/v1/shares/{token}/download` | Download through a valid share token |

## Build

```bash
npm ci
npm run build
```

The root GitHub Actions workflow also builds the frontend and runs the Python backend tests and lint checks.

## Storage

The frontend sends uploads to FastAPI. The backend stores new files in the configured local or S3 backend. The frontend continues to use the same API contract in either mode; it does not connect directly to S3.
