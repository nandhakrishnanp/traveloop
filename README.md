# Traveloop - OODO

Your ultimate travel companion application for planning and tracking your adventures around the world.

**📚 [API Documentation](./backend/APIDOC.md) - View the complete API documentation**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [License](#license)

---

## Overview

Traveloop is a full-stack web application designed to help travelers plan, organize, and document their trips. With an intuitive interface and robust backend, users can create itineraries, manage profiles, and share their travel expenses

---

## ✨ Features

- 🔐 User Authentication (Login & Registration)
- 🏠 Intuitive Dashboard/Home Page
- ✈️ Trip Planning & Creation
- 📍 Itinerary Building
- 👤 User Profile Management
- 📊 Trip Organization
- 🎨 Modern, Responsive UI

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: Next.js 16.1.1
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios 1.13.2
- **UI Components**:
  - Radix UI
  - Lucide React (Icons)
  - Class Variance Authority
- **Language**: TypeScript 5
- **Linting**: ESLint 9

### **Backend**

- **Language**: Go 1.25.4
- **Framework**: Gin Web Framework 1.11.0
- **Database**: PostgreSQL (via pgx/v5)
- **ORM/Query Builder**: sqlc
- **Environment Management**: godotenv 1.5.1
- **UUID Generation**: google/uuid 1.6.0
- **Validation**: go-playground/validator/v10

### **Database**

- PostgreSQL with custom SQL queries (sqlc)
- Migration support via schema.sql

---

## 📸 Screenshots

### Landing Page

![Landing Page](./screeenshots/landing.png)

### Login

![Login](./screeenshots/login.png)

### Registration

![Registration](./screeenshots/register.png)

### Home Dashboard

![Home Dashboard](./screeenshots/home.png)

### Calendar

![Calendar](./screeenshots/calender.png)

### Community

![Community](./screeenshots/community.png)

### Profile

![User Profile](./screeenshots/profile.png)

### Create Trip

![Create Trip](./screeenshots/create%20trip.png)

---

## 📁 Project Structure

```
Global-trotter-oodo/
├── frontend/                 # Next.js React Application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── calender/    # Calendar/Scheduling
│   │   │   ├── community/   # Community features
│   │   │   ├── home/        # Home/Dashboard
│   │   │   ├── itenary/     # Itinerary pages
│   │   │   ├── profile/     # User profile
│   │   │   ├── trips/       # Trips management
│   │   │   ├── user/        # User pages
│   │   │   ├── layout.tsx   # Root layout
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── globals.css  # Global styles
│   │   │   ├── axiosconfig.js # Axios configuration
│   │   │   └── favicon.ico  # Favicon
│   │   ├── components/      # Reusable React components
│   │   └── lib/             # Utility functions
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── backend/                  # Go Backend Application
│   ├── cmd/
│   │   └── server/          # Main server entry point
│   ├── internal/
│   │   ├── config/          # Configuration management
│   │   ├── database/        # Database connection & models
│   │   ├── handlers/        # API route handlers
│   │   ├── middlewares/     # HTTP middlewares
│   │   └── sql/             # SQL queries
│   ├── APIDOC.md            # API documentation
│   ├── openapi.yaml         # OpenAPI specification
│   ├── go.mod               # Go module dependencies
│   ├── go.sum               # Go dependencies lock
│   └── sqlc.yaml            # sqlc configuration
│
├── screeenshots/            # Project screenshots
│   ├── landing.png
│   ├── login.png
│   ├── register.png
│   ├── home.png
│   ├── profile.png
│   └── create trip.png
│
├── .gitignore               # Git ignore rules
└── readme.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (for frontend)
- Go 1.25+ (for backend)
- PostgreSQL 12+ (for database)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
go mod download
go run ./cmd/server/main.go
```

The backend API will be available at `http://localhost:8080`

### Database Setup

1. Ensure PostgreSQL is running
2. Create a database:
   ```bash
   createdb oodo_db
   ```
3. Run migrations:
   ```bash
   psql -U postgres -d oodo_db -f backend/sql/schema.sql
   ```
