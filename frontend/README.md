cd# CloudSync Frontend

CloudSync is a modern, secure, multi-cloud file storage and management web application built with **React**, **TypeScript**, **Tailwind CSS**, and **React Router v6**. It provides a single centralized interface for managing, organizing, sharing, and versioning files across **Microsoft Azure Blob Storage** and **Google Cloud Storage (GCP)**.

---

## Technical Stack

- **Framework**: React.js 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Utilities
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios (with custom interceptors & JWT injection)
- **State Management**: React Context (`AuthContext`, `ThemeContext`, `ToastContext`)

---

## Folder Structure

```
frontend/
├── src/
│   ├── api/                  # Typed Axios client & service modules with Spring Boot REST contracts
│   │   ├── axiosInstance.ts  # Axios client with JWT request header & 401 interceptor
│   │   ├── authApi.ts        # /api/auth endpoints (login, register, me)
│   │   ├── fileApi.ts        # /api/files endpoints (upload, download, delete, rename, move, versions)
│   │   ├── folderApi.ts      # /api/folders endpoints (create, delete, breadcrumbs)
│   │   ├── shareApi.ts       # /api/shares endpoints (create link, get shared file, revoke)
│   │   ├── userApi.ts        # /api/user endpoints (profile, password, storage quota)
│   │   └── adminApi.ts       # /api/admin endpoints (users, storage stats, cloud config toggle)
│   │
│   ├── components/           # Reusable UI component modules
│   │   ├── common/           # Shared UI widgets (Toast, Modal, FileIcon, CloudBadge, StorageMeter)
│   │   ├── layout/           # App Layout, Sidebar, Navbar, ProtectedRoute, AdminRoute
│   │   ├── explorer/         # File explorer (Grid/List views, Breadcrumbs, Drag & Drop upload, Modals)
│   │   ├── file/             # Version history modal & Secure share link modal
│   │   ├── activity/         # Activity audit list & action badges
│   │   └── admin/            # Admin user table, storage allocation chart, cloud provider switch
│   │
│   ├── context/              # Global state providers (AuthContext, ThemeContext, ToastContext)
│   ├── hooks/                # Custom React hooks (useAuth, useTheme, useToast, useDebounce)
│   ├── mock/                 # Interactive mock data dataset for local testing
│   ├── types/                # TypeScript interfaces (Auth, File, Folder, Activity, User, Admin)
│   ├── utils/                # Helper utilities (formatBytes, formatDate, formatRelativeTime)
│   ├── pages/                # Route-level view pages
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SharedFileViewPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ActivityPage.tsx
│   │   ├── AdminPanelPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx               # Root App router & context wrapper
│   ├── index.css             # Tailwind imports & scrollbar styles
│   └── main.tsx              # Vite DOM root entry
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
├── index.html                # HTML entry point with Google Fonts
├── package.json              # Project dependencies & scripts
└── tailwind.config.js        # Tailwind CSS configuration with dark mode support
```

---

## Setup & Running Locally

### 1. Prerequisite
Ensure Node.js (v18+) and `npm` are installed on your machine.

### 2. Installation
Navigate into the `frontend/` directory and install project dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=true
```

- **`VITE_API_BASE_URL`**: Base URL of your Spring Boot REST API.
- **`VITE_USE_MOCK_DATA`**: Set to `true` for out-of-the-box local interactive testing with simulated latency and mock files. Set to `false` when connecting to your live Spring Boot backend.

### 4. Start Development Server

```bash
npm run dev
```

The application will launch at `http://localhost:5173`.

---

## Demo Login Credentials (Mock Mode)

When `VITE_USE_MOCK_DATA=true`, you can click the quick demo login buttons on the login page:

- **Standard User**:
  - Email: `user@cloudsync.io`
  - Access: File Explorer, Upload, Share, Versioning, Activity History, Profile

- **Admin User**:
  - Email: `admin@cloudsync.io`
  - Access: Full access + Admin Dashboard (`/admin`), User Account Control, Multi-Cloud Storage Allocation Chart, Global Cloud Provider Switch (Azure <-> GCP)

---

## Spring Boot REST API Endpoint Specifications

All API service files in `src/api/` include explicit comment blocks and typed Axios methods matching standard REST conventions:

| Service | Method | REST Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| **Auth** | `GET` | `/api/auth/me` | Get currently authenticated user profile |
| **Files** | `GET` | `/api/files` | List files (query params: `folderId`, `search`, `fileType`, `provider`) |
| **Files** | `POST` | `/api/files/upload` | Multipart file upload (`file`, `folderId`, `provider`) |
| **Files** | `GET` | `/api/files/:id/download` | Download raw file binary or presigned URL |
| **Files** | `DELETE` | `/api/files/:id` | Delete file & cloud blob |
| **Files** | `PUT` | `/api/files/:id/rename` | Rename file |
| **Files** | `PUT` | `/api/files/:id/move` | Move file to target folder |
| **Files** | `GET` | `/api/files/:id/versions` | List version history for file |
| **Files** | `POST` | `/api/files/:id/versions/:vId/restore` | Restore specified file version |
| **Folders** | `GET` | `/api/folders` | List folders by parentId |
| **Folders** | `POST` | `/api/folders` | Create new folder |
| **Folders** | `DELETE` | `/api/folders/:id` | Delete folder & nested contents |
| **Folders** | `GET` | `/api/folders/:id/breadcrumbs` | Get folder hierarchy trail |
| **Sharing** | `POST` | `/api/shares` | Generate share link with permission & expiry |
| **Sharing** | `GET` | `/api/shares/:token` | Public shared file details |
| **User** | `GET` | `/api/user/profile` | Get user profile details |
| **User** | `PUT` | `/api/user/profile` | Update profile info |
| **User** | `PUT` | `/api/user/password` | Change account password |
| **User** | `GET` | `/api/user/storage` | Fetch user storage quota metrics |
| **Admin** | `GET` | `/api/admin/users` | List all user accounts |
| **Admin** | `PUT` | `/api/admin/users/:id/status` | Enable/disable user access |
| **Admin** | `DELETE` | `/api/admin/users/:id` | Delete user account |
| **Admin** | `GET` | `/api/admin/storage/stats` | System-wide multi-cloud metrics |
| **Admin** | `PUT` | `/api/admin/cloud-config` | Toggle primary provider (Azure / GCP) |
