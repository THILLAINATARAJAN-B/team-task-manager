<div align="center">

<h1>✅ Team Task Manager</h1>

### A full-stack collaborative task management web application

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Secured-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

**Register · Authenticate · Manage Projects · Assign Tasks · Track Progress**

[Live Demo](#-live-demo) · [Backend Docs](#-backend--spring-boot-api) · [Frontend Docs](#-frontend--react-vite) · [Getting Started](#-getting-started) · [License](#-license)

---

</div>

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Overview](#-overview)
- [Repository Structure](#-repository-structure)
- [Tech Stack](#-tech-stack)
- [Backend — Spring Boot API](#-backend--spring-boot-api)
- [Frontend — React Vite](#-frontend--react-vite)
- [Getting Started](#-getting-started)
- [Deployment — Railway](#-deployment--railway)
- [Roadmap](#️-roadmap)
- [Author](#-author)
- [License](#-license)

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🌐 Frontend | [https://team-task-manager-frontend-production-4d58.up.railway.app](https://team-task-manager-frontend-production-4d58.up.railway.app) |
| ⚙️ Backend API | [https://team-task-manager-backend-production-3dd0.up.railway.app](https://team-task-manager-backend-production-3dd0.up.railway.app) |

> **Test Credentials**
> | Role | Email | Password |
> |---|---|---|
> | Admin | alex@taskflow.com | Admin@123 |
> | Member | sarah@taskflow.com | Member@123 |

---

## 🌟 Overview

**Team Task Manager** is a full-stack collaborative web application for managing projects and tasks within a team. It features a **Spring Boot 3 REST API** backend and a **React 18 + Vite SPA** frontend, connected via JWT-secured HTTP calls and deployed live on **Railway**.

Users can:

- 🔐 Register and log in with secure JWT authentication
- 📁 Create projects and add team members
- ✅ Create tasks with title, description, priority, due date, and assignee
- 📋 Visualize tasks on a **Kanban board** (To Do → In Progress → In Review → Done)
- 📊 View a **dashboard** with task stats, overdue alerts, and recent activity
- 🔒 Access role-based features — Admin manages everything, Members update only their tasks

---

## 📁 Repository Structure

```
team-task-manager/
├── backend/                        # Spring Boot 3 REST API (Java 17)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/taskmanager/
│   │       │   ├── config/         # Security, JWT filter, CORS
│   │       │   ├── controller/     # Auth, Project, Task, Dashboard, User
│   │       │   ├── dto/            # Request & Response DTOs
│   │       │   ├── entity/         # User, Project, Task, ProjectMember
│   │       │   ├── enums/          # Role, TaskStatus, TaskPriority
│   │       │   ├── exception/      # GlobalExceptionHandler
│   │       │   ├── repository/     # JPA repositories with JPQL queries
│   │       │   ├── security/       # JwtService
│   │       │   └── service/        # Business logic layer
│   │       └── resources/
│   │           └── application.properties
│   ├── Dockerfile
│   ├── railway.toml
│   └── pom.xml
│
├── frontend/                       # React 18 + Vite SPA
│   ├── src/
│   │   ├── api/                    # Axios instance
│   │   ├── components/             # Layout, Project, Task, UI components
│   │   ├── context/                # AuthContext
│   │   ├── hooks/                  # useAuth
│   │   ├── pages/                  # Login, Signup, Dashboard, Projects, Tasks
│   │   └── utils/                  # Helpers, constants
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── package.json
│
└── README.md                       ← You are here
```

---

## 🚀 Tech Stack

### Backend
| Layer | Technology | Version |
|---|---|---|
| Language | Java | 17 |
| Framework | Spring Boot | 3 |
| Security | Spring Security + JWT (jjwt) | Latest |
| Database | MySQL + Spring Data JPA + Hibernate | 8.0 |
| Build | Maven | 3.9+ |
| Containerization | Docker | Multi-stage build |
| Deployment | Railway | Cloud |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | SPA framework |
| Vite | 5+ | Build tool |
| TailwindCSS | 3 | Utility-first styling |
| React Query | 5 | Server state management |
| React Hook Form | 7 | Form handling & validation |
| Axios | 1+ | HTTP client |
| React Router | 6 | Client-side routing |
| Lucide React | Latest | Icon library |
| date-fns | Latest | Date formatting |
| React Hot Toast | Latest | Notifications |

---

## ⚙️ Backend — Spring Boot API

A production-ready **Spring Boot REST API** secured with JWT, following a clean layered architecture with proper separation of concerns.

### Key Features
- Stateless JWT authentication with BCrypt password hashing
- Full CRUD for Users, Projects, Tasks, and Project Members
- Role-based access control (ADMIN / MEMBER) at API level
- Kanban-style task status transitions with completion tracking
- Dashboard aggregation with overdue detection
- Custom `GlobalExceptionHandler` with structured error responses
- CORS configured via environment variables

### API Endpoints Summary

| Domain | Endpoints |
|---|---|
| 🔑 Auth | `POST /api/auth/signup` · `POST /api/auth/login` |
| 👤 Users | `GET /api/users` · `GET /api/users/me` |
| 📁 Projects | `GET · POST · PUT · DELETE /api/projects` + member management |
| ✅ Tasks | `GET · POST · PUT · DELETE /api/tasks` + `PATCH /status` |
| 📊 Dashboard | `GET /api/dashboard` |

### Authentication Flow

```
POST /api/auth/login  →  { "token": "eyJ...", "role": "ADMIN", "userId": 1 }
         ↓
Frontend stores token  →  Sent as Authorization: Bearer <token> on every request
         ↓
JwtAuthFilter validates token  →  Sets SecurityContext  →  Request proceeds
```

### Security Design

| Feature | Implementation |
|---|---|
| Password Storage | BCrypt (one-way, salted) |
| Token Type | JWT · HS256 · 24h expiry |
| Session | Fully stateless — `STATELESS` policy |
| Filter | `OncePerRequestFilter` · skips `/api/auth/**` |
| Role Enforcement | Backend validates role on every protected endpoint |

### Database Schema

```
users ──────────────────────────────────────────────────────────
  id, email, password, fullName, role, createdAt

projects ───────────────────────────────────────────────────────
  id, name, description, deadline, createdAt, owner_id (FK → users)

project_members ────────────────────────────────────────────────
  id, project_id (FK), user_id (FK), role
  UNIQUE(project_id, user_id)

tasks ──────────────────────────────────────────────────────────
  id, title, description, status, priority, dueDate,
  createdAt, updatedAt, completedAt,
  project_id (FK), assigned_to (FK), created_by (FK), completed_by_id (FK)
```

---

## 🖥️ Frontend — React Vite

A modern **React 18 SPA** using React Query for server state, React Hook Form for validation, and TailwindCSS for styling — connected to the Spring Boot backend via Axios.

### Key Features
- Login & Signup with JWT stored in React Context
- `ProtectedRoute` guards all private pages
- Kanban board with real-time status updates via dropdown
- Project cards with progress bar (completed/total tasks)
- Role-based UI — Members see greyed-out fields they cannot edit
- Dashboard with stats cards — total, in-progress, overdue, completed
- Toast notifications for all actions
- Error boundary for graceful crash handling
- Responsive layout with sidebar navigation

### Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login | 🌐 Public |
| `/signup` | Register | 🌐 Public |
| `/dashboard` | Stats + recent activity | 🔒 Protected |
| `/projects` | Project list + create | 🔒 Protected |
| `/projects/:id` | Kanban board + task management | 🔒 Protected |

### Role-Based UI

| Feature | Admin | Member |
|---|---|---|
| Create / Delete Project | ✅ | ❌ |
| Add / Remove Members | ✅ | ❌ |
| Create / Delete Task | ✅ | ❌ |
| Edit Task (title, priority, assignee) | ✅ | ❌ |
| Update Task Status | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |

---

## 🏁 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| MySQL | 8.0+ |
| Maven | 3.9+ |
| Node.js | 22+ |
| npm | 9+ |

---

### 1. Clone the Repository

```bash
git clone https://github.com/THILLAINATARAJAN-B/team-task-manager.git
cd team-task-manager
```

---

### 2. Start the Backend

```bash
cd backend
```

Create the database:

```sql
CREATE DATABASE taskmanager_db;
```

Configure `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskmanager_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

app.jwt.secret=your_base64_secret_here
app.jwt.expiration=86400000

app.cors.allowed-origins=http://localhost:5173
```

Build and run:

```bash
mvn clean package -DskipTests
java -jar target/*.jar
```

> API live at → `http://localhost:8080`

---

### 3. Start the Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

Run:

```bash
npm run dev
```

> App live at → `http://localhost:5173`

---

## 🚂 Deployment — Railway

This application is fully deployed on **Railway** using 3 services:

```
Railway Project: team-task-manager
├── 🗄️  MySQL          — Database service
├── ⚙️  backend        — Spring Boot (Dockerfile build)
└── 🌐  frontend       — React/Vite (Dockerfile + nginx)
```

### Backend Environment Variables

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://${{MySQL.MYSQLHOST}}:3306/${{MySQL.MYSQL_DATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `SPRING_DATASOURCE_USERNAME` | `root` |
| `SPRING_DATASOURCE_PASSWORD` | `${{MySQL.MYSQL_ROOT_PASSWORD}}` |
| `JWT_SECRET` | Base64 encoded 64-byte secret |
| `JWT_EXPIRATION` | `86400000` |
| `CORS_ALLOWED_ORIGINS` | Frontend Railway URL |
| `PORT` | `8080` |

### Frontend Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend Railway URL |

### Deployment Notes
- Backend uses a **multi-stage Dockerfile** — Maven builds the JAR, Eclipse Temurin runs it
- Frontend uses a **multi-stage Dockerfile** — Node 22 builds the Vite app, nginx serves it
- `railway.toml` in backend folder locks the Dockerfile path for consistent builds
- Database credentials are never hardcoded — all injected via Railway reference variables

---

## 🛣️ Roadmap

| Version | Feature | Status |
|---|---|---|
| **1.0** | JWT auth · Project & Task CRUD · Kanban board · Dashboard · Railway deployment | ✅ Complete |
| **1.1** | Task comments and activity log | 🔮 Planned |
| **1.1** | Email notifications for task assignments | 🔮 Planned |
| **1.1** | File attachments on tasks | 🔮 Planned |
| **1.2** | Drag-and-drop Kanban board | 🔮 Planned |
| **1.2** | Pagination and search across projects | 🔮 Planned |
| **1.2** | Unit and integration tests | 🔮 Planned |
| **1.2** | Spring Boot Actuator health monitoring | 🔮 Planned |

---

## 👨‍💻 Author

**Thillainatarajan B**

- 🔧 Backend: Spring Boot 3 · Spring Security · JWT · MySQL · JPA
- 🖥️ Frontend: React 18 · Vite · TailwindCSS · React Query
- 🚂 Deployment: Railway · Docker · nginx
- 🔗 GitHub: [THILLAINATARAJAN-B](https://github.com/THILLAINATARAJAN-B)

---

## 📄 License

```
MIT License

Copyright (c) 2026 Thillainatarajan B

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

Made with ❤️ using Spring Boot 3 · React 18 · MySQL · Railway

Give this repo a ⭐ if you found it useful!

</div>
