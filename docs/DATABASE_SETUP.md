# Earth - Database & Production Backend Setup Guide

This document outlines the architecture, database setup, migrations, authentication mechanisms, and operational procedures for the Earth persistent data layer.

---

## 1. Architecture Overview

Earth uses a resilient, high-performance backend architecture built on:
- **PostgreSQL**: Enterprise relational database for multi-entity data integrity, transactions, and foreign key cascades.
- **Drizzle ORM (`drizzle-orm` + `postgres`)**: Lightweight, edge-compatible TypeScript ORM with zero heavy binary dependencies and full SQL-dialect fidelity.
- **Next.js 14 App Router Route Handlers**: RESTful API endpoints with structured JSON responses and HTTP status semantics.
- **Edge Runtime Middleware**: Intercepts requests to `/dashboard`, `/projects/*`, and `/settings/*`, verifying signed JWT cookies before rendering protected pages.
- **Zod Validations**: Shared type-safe schemas enforcing length, regex, enum, and sanitize constraints on untrusted client inputs.
- **bcryptjs**: Password hashing with salt factor 12 for secure credential storage.
- **jose**: Cryptographically signed HS256 JWT tokens for secure HTTP-only session cookies.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js App Router                   │
│                                                        │
│  Client Components (AuthContext / EarthService UI)     │
│                         │                              │
│                         ▼                              │
│          Edge Middleware (src/middleware.ts)           │
│        [Verifies 'earth_session' HS256 JWT]            │
│                         │                              │
│                         ▼                              │
│             API Route Handlers (/api/*)                │
│                         │                              │
│         ┌───────────────┴───────────────┐              │
│         ▼                               ▼              │
│   Zod Schemas                 Auth & Access Layer       │
│  (src/lib/validations)         (src/lib/auth/server)   │
│         │                               │              │
│         └───────────────┬───────────────┘              │
│                         ▼                              │
│               Drizzle ORM Engine                       │
│              (src/lib/db/schema.ts)                    │
└─────────────────────────┬──────────────────────────────┘
                          ▼
            PostgreSQL Database Cluster
```

---

## 2. Database Entities & Schema Design

All tables are defined in [`src/lib/db/schema.ts`](file:///home/mohiitp/moLib/moGit/earth/src/lib/db/schema.ts).

### 2.1 Users & Sessions
- **`users`**: Core user accounts with email uniqueness, bcrypt `password_hash`, display name, organization, avatar URL, and role.
- **`sessions`**: Server-tracked session records linking to `users.id` with `onDelete: "cascade"`.
- **`password_reset_tokens`**: One-time cryptographically unique tokens with expiry and `used_at` timestamps.

### 2.2 Projects & Collaboration
- **`projects`**: Top-level research workspaces containing owner ID, name, slug, biome, accent palette, status (`active`, `completed`, `on_hold`, `archived`), and target date.
- **`project_members`**: Composite primary key `(project_id, user_id)` defining collaboration roles (`owner`, `editor`, `viewer`) with cascading deletes.

### 2.3 Tasks & Kanban Board
- **`task_columns`**: Dynamic board columns (`Backlog`, `Todo`, `In Progress`, `In Review`, `Done`, or custom) with order indexes.
- **`tasks`**: Task items linked to `projects` and `task_columns`. Stores priority, task type, due dates, checklists (JSONB), and assignee.
- **`task_labels`**: Normalized tags assigned to tasks (`(task_id, label)` composite key).

### 2.4 Research Notes
- **`notes`**: Markdown/rich-text research notes linked to `projects`.
- **`note_tags`**: Normalized tags on notes (`(note_id, tag)` composite key).

### 2.5 Architecture Diagrams & Visual Thinking
- **`diagrams`**: Canvas blueprints with serialized node and edge JSONB structures, node/edge counts, and canvas viewports.

### 2.6 Cross-Module Item Relationships
- **`item_relationships`**: Polymorphic bidirectional relationships connecting tasks, notes, and diagrams within the same project. Uniqueness constraint on `(source_type, source_id, target_type, target_id)`.

### 2.7 Audit Log & Activity Feed
- **`activity_events`**: Immutable timeline of user actions (created project, updated task, linked diagram, etc.) with timestamps and action badges.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

### Required Variables:
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://earth:pass@localhost:5432/earth_db` |
| `SESSION_SECRET` | JWT cookie signing secret (min 32 chars) | Generated via `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Application root URL | `http://localhost:3000` |

---

## 4. Migrations & Seed Workflows

Drizzle Kit is configured in [`drizzle.config.ts`](file:///home/mohiitp/moLib/moGit/earth/drizzle.config.ts).

### 4.1 Generate Migrations
Generate SQL DDL migration files from schema modifications:
```bash
npm run db:generate
```
Migration files are stored in `drizzle/`.

### 4.2 Push Schema to Database Directly (Development)
Sync schema changes directly with the target database:
```bash
npm run db:push
```

### 4.3 Run Migrations (Production)
Apply pending SQL migrations:
```bash
npm run db:migrate
```

### 4.4 Seed Development Data
Populate the database with realistic research projects, columns, tasks, notes, diagrams, relationships, and demo users:
```bash
npm run db:seed
```

#### Default Seed Credentials:
- **Lead Field Ecologist**: `elena.rostova@earth.org` / `password123`
- **Telemetry Engineer**: `mateo.silva@earth.org` / `password123`

### 4.5 Inspect Database with Drizzle Studio
Launch the visual database viewer:
```bash
npm run db:studio
```

---

## 5. Security & Authorization Model

### 5.1 Password Protection
- All user passwords are encrypted using `bcryptjs` with 12 salt rounds before hitting storage.
- Passwords are never returned in API payloads (`SELECT` projections explicitly omit `passwordHash`).

### 5.2 Session Cookies
- Cookies are named `earth_session` and configured with:
  - `httpOnly: true` (inaccessible to malicious client scripts)
  - `sameSite: "lax"` (mitigates CSRF)
  - `secure: process.env.NODE_ENV === "production"`
  - `maxAge: 7 * 24 * 60 * 60` (7 days duration)

### 5.3 Server-Side Access Control (`src/lib/auth/server.ts`)
- `requireAuth()`: Ensures the caller is authenticated; returns 401 Unauthorized if invalid.
- `requireProjectAccess(projectId, minRole)`: Ensures the user owns or is a member of the requested project; returns 403 Forbidden if unauthorized.

### 5.4 Cross-Module Link Integrity
- Item relationships are strictly validated: both the source and target items must belong to the exact same `projectId`.
- Unlinking an item deletes the relationship record without deleting or modifying the underlying note, task, or diagram.
- Deleting an entity safely cascades and clears associated relationship pointers.

### 5.5 Endpoint Rate Limiting
- Sensitive authentication routes (`/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password`) enforce IP-based rate limiting via `src/lib/auth/rate-limiter.ts` to defend against brute force attacks.
