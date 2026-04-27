# Quorex Admin Dashboard

Full-stack admin dashboard for Quorex — IT offboarding SaaS for startups.

## Tech Stack

- **Frontend**: React + TailwindCSS v4 + lucide-react + Vite
- **Backend**: Node.js + Express 5
- **Database**: MySQL (XAMPP/phpMyAdmin)
- **Auth**: JWT stored in httpOnly cookies

## Setup

### Prerequisites
- MySQL running (XAMPP or similar)
- Node.js 18+

### 1. Database

```bash
# Create tables (run the schema)
/Applications/XAMPP/xamppfiles/bin/mysql -u root < server/db/schema.sql
```

### 2. Server

```bash
cd server
npm install
# Edit .env if needed (DB credentials, JWT secret)
npm run seed    # Populate DB with seed data
npm run dev     # Start server on :3001
```

Default `.env` values (edit `server/.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=quorex
JWT_SECRET=quorex_super_secret_jwt_key_change_in_production
```

### 3. Client

```bash
cd client
npm install
npm run dev     # Start Vite dev server on :5173
```

### 4. Login

URL: `http://localhost:5173`

| Email | Password | Role |
|-------|----------|------|
| admin@quorex.io | Admin1234! | superadmin |

## Features

- **Dashboard** — metrics overview (todos, emails, team)
- **Todo List** — 4 phases (fire/build/grow/later), drag-to-reorder, progress bar
- **Scale Plan** — 4-phase roadmap with actions and blockers
- **Email Sequences** — 3 cold email templates with inline editing
- **Team** — user management, invitation links (superadmin only)
- **Invite Accept** — `/invite/:token` page for new collaborators

## Role Permissions

| Feature | Superadmin | Collaborator |
|---------|-----------|-------------|
| View all sections | ✓ | ✓ |
| Toggle todos | ✓ | ✓ |
| Edit/create/delete todos | ✓ | — |
| Edit emails & scale | ✓ | — |
| Team management | ✓ | — |