# Car Dealership Inventory System

## Project overview

This is a full-stack **Car Dealership Inventory System** built as a TDD kata. It lets authenticated users browse and search vehicles, purchase stock when available, and lets admins manage inventory (add, update, delete, restock).

The backend is a JWT-secured REST API on **Node.js / TypeScript / Express** with **MongoDB Atlas**. The frontend is a **React** SPA styled with **Tailwind CSS**. Normal users can register, log in, search, and buy. Admins (seeded separately) can also maintain the lot. Purchase history is stored so each user can review their own buys.

## Stack

- **Backend:** Node.js, TypeScript, Express, MongoDB Atlas, JWT, Mongoose
- **Frontend:** React, Vite, HTML5, CSS3, Tailwind CSS
- **Testing:** Vitest + Supertest; tests use `mongodb-memory-server` (app runtime still uses Atlas)

## Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas cluster and connection string
- Git

## Setup and run locally

### 1. Clone the repository

```bash
git clone https://github.com/Abhishekkx/Car-Dealership-Inventory-System.git
cd Car-Dealership-Inventory-System
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1d`) |
| `ADMIN_EMAIL` | Email for the seeded admin account |
| `ADMIN_PASSWORD` | Password for the seeded admin account |
| `ADMIN_NAME` | Display name for the seeded admin |

Do not commit `.env`. Keep real credentials local only.

```bash
npm install
npm run seed:admin
npm run dev
```

- API base URL: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Leave this terminal running while you use the app

Optional — run backend tests:

```bash
cd backend
npm test
```

### 3. Frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
```

Confirm `frontend/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

- App URL: `http://localhost:5173` (Vite default)
- Open that URL in the browser

### 4. First login

1. Register a normal user from the UI, or log in with the seeded admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`).
2. Users can search inventory and purchase when quantity is greater than zero.
3. Admins also see add / update / delete / restock controls.

## Roles

| Action | Normal user | Admin |
|--------|-------------|-------|
| Register / Login | Yes | Yes |
| Create / List / Search / Update vehicles | Yes (auth) | Yes |
| Purchase vehicle | Yes (auth) | Yes |
| Delete vehicle | No | Yes |
| Restock vehicle | No | Yes |

Register always creates `role: "user"`. Admins are created with `npm run seed:admin`.

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/vehicles` (auth)
- `GET /api/vehicles` (auth)
- `GET /api/vehicles/search` (auth)
- `PUT /api/vehicles/:id` (auth)
- `DELETE /api/vehicles/:id` (admin)
- `POST /api/vehicles/:id/purchase` (auth)
- `POST /api/vehicles/:id/restock` (admin)
- `GET /api/purchases` (auth) — buyer purchase history (extra)

## TDD approach

Backend features were built test-first with Vitest and Supertest.

- **Vehicles, search, and inventory:** separate Red then Green commits (failing specs first, then implementation until green).
- **Auth:** register/login tests were written first; JWT implementation followed in the same delivery commit.
- **Roles and extras:** role checks and purchase-history coverage were added with matching tests.

Commit messages use `test:` for Red and `feat:` for Green where the pair was split. AI-assisted commits include a `Co-authored-by` trailer.

App runtime uses **MongoDB Atlas**. Automated tests use an in-memory MongoDB server so suites stay fast, isolated, and do not mutate shared Atlas data.

## Test report

Backend tests are written with **Vitest** and **Supertest**. Each suite spins up an isolated **mongodb-memory-server** instance so runs never touch the live Atlas database. Coverage focuses on auth, protected vehicle CRUD, search filters, purchase/restock inventory rules, and role-based access (including the purchase-history extra).

### How to run

```bash
cd backend
npm test
```

### Latest results

| Metric | Result |
|--------|--------|
| Test files | **8 passed (8)** |
| Tests | **30 passed (30)** |
| Failures | **0** |
| Duration | ~9.2s |
| Runner | Vitest v2.1.9 |

### Suite breakdown

| File | Cases | Focus |
|------|------:|-------|
| `auth.register.test.ts` | 5 | User registration validation and success |
| `auth.login.test.ts` | 4 | Login JWT issue and credential rejection |
| `vehicles.test.ts` | 6 | Create, list, update, delete; auth and admin gates |
| `vehicles.search.test.ts` | 4 | Make, model, category, and price-range search |
| `inventory.test.ts` | 4 | Purchase stock decrease, out-of-stock, restock, non-admin blocked |
| `roles.test.ts` | 3 | Normal user vs admin permissions |
| `purchases.test.ts` | 3 | Purchase history recording and ownership |
| `db.test.ts` | 1 | Database connection helper |

### Sample output

```text
 Test Files  8 passed (8)
      Tests  30 passed (30)
   Duration  9.23s
```

All listed cases passed on the latest local run (`npm test` in `backend`).

## My AI Usage

**AI tool:** Cursor

I used Cursor throughout the kata as a pair-programming assistant, not as a substitute for ownership of the design or tests.

**How I used it**

- Asked it to scaffold the Express/TypeScript API and React/Vite/Tailwind SPA so the project layout stayed consistent.
- Used it in a Red-Green loop: draft failing API tests first, then implement routes, controllers, and models until the suite passed.
- Had it help design JWT auth (register/login), password hashing, and protected middleware for vehicle endpoints.
- Used it to implement search, purchase (quantity decrease), and admin-only delete/restock with role checks.
- Asked it to build the SPA flows: auth forms, inventory dashboard, filters, purchase disabled at zero stock, and admin management UI.
- Used it for UI polish (responsive layout, auth background treatment, clearer hierarchy)


**Reflection**

- AI reduced time on boilerplate so I could focus on role rules, edge cases, and UX.
- I review, ran tests locally, and changed anything that did not match the kata or my intent.
- Being explicit about prompts and co-authorship made the workflow easier to explain in review or interview.

## Security note

- Real Atlas credentials belong only in local `.env` (gitignored).
- `.env.example` uses placeholders only.
- If a connection string was ever committed, rotate the Atlas database user password, update local `.env`, and mark the GitHub secret alert as revoked.
