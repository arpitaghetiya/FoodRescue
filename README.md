# FoodRescue
## Smart Food Donation and Redistribution Platform

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748.svg)](https://www.prisma.io/)
[![Status](https://img.shields.io/badge/Build-Passing-emerald.svg)]()

> **University Software Engineering Capstone Project**  
> Developed for a strict two-day deadline by a four-member engineering team.  
> Target: **UN Sustainable Development Goal 2 (Zero Hunger)** and **Goal 12 (Responsible Consumption & Production)**.

---

## 1. Executive Summary

**FoodRescue** is a full-stack web platform bridging commercial food donors (restaurants, hotels, bakeries, caterers, supermarkets) with verified humanitarian non-governmental organizations (shelters, soup kitchens, food banks).

The platform eliminates food wastage through an end-to-end, permission-controlled donation pipeline with administrative verification of charities, automated expiration controls, and real-time status tracking.

---

## 2. Technology Stack & Architectural Decisions

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Router v6, Lucide React | Type-safe component architecture with responsive mobile-first UI and fast modern iconography. |
| **Backend** | Node.js, Express.js (ES Modules), TypeScript | Scalable, non-blocking asynchronous REST API with typed controllers and Zod payload validation. |
| **Database** | Relational SQLite via Prisma ORM | Zero-configuration, file-based relational persistence (`foodrescue.db`) eliminating daemon setup delays, with 100% PostgreSQL schema compatibility. |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs (salt rounds 10) | Stateless secure session tokens, strict role-based access control (RBAC), and protected endpoints. |

---

## 3. Demo Credentials (For University Evaluation)

The application includes realistic sample data seeded into the persistent database. Convenient **1-Click Demo Login** buttons are also available on the Login page (`/login`) for instantaneous testing.

| Role | Organization | Email Address | Password | Permissions / Capabilities |
|---|---|---|---|---|
| **Admin** | FoodRescue Ops | `admin@foodrescue.org` | `Admin@123` | Verify/reject NGOs, view all users & listings, remove unsafe listings, platform analytics. |
| **Donor** | Green Garden Bistro | `donor.green@foodrescue.org` | `Donor@123` | Post cooked meals, manage listings, review & approve NGO requests, schedule pickups. |
| **Donor** | Sunrise Artisan Bakery | `donor.bake@foodrescue.org` | `Donor@123` | Post surplus baked goods, manage listings, confirm meal collections. |
| **NGO (Verified)** | Hope Haven Shelter | `ngo.hope@foodrescue.org` | `Ngo@123` | Search & filter food, claim available donations, track pickup schedules & completions. |
| **NGO (Verified)** | City Care Food Bank | `ngo.city@foodrescue.org` | `Ngo@123` | Browse listings, submit requests, confirm community distributions. |
| **NGO (Pending)** | New Dawn Relief | `ngo.new@foodrescue.org` | `Ngo@123` | **Pending verification.** Allowed to browse listings, but blocked from requesting food until approved by Admin. |

---

## 4. Quick Start & Execution Instructions

### Prerequisites
- Node.js (v18+ or v24+)
- npm

### 1. Installation
In the project root (`d:\FoodRescue`):
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
*(Or navigate to `/server` and `/client` individually and run `npm install`)*

### 2. Database Migration & Seeding
```bash
npm run seed
```
This generates the Prisma Client, pushes the relational schema to SQLite (`server/foodrescue.db`), and seeds the admin, donors, NGOs, listings, requests, and audit logs.

### 3. Running the Application
Open two terminal windows:

**Terminal 1 — Backend API Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Now open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 4. Running the Automated Workflow Test Suite
To verify all 11 core authorization and workflow checks in automated headless mode:
```bash
node test_workflow.js
```

---

## 5. Core Donation Lifecycle & State Transitions

FoodRescue enforces a strict finite state machine for every food listing:

```
[Donor Creates] 
      ↓
  AVAILABLE ──(NGO Claims)──> REQUESTED ──(Donor Approves)──> APPROVED
      │                            │                              ↓
  (Expired/Cancelled)        (Donor Rejects)              PICKUP_SCHEDULED
      ↓                            ↓                              ↓
   EXPIRED / CANCELLED         AVAILABLE                      COLLECTED
                                                                  ↓
                                                              COMPLETED
```

### Safety & Integrity Constraints:
1. **Accreditation Gate:** Unverified NGOs cannot claim food (`403 Forbidden: isUnverifiedNgo: true`).
2. **Duplicate Prevention:** NGOs cannot submit multiple pending requests for the same listing (`409 Conflict`).
3. **Expiry Safeguards:** Donations past their collection deadline cannot be requested and automatically transition to `EXPIRED`.
4. **Public Registration Filter:** Public registration only allows `DONOR` or `NGO` accounts. Administrators cannot be registered publicly.
5. **Data Persistence:** All records reside in the SQLite database and survive full server restarts and browser refreshes.

---

## 6. Repository Folder Structure

```
d:\FoodRescue\
├── server\                       # Express.js REST API
│   ├── prisma\
│   │   ├── schema.prisma         # Relational schema (Users, NgoProfiles, Donations, Requests, ActivityLogs)
│   │   ├── seed.ts               # Demo data seeding script
│   │   └── foodrescue.db         # Persistent SQLite database file
│   ├── src\
│   │   ├── controllers\
│   │   │   ├── authController.ts # Register, Login, Me endpoints
│   │   │   ├── donationController.ts # Create, Browse, Search, Update, Cancel
│   │   │   ├── requestController.ts  # Request, Approve, Reject, Schedule, Collect, Complete
│   │   │   └── adminController.ts    # Verify NGOs, Users, Audit Logs, Listing Moderation
│   │   ├── middleware\
│   │   │   └── auth.ts           # JWT authentication, RBAC, requireVerifiedNgo middleware
│   │   ├── routes\               # Express route definitions
│   │   ├── utils\token.ts        # JWT generation and verification
│   │   ├── prisma.ts             # PrismaClient singleton
│   │   └── index.ts              # Express application entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── client\                       # React + TypeScript + Tailwind
│   ├── src\
│   │   ├── components\
│   │   │   ├── common\           # Navbar, Footer, ProtectedRoute, Badge, StatCard, Modal
│   │   │   └── donation\         # DonationCard, RequestModal
│   │   ├── context\              # AuthContext (state, login, register, logout, token persistence)
│   │   ├── pages\
│   │   │   ├── donor\            # DonorDashboard, CreateDonationPage
│   │   │   ├── ngo\              # NgoDashboard, BrowseDonationsPage
│   │   │   ├── admin\            # AdminDashboard (verifications, users, donations, audit)
│   │   │   ├── LandingPage.tsx   # Modern startup homepage
│   │   │   ├── LoginPage.tsx     # Sign-in with 1-Click Demo Accounts
│   │   │   ├── RegisterPage.tsx  # Dual role registration with dynamic NGO fields
│   │   │   ├── HowItWorksPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services\api.ts       # Centralized API client
│   │   ├── types\index.ts        # Shared TypeScript interfaces
│   │   ├── App.tsx               # Main routing definition
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── test_workflow.js              # Automated end-to-end integration test suite
├── package.json                  # Root monorepo orchestration scripts
└── README.md                     # Project documentation
```

---

## 7. Honest Feature Implementation Status

### Completed Core Features:
- [x] **Full-Stack Architecture:** Node/Express backend + React/TypeScript frontend + Prisma/SQLite database.
- [x] **Design System:** Forest green (`#1b4332`), fresh green (`#22c55e`), soft off-white (`#f8faf9`), warm orange (`#e76f51`), rounded cards, subtle shadows, Inter font.
- [x] **Authentication & RBAC:** Secure password hashing (bcrypt), JWT tokens, role-protected routes for Donor, NGO, and Admin.
- [x] **Landing Page:** Hero with CTAs, How It Works, Benefits for Donors and NGOs, live public metrics, recent listings preview, footer.
- [x] **Donor Module:** Dashboard metrics, food donation creation form with datetime inputs, manage listings, view incoming requests, approve/reject with notes, handover confirmation.
- [x] **NGO Module:** Dashboard metrics, unverified account warning banner, marketplace search with category & location filtering, request submission modal, request status tracker.
- [x] **Admin Module:** 8 platform metrics, NGO verification with approve/reject workflow, user account management & deletion, platform listing moderation, activity audit log.
- [x] **Core Workflow State Machine:** `AVAILABLE` -> `REQUESTED` -> `APPROVED` -> `PICKUP_SCHEDULED` -> `COLLECTED` -> `COMPLETED`.
- [x] **Security & Integrity Checks:** Duplicate request blocker, expiry checks, unverified NGO access restriction, admin registration protection.
- [x] **Responsive Layouts:** Desktop, laptop, tablet, and mobile navigation with collapsible drawer.
- [x] **Automated Test Suite:** 11-test automated suite (`test_workflow.js`) verifying all critical endpoints and transitions.

### Intentionally Skipped (Per Project Brief Section 13):
- **AI Food Prediction / Machine Learning:** Excluded due to the 2-day sprint deadline to prioritize rock-solid core donation workflow.
- **Live GPS Vehicle Tracking & QR Code Scanning:** Replaced with deterministic timestamped collection and handover status confirmation.
- **Paid Third-Party SMS/Email Services:** Replaced with on-platform activity audit logs and status alerts.

