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

Start the FastAPI backend and PostgreSQL first. The backend should be available at `http://127.0.0.1:8000`.

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
```

Do not commit the local `.env` file. The API base URL must include the FastAPI versioned prefix `/api/v1`.

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
| GET | `/api/v1/shares/{token}` | Load public shared-file details |
| GET | `/api/v1/shares/{token}/download` | Download through a valid share token |

## Build

```bash
npm ci
npm run build
```

The root GitHub Actions workflow also builds the frontend and runs the Python backend tests and lint checks.

## Storage

The current frontend uploads to the backend's local storage implementation. Amazon S3 is planned as the next storage backend; the frontend should continue using the same API contract when S3 is introduced.
