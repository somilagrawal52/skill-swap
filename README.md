# 🔄 SkillSwap - Peer-to-Peer Knowledge Barter Platform

A modern, full-stack **MERN** (MongoDB, Express.js, React, Node.js) platform designed for bilateral, money-free knowledge exchange. Trade your skills directly with peers worldwide: teach web development to learn Spanish, or swap UI/UX design in Figma for acoustic guitar lessons.

---

## 🌟 Key Features

### 1. 🛡️ Dual-Skill Profiles & Authentication
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing (password hashes stripped from all responses).
- **Dual-Skill Matrix**:
  - *Skills I Can Teach* (Offered skills with category, proficiency level, and tags).
  - *Skills I Want to Learn* (Target learning goals powering the match engine).
- **Rich Profiles**: User bios, headlines, avatars, timezones, and direct contact channels (Discord, GitHub, LinkedIn, Calendly).

### 2. ⚡ Smart Barter Matching Engine
- **Reciprocal Matching Algorithm**: Automatically identifies and ranks compatible exchange partners based on dual-skill intersection:
  - **★ Perfect Barter Match**: User A teaches what User B wants AND User B teaches what User A wants.
  - **Complementary Match**: Matches where one user's offerings satisfy the other's learning goals.
- **Dynamic Marketplace**: Filter by Category (Development, Design, Languages, Marketing, Music, etc.), Proficiency Level (Beginner to Expert), and keyword search.

### 3. 🔄 Complete Exchange Lifecycle
- **Proposal Workflow**: Propose swaps with custom notes and mutual skill selection.
- **Tabbed Dashboard**:
  - **Active Swaps**: Ongoing sessions with meeting links and coordination notes.
  - **Incoming Proposals**: Review and Accept or Decline incoming requests.
  - **Sent Proposals**: Track status (Pending, Accepted, Declined) with cancel capability.
  - **Completed History**: Archive of past successful exchanges.
- **Session Collaboration**: Built-in coordination modal to share Google Meet / Zoom / Discord room links and session agendas.

### 4. ⭐ Reputation, Trust & Reviews
- **1-5 Star Ratings & Testimonials**: Submit verified feedback upon swap completion.
- **Aggregated Trust Scores**: Automatic recalculation of member average ratings and review counts.
- **Public Profile Reviews**: Transparent community feedback displayed on profiles.

### 5. 🔔 In-App Notification Center
- Real-time notification drawer with unread badges for:
  - New swap proposals received
  - Proposal accepted / declined
  - Swap marked as completed
  - New peer review received
- "Mark all as read" capability.

### 6. 🎨 Modern, Responsive UI/UX
- Built with **React 19**, **Vite**, **Tailwind CSS**, and **Lucide Icons**.
- Interactive modals (Swap Proposal Modal, Session Notes Modal, Review Modal).
- Clean mobile-responsive drawer and desktop navigation bar.

---

