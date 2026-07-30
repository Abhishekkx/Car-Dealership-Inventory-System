# AI Prompts History

## To create project skeleton

**AI tool:** Cursor

**Prompt Used:**

```text
set up the initial project :

Stack decisions :
- Backend: Node.js + TypeScript + Express
- Database: MongoDB
- Auth: JWT
- Frontend: React + Vite + Tailwind CSS
- Backend testing: Vitest + Supertest

create only the foundation — no business features yet:
1. Root files: .gitignore
2. backend/ folder with Express + TypeScript scaffold, env example,
   basic app entrypoint, health check route, and a working test setup
3. frontend/ folder with Vite React TypeScript + Tailwind configured
4. Empty/placeholder folders for routes, controllers, models, and middleware
5. Keep code clean and without unnecessary comments

Do not implement auth, vehicles, or inventory yet.
```
**Outcome:** Generated the monorepo skeleton (`backend/`, `frontend/`), tooling configs, and base project structure.

---

## MongoDB connection

**AI tool:** Cursor

**Prompt Used:**
```text
Connect the backend to MongoDB using MONGODB_URI from .env.
Add db config, connect on server startup, and a simple health check
that reports database status.
```

**Outcome:** Added `config/db.ts`, startup Mongo connection, `/api/health` DB status, and a connection unit test.

---

## Auth register / login + JWT

**AI tool:** Cursor

**Prompt Used:**
```text
Implement Auth register/login + JWT
```

**Outcome:** Added User model, register/login endpoints, JWT signing on login, and auth tests (9 tests passing including DB).

---

## Vehicles CRUD, search, and inventory

**AI tool:** Cursor

**Prompt Used:**
```text
TDD for vehicles, search, and inventory (purchase/restock).
```

**Outcome:** Implemented protected vehicles CRUD, search, purchase, and admin restock. 23 backend tests passing with Red-Green commit history.

---

## Admin seed and role checks

**AI tool:** Cursor

**Prompt Used:**
```text
Set up admin seeding and ensure admin-only actions.
```

**Outcome:** Added `npm run seed:admin`, role-based access tests, and README role matrix.

---

## Frontend auth

**AI tool:** Cursor

**Prompt Used:**
```text
API client + auth — login/register, store JWT
```

**Outcome:** Added frontend API client, AuthProvider with localStorage JWT, and login/register UI.
