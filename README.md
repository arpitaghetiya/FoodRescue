# FoodRescue
### Smart Food Donation and Redistribution Platform

**University Software Engineering Project**

FoodRescue connects food donors with verified NGOs to reduce food waste and support communities in need.

**Repository:** https://github.com/arpitaghetiya/FoodRescue

**Live Application:** https://food-rescue-client.vercel.app

**Backend API:** https://food-rescue-ecru.vercel.app

---

## 1. Project Overview

FoodRescue is a full-stack web application that connects food donors such as restaurants, hotels, bakeries and other food businesses with NGOs, shelters and charitable organizations.

The platform allows donors to list surplus food and verified NGOs to request available donations for distribution to people in need.

### Main Objectives

- Reduce edible food waste.
- Connect food donors with NGOs.
- Make food redistribution easier.
- Verify NGOs before allowing them to request donations.
- Track donation requests and collection status.
- Support UN Sustainable Development Goal 2 (Zero Hunger).

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Hosting | Neon |
| ORM | Prisma |
| Authentication | JWT |
| Password Security | bcrypt |
| Hosting | Vercel |
| Version Control | Git and GitHub |

## 3. User Roles and Features

### Admin
- Access the Admin Dashboard.
- View registered users and donations.
- Verify or reject NGO accounts.
- Manage users and donations.
- Monitor platform activity.

### Food Donor
- Register and log in.
- Create food donation listings.
- Add food category, quantity and pickup deadline.
- Manage donations.
- View and respond to NGO requests.

### NGO / Receiver
- Register with organization details.
- Wait for administrator verification.
- Browse available food donations after verification.
- Submit donation requests.
- Track request and collection status.

## 4. Quick Start and Execution Instructions

### Prerequisites

- Node.js (v18 or later)
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/arpitaghetiya/FoodRescue.git
cd FoodRescue
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Environment Configuration

Configure the required environment variables in the backend and frontend environment files.

**Backend environment variables:**

```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secret_key
ADMIN_PASSWORD=your_admin_password
NODE_ENV=development
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend environment variable:**

```env
VITE_API_URL=http://localhost:5000/api
```

Use your own credentials and never upload environment files or secrets to GitHub.

### 4. Run the Application

Open two terminal windows.

**Terminal 1: Backend**

```bash
cd server
npm run dev
```

**Terminal 2: Frontend**

```bash
cd client
npm run dev
```

Open the frontend in your browser:

http://localhost:5173

## 5. System Architecture

The application follows a frontend-backend-database architecture.

```text
       Users
         |
         v
   React Frontend
         |
         v
   Express REST API
         |
         v
      Prisma ORM
         |
         v
  Neon PostgreSQL
```

**Frontend:** Handles pages, registration, login and dashboards.

**Backend:** Handles authentication, authorization, donations, NGO verification and API requests.

**Database:** Stores user accounts, NGO profiles, donations, requests and activity logs.

## 6. Database Structure

The Neon PostgreSQL database contains the following tables:

| Table | Purpose |
|---|---|
| User | Stores user details and roles |
| NgoProfile | Stores NGO information and verification status |
| Donation | Stores food donation listings |
| DonationRequest | Stores NGO donation requests |
| ActivityLog | Stores platform activity records |
| _prisma_migrations | Tracks database migrations |

The database is managed using Prisma ORM.

## 7. Core Donation Workflow

```text
Donor Creates Donation
         |
         v
     AVAILABLE
         |
         v
     NGO Requests
         |
         v
     REQUESTED
         |
         v
   Donor Approves
         |
         v
     APPROVED
         |
         v
  Pickup Scheduled
         |
         v
     COLLECTED
         |
         v
     COMPLETED
```

### Important Rules

- Only verified NGOs can request food.
- Expired donations cannot be requested.
- Duplicate pending requests are restricted.
- Public registration is available for donor and NGO roles.
- Admin access is managed separately.

## 8. Deployment Details

The application is deployed using Vercel, with Neon PostgreSQL as the production database.

### GitHub Repository

https://github.com/arpitaghetiya/FoodRescue

### Frontend

**Platform:** Vercel

**Project:** food-rescue-client

**URL:** https://food-rescue-client.vercel.app

### Backend

**Platform:** Vercel

**Project:** food-rescue

**URL:** https://food-rescue-ecru.vercel.app

**Health Endpoint:**

https://food-rescue-ecru.vercel.app/api/health

### Database

**Provider:** Neon PostgreSQL

**Database:** neondb

Production environment variables are configured through Vercel.

## 9. Testing and Current Progress

### Successfully Tested

- Frontend deployment.
- Backend deployment and health endpoint.
- Donor registration and login.
- NGO registration and login.
- Admin login and dashboard.
- Food donation creation.
- NGO verification by administrator.
- NGO status changing from Pending to Verified.
- Database records in Neon PostgreSQL.
- Expired donations excluded from available listings.

### Still to Verify

- Fresh donation with a future pickup deadline.
- Fresh donation visibility in the NGO dashboard.
- NGO donation request submission.
- Donor request approval.
- Food collection completion.
- Final status updates across dashboards.

These workflows should be marked complete after successful end-to-end testing.

## 10. Security and Configuration

- Passwords are protected using hashing.
- JWT is used for authentication.
- Role-based access is enforced.
- Only verified NGOs should be allowed to request donations.
- Database credentials and secret keys must remain private.
- Production environment variables are maintained in Vercel.
- Database operations should use validated inputs.

## 11. Future Improvements

- Location-based donation discovery.
- Email notifications.
- Food pickup scheduling.
- NGO document upload and verification.
- Donation expiry notifications.
- Admin analytics and reporting.
- Donation history and impact statistics.
- Map integration.
- Food safety guidelines.
- Further mobile-responsive improvements.

## 12. Conclusion

FoodRescue provides a digital platform to reduce food waste by connecting food donors with verified NGOs.

The project includes a deployed frontend and backend, PostgreSQL database integration, role-based dashboards, user registration, donation management and administrator-controlled NGO verification.

The next important milestone is completing and testing the full donation request and collection workflow.

**FoodRescue aims to turn surplus food into meaningful support for communities while contributing to a zero-food-waste future.**

---

**Project:** FoodRescue

**Theme:** Zero Hunger

**SDG Alignment:** UN Sustainable Development Goal 2 – Zero Hunger