## 🏗️ Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Frontend [Client - React 19 + Vite + Tailwind]
        A[Navbar & Notification Center]
        B[Explore Marketplace & Smart Matches]
        C[Tabbed Dashboard & Swap Manager]
        D[Skills & Learning Goals Matrix]
        E[Public & Self Profile Pages]
    end

    subgraph Backend [Server - Express.js REST API]
        F[Auth & Profile Controller]
        G[Skill & Matching Controller]
        H[Swap Lifecycle Controller]
        I[Reviews & Trust Controller]
        J[Notification Controller]
    end

    subgraph Database [MongoDB Schemas]
        K[(Users)]
        L[(Skills)]
        M[(SwapRequests)]
        N[(Reviews)]
        O[(Notifications)]
    end

    Frontend --> Backend
    Backend --> Database
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new member | No |
| `POST` | `/api/auth/login` | Login and obtain JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Yes |
| `PUT` | `/api/auth/profile` | Update profile, bio & skills needed | Yes |
| `GET` | `/api/auth/profile/:id` | View another user's public profile | No |
| `GET` | `/api/skills/all` | Query marketplace skills with filters | Optional |
| `GET` | `/api/skills/matches` | Retrieve smart barter matches for user | Yes |
| `POST` | `/api/skills/create` | List a new skill | Yes |
| `PUT` | `/api/skills/:id` | Edit owned skill | Yes |
| `DELETE` | `/api/skills/:id` | Delete owned skill | Yes |
| `POST` | `/api/requests/send` | Propose a skill swap | Yes |
| `GET` | `/api/requests/incoming` | Get incoming swap proposals | Yes |
| `GET` | `/api/requests/sent` | Get sent proposals | Yes |
| `PUT` | `/api/requests/respond/:id` | Accept or decline proposal | Yes |
| `PUT` | `/api/requests/cancel/:id` | Cancel pending proposal | Yes |
| `PUT` | `/api/requests/complete/:id` | Mark swap as completed | Yes |
| `PUT` | `/api/requests/notes/:id` | Update meeting link & session notes | Yes |
| `POST` | `/api/reviews` | Submit star rating & feedback | Yes |
| `GET` | `/api/reviews/user/:userId`| Get reviews received by a user | No |
| `GET` | `/api/notifications` | Get user notifications & unread count | Yes |
| `PUT` | `/api/notifications/read-all`| Mark all notifications read | Yes |
| `GET` | `/api/users` | Community directory search | No |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas connection string)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd Skill-Swap

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Create/verify `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/skill-swap
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### 3. Seed Demo Data (Optional but Recommended)
Populate the database with realistic demo mentors, skills, and reciprocal barter pairs:
```bash
node server/utils/seed.js
```

### 4. Run the Application
In one terminal, start the backend:
```bash
cd server
npm start
```

In a second terminal, start the frontend:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to explore the platform.

---

## 👥 Demo Accounts (Password: `password123`)

| Name | Role / Specialty | Email |
|---|---|---|
| **Elena Rostova** | Senior UI/UX Designer (Figma, Design Systems) | `elena@skillswap.io` |
| **Marcus Vance** | Full-Stack Engineer (Node.js, React, Docker) | `marcus@skillswap.io` |
| **Sofia Morales** | Native Spanish Coach (Conversational Spanish) | `sofia@skillswap.io` |
| **David Chen** | Growth Marketer (SEO, Content Strategy) | `david@skillswap.io` |
| **Chloe Martin** | Acoustic Guitarist & Songwriter | `chloe@skillswap.io` |
| **Aarav Patel** | Data Scientist (Python, pandas, ML) | `aarav@skillswap.io` |

---

## 🌐 Production Hosting & Deployment Guide

SkillSwap is 100% production-ready across all major cloud providers and PaaS platforms.

### 🚀 Path 1: 1-Click All-in-One Deployment on Render.com (Recommended Free Tier)
Deploy both the Frontend and Backend together as a single unified service (saving costs and avoiding CORS issues):
1. Create a free account at [Render.com](https://render.com).
2. Click **New +** ➔ **Blueprint** and connect your GitHub repository (`somilagrawal52/skill-swap`).
3. Render automatically detects [`render.yaml`](./render.yaml):
   - **Build Command**: `npm run install:all && npm run build:client`
   - **Start Command**: `npm start`
4. Set your **`MONGO_URI`** (e.g. from your free MongoDB Atlas cluster).
5. Click **Apply**! Your app will be live with SSL at `https://your-app.onrender.com`.

### ⚡ Path 2: Split Hosting (Vercel Frontend + Render/Railway API)
Host the frontend on Vercel's global CDN and the backend on Render or Railway:
1. **Backend (Render or Railway)**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node app.js`
   - Environment Variables:
     - `MONGO_URI`: `mongodb+srv://...` (from MongoDB Atlas)
     - `JWT_SECRET`: A secure 32+ character random string
     - `NODE_ENV`: `production`
     - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
2. **Frontend (Vercel)**:
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Environment Variable:
     - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - *(Note: [`client/vercel.json`](./client/vercel.json) is already included to prevent 404s on page refresh)*

### 🐳 Path 3: Self-Hosted Docker Deployment (Any Linux VPS / AWS EC2 / DigitalOcean)
Run MongoDB, the Node.js API, and Nginx web server with one command:
```bash
docker-compose up -d --build
```
Your platform will immediately be accessible on port 80.
