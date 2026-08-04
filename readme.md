# CloudSync
### A Secure Multi-Cloud File Storage and Management Platform

CloudSync is a cloud-based file storage and management platform that allows users to securely upload, organize, manage, and share files through a single web application. The platform supports Microsoft Azure Blob Storage and Google Cloud Storage, providing a unified experience for managing files across different cloud services.

---

## Project Overview

Managing files across multiple cloud providers can be challenging because every provider has its own interface and API. CloudSync solves this problem by offering a centralized platform where users can upload, organize, search, and share files without switching between different cloud services.

---

## Features

### User Features
- User Registration & Login
- JWT Authentication
- Upload Files
- Download Files
- Delete Files
- Folder Management
- File Search
- File Version History
- Secure File Sharing
- Activity History
- User Profile Management

### Admin Features
- Manage Users
- View Storage Statistics
- View Activity Logs
- Configure Default Cloud Provider

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Spring Boot (Java)
- Spring Security
- Spring Data JPA
- REST APIs

### Database
- PostgreSQL

### Cloud Storage
- Microsoft Azure Blob Storage
- Google Cloud Storage

### DevOps
- Docker
- Git & GitHub
- GitHub Actions
- Azure App Service

---

## Project Objectives

- Build a secure cloud-based file management system.
- Support multiple cloud storage providers.
- Implement JWT-based authentication.
- Enable secure file upload, download, and sharing.
- Store metadata in PostgreSQL.
- Deploy using Docker and Microsoft Azure.
- Demonstrate Cloud Computing and DevOps practices.

---

## Project Structure

```
CloudSync/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
│
├── database/
│   └── schema.sql
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│
├── docs/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/cloudsync.git
cd cloudsync
```

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file and configure:

```env
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

JWT_SECRET=

AZURE_STORAGE_CONNECTION_STRING=

GCP_PROJECT_ID=
GCP_BUCKET_NAME=
GCP_CREDENTIALS=
```

---

## Implementation Roadmap

- Planning & Architecture Design
- Backend Development
- JWT Security Integration
- Multi-Cloud Storage Integration
- Frontend Development
- Advanced Features
- Docker Containerization
- GitHub Actions CI/CD
- Azure Deployment

---

## Future Enhancements

- File Encryption
- Two-Factor Authentication (2FA)
- AI-Based File Organization
- Mobile Application
- Real-Time Collaboration
- Storage Analytics Dashboard

---

## Contributors

- 25MCC20050
- 25MCC20051
- 25MCC200
---

## License

This project is developed for academic purposes.
