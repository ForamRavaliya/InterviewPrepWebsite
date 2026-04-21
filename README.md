# 🚀 Interview Prep Platform

> AI-powered Interview Preparation Platform built with the **PERN stack** (PostgreSQL · Express · React · Node.js)

---

## ✨ Features

| Feature | Description |
|---|---|
| **DSA Practice** | Browse 500+ problems with difficulty filters, category tags & company filters |
| **Live Code Editor** | Monaco Editor (VS Code engine) with multi-language support |
| **AI Mock Interviews** | GPT-4o powered interviewer with real-time feedback & scoring |
| **Company Prep** | Curated problem sets & interview patterns for FAANG & top startups |
| **Resume Builder** | ATS-optimized resume editor with multiple templates |
| **Progress Dashboard** | Streak tracking, heatmap, stats, and submission history |
| **Auth** | JWT-based auth with bcrypt password hashing |

---

## 🗂 Project Structure

```
interview-prep/
├── client/                  # React frontend (CRA)
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── Navbar/      # Collapsible sidebar navigation
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js
│       │   ├── DSAPracticePage.js
│       │   ├── ProblemPage.js       # Monaco code editor
│       │   ├── MockInterviewPage.js
│       │   ├── InterviewSessionPage.js
│       │   ├── CompanyPrepPage.js
│       │   ├── ResumeBuilderPage.js
│       │   └── ProfilePage.js
│       ├── styles/
│       │   └── global.css   # Full design system
│       └── App.js
│
├── server/                  # Express backend
│   ├── config/
│   │   └── db.js            # PostgreSQL pool
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── routes/
│   │   ├── auth.js          # Register, Login, Me
│   │   ├── users.js         # Profile, Password
│   │   ├── dsa.js           # Problems, Submit
│   │   ├── mockInterview.js # Start, Chat, Complete
│   │   ├── company.js       # Company list & problems
│   │   ├── resume.js        # CRUD resumes
│   │   ├── dashboard.js     # Stats aggregation
│   │   └── submissions.js   # Submission history
│   ├── .env.example
│   ├── index.js             # Express app entry
│   └── package.json
│
├── database/
│   └── schema.sql           # Full PostgreSQL schema + seeds
│
├── package.json             # Root (concurrently)
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd interview-prep
npm run install-all
```

### 3. Database Setup

```bash
# Create the database
psql -U postgres
CREATE DATABASE interview_prep_db;
\q

# Run the schema (creates all tables + seed data)
psql -U postgres -d interview_prep_db -f database/schema.sql
```

### 4. Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/interview_prep_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_prep_db
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=sk-...   # Optional: needed for AI mock interviews
CLIENT_URL=http://localhost:3000
```

### 5. Run Development Servers

```bash
# From root — starts both server (5000) and client (3000) concurrently
npm run dev
```

Or run separately:
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend  
cd client && npm start
```

Open **http://localhost:3000** 🎉

---

## 🗄 Database Schema Overview

| Table | Purpose |
|---|---|
| `users` | Accounts, profiles, preferences |
| `dsa_problems` | Problem bank with tags, difficulty, examples |
| `dsa_submissions` | Code submissions per user |
| `user_problem_progress` | Per-user solved/attempted/bookmarked status |
| `mock_interviews` | Interview sessions with AI transcript & feedback |
| `companies` | Company list with metadata |
| `company_questions` | Company-specific interview questions |
| `resumes` | User resumes (JSON content) |
| `user_stats` | Aggregated stats (streak, solved counts, avg score) |
| `daily_activity` | Per-day activity for heatmap & streak tracking |

---

## 🔌 API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/auth/me` | Get current user |

### DSA
| Method | Path | Description |
|---|---|---|
| GET  | `/api/dsa/problems` | List with filters |
| GET  | `/api/dsa/problems/:slug` | Single problem |
| POST | `/api/dsa/problems/:id/submit` | Submit solution |
| GET  | `/api/dsa/categories` | Category list |

### Mock Interview
| Method | Path | Description |
|---|---|---|
| POST | `/api/mock-interview/start` | Start session |
| POST | `/api/mock-interview/:id/message` | AI chat |
| POST | `/api/mock-interview/:id/complete` | End + feedback |
| GET  | `/api/mock-interview/history` | Past sessions |

### Companies, Resume, Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/companies` | Company list |
| GET | `/api/companies/:id/problems` | Company DSA problems |
| GET/POST/PUT/DELETE | `/api/resume` | Resume CRUD |
| GET | `/api/dashboard/stats` | Full dashboard data |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + React Router v6
- Monaco Editor (`@monaco-editor/react`) — VS Code engine
- Recharts — data visualizations
- Axios — HTTP client
- JetBrains Mono + Syne — fonts
- Custom CSS design system (no UI library)

**Backend**
- Express.js 4
- PostgreSQL 14 + `pg` (node-postgres)
- JWT (`jsonwebtoken`) + bcryptjs
- OpenAI SDK v4 — AI mock interviews
- Helmet, CORS, express-rate-limit

---

## 🔮 Extending the Platform

- **Add problems**: Insert rows into `dsa_problems` with slug, description, examples (JSONB)
- **Add companies**: Insert into `companies` table
- **Code execution**: Integrate [Judge0 API](https://judge0.com) in `dsa.js` route for real test case execution
- **Payments**: Add Razorpay/Stripe for premium problem access (`is_premium` flag already in schema)
- **Real-time**: Add Socket.io for live coding sessions or pair programming
- **Email**: Add Nodemailer for password reset, welcome emails

---

## 📦 Production Build

```bash
# Build React
npm run build

# Serve with PM2
cd server
npm install -g pm2
pm2 start index.js --name interview-prep-api

# Or use Docker — add Dockerfile per your needs
```

---

## 📄 License

MIT — built for learning and portfolio purposes.
