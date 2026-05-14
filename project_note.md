# 📋 School Management System — Complete Project Note

> **One-page summary of the entire project across both codebases.**

---

## 🎯 Purpose

This is a **full-stack School Management System / ERP** (called **EduManage Enterprise**) that digitises school operations end-to-end — user administration, academic scheduling, attendance, marks, fee collection, messaging, AI study assistance, and analytics dashboards.

It spans **two codebases** maintained in parallel:

| Codebase | Path | Backend Stack | Status |
|----------|------|---------------|--------|
| **Primary (Java)** | `d:\Project` | Spring Boot 3.2.5 + MongoDB | Active — advanced features (2FA, WebSocket forums, audit logs, PDF reports) |
| **Secondary (Node.js)** | `d:\project2` | Express 5 + Mongoose 9 | Active — deployed via Render + Vercel |

Both share the **same React + Vite frontend** architecture and connect to **MongoDB Atlas**.

---

## 👥 User Roles & Portals

| Role | Key Capabilities |
|------|-----------------|
| **Admin** | Full CRUD for users, classes, timetables, fees, announcements, attendance settings |
| **Teacher** | Timetable view, marks entry, attendance management, homework assignment, messaging |
| **Student** | Dashboard, timetable, marks view, attendance history, AI chatbot ("Study Buddy") |
| **Parent** | Children overview, fee tracking, messaging |
| **Principal** | Analytics dashboard, institutional reports |

---

## 🛠️ Technology Stack

### Backend — `d:\project2\backend` (Node.js)

| Layer | Technology |
|-------|-----------|
| Runtime | **Node.js** with **Express 5.2** |
| Database | **MongoDB Atlas** via **Mongoose 9.6** |
| Auth | **JWT** (jsonwebtoken 9) + **bcrypt 6** |
| AI | **Google Generative AI** SDK 0.24 |
| Testing | **Jest 30** + **Supertest 7** |
| Dev Tools | **Nodemon 3**, dotenv 17 |

### Backend — `d:\Project\src` (Java / Spring Boot)

| Layer | Technology |
|-------|-----------|
| Framework | **Spring Boot 3.2.5** (Java 17) |
| Database | **MongoDB Atlas** (spring-data-mongodb) |
| Auth | **Spring Security + JWT** (jjwt 0.11.5) with refresh tokens |
| Real-Time | **WebSocket** (STOMP over SockJS) |
| Payments | **Razorpay** Java SDK 1.4.3 |
| Files | **Cloudinary** (image/asset hosting) |
| PDF | **iText 7** for transcript generation |
| Build | **Maven** |

### Frontend — `d:\project2\frontend` (shared architecture)

| Layer | Technology |
|-------|-----------|
| Framework | **React 19** + **Vite 8** |
| Routing | **React Router DOM 7** |
| HTTP | **Axios** |
| Styling | **Tailwind CSS 4** + PostCSS + Autoprefixer |
| Animations | **Framer Motion 12** |
| Icons | **Lucide React** |
| Charts | **Recharts 3** |
| CSV Import | **PapaParse 5** |

---

## 📁 Project Structure Summary

### Node.js Backend (`d:\project2\backend\src`)

```
src/
├── server.js              # Entry point (Express app startup)
├── app.js                 # Express app config (CORS, middleware)
├── config/                # DB connection, env config
├── middleware/             # Auth middleware (JWT verification)
├── models/                # 14 Mongoose models
├── controllers/           # 9 controllers
└── routes/                # 9 route modules
```

### Frontend (`d:\project2\frontend\src`)

```
src/
├── App.jsx                # Main router with lazy-loaded pages
├── main.jsx               # React entry point
├── index.css              # Global styles
├── components/
│   ├── Layout.jsx         # Sidebar + navbar shell
│   └── ProtectedRoute.jsx # Role-based route guard
├── contexts/
│   └── AuthContext.jsx    # JWT auth state management
├── lib/                   # API client, utilities
└── pages/                 # 22 page components
```

---

## 📊 Data Models (14 Mongoose Models)

| Model | Purpose |
|-------|---------|
| `User` | Core identity — email, password, role, OAuth tokens |
| `Student` | Student profile — linked to User & parent |
| `Teacher` | Teacher profile — subjects |
| `Class` | Academic class — name, section, students, teachers |
| `TeacherAllocation` | Teacher ↔ Class/Subject mapping |
| `Timetable` | Period-wise schedule entries per class |
| `Attendance` | Per-student, per-period attendance records |
| `Mark` | Subject-wise marks per student |
| `Homework` | Assignments created by teachers |
| `Fee` | Fee records and payment status |
| `Message` | Direct messages between users |
| `Notification` | System notifications |
| `Subject` | Subject master data |
| `LeaveRequest` | Student/teacher leave requests |

---

## 🌐 API Surface (9 Route Modules)

| Route File | Prefix | Purpose |
|------------|--------|---------|
| `authRoutes` | `/api/auth` | Login, register, token management |
| `adminRoutes` | `/api/admin` | User & class CRUD, timetable, fees, announcements |
| `teacherRoutes` | `/api/teacher` | Dashboard, marks, attendance, homework, timetable |
| `studentRoutes` | `/api/student` | Dashboard, marks, attendance, timetable |
| `parentRoutes` | `/api/parent` | Children overview, fee tracking |
| `principalRoutes` | `/api/principal` | Analytics, institutional stats |
| `messageRoutes` | `/api/messages` | Direct messaging |
| `notificationRoutes` | `/api/notifications` | Notification retrieval |
| `chatbotRoutes` | `/api/chatbot` | AI study-buddy (Google Gemini) |

---

## 📄 Frontend Pages (22 Pages)

| Page | Role | Purpose |
|------|------|---------|
| `Login` / `Register` | All | Authentication |
| `OAuthCallback` | All | OAuth redirect handler |
| `AdminDashboard` | Admin | System overview stats |
| `UserManagement` | Admin | CRUD for all users |
| `ClassManagement` | Admin | Classes, timetable assignment |
| `FeeManagement` | Admin | Fee creation & tracking |
| `Announcements` | Admin | School-wide broadcasts |
| `ReportsOverview` | Admin | Downloadable reports |
| `TeacherDashboard` | Teacher | Teacher home |
| `TeacherTimetable` | Teacher | Weekly schedule view |
| `AttendanceManagement` | Teacher | Period-wise attendance entry |
| `UpdateMarks` | Teacher | Grade entry per subject |
| `AssignHomework` | Teacher | Homework assignment |
| `StudentDashboard` | Student | Student home |
| `StudentTimetable` | Student | Weekly schedule view |
| `StudentMarks` | Student | Grade card |
| `StudentAttendance` | Student | Attendance history |
| `StudentChatbot` | Student | AI study assistant |
| `ParentDashboard` | Parent | Children overview |
| `PrincipalDashboard` | Principal | Analytics |
| `Messages` | All | Direct messaging |

---

## 🚀 Deployment Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Vercel (CDN)  │◄──────►│  Render (Node)   │◄──────►│  MongoDB Atlas  │
│   React SPA     │  REST  │  Express API     │  Mongo │  Cloud DB       │
│   dist/ folder  │  API   │  Port 5000       │  URI   │                 │
└─────────────────┘        └──────────────────┘        └─────────────────┘
```

- **Frontend** → Vercel (static `dist/` build)
- **Backend** → Render (Node.js web service)
- **Database** → MongoDB Atlas (cloud cluster)
- OAuth callbacks configured for Google, Microsoft, Apple

---

## 🔐 Security

- **JWT-based authentication** with access tokens
- **bcrypt** password hashing (cost factor default)
- **Role-based access control** enforced at both route middleware (backend) and `ProtectedRoute` component (frontend)
- **CORS** configured for Vercel preview domains
- **Helmet** middleware for HTTP security headers (production)

---

## ✅ Current Status & Key Development Areas

| Area | Status |
|------|--------|
| Authentication (Login/Register/OAuth) | ✅ Working |
| Admin CRUD (Users, Classes) | ✅ Working |
| Timetable Management | ✅ Working — admin configures, teacher/student views |
| Period-wise Attendance | ✅ Working — linked to timetables |
| Marks Entry & Viewing | ✅ Working — teacher enters, student views |
| Fee Management | ✅ Working |
| Direct Messaging | ✅ Working |
| AI Study Chatbot | ✅ Working — Google Gemini powered |
| Parent Portal | ✅ Working — child data views |
| Principal Analytics | ✅ Working |
| Forum System | 🔧 In Java codebase (WebSocket-based) |
| 2FA Authentication | 🔧 In Java codebase |
| Audit Logging | 🔧 In Java codebase |
| PDF Report Generation | 🔧 In Java codebase (iText 7) |
| Razorpay Payments | 🔧 In Java codebase |

---

## 📈 Scale at a Glance

| Metric | Count |
|--------|-------|
| User Roles | 5 |
| Data Models | 14 |
| API Route Modules | 9 |
| Controllers | 9 |
| Frontend Pages | 22 |
| Frontend Components | 2 (Layout, ProtectedRoute) |
| Context Providers | 1 (Auth) |
| Third-Party Integrations | Google Gemini AI, MongoDB Atlas, OAuth (Google/MS/Apple) |

---

> **In short**: EduManage Enterprise is a comprehensive, multi-role school ERP with a React + Vite frontend, dual backends (Node.js for production deployment, Java/Spring Boot for advanced features), MongoDB Atlas storage, AI-powered study assistance, and deployment on Vercel + Render.
