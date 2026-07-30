# AI Prompts History

## Project skeleton

**AI tool:** Cursor

**Prompt:**
```text
Set up the initial Car Dealership Inventory System foundation.
Use Node.js/TypeScript/Express, MongoDB, JWT, and React/Vite/Tailwind.
Create backend and frontend scaffolds only — no business features yet.
```

**Outcome:** Created monorepo structure, tooling, and empty module folders.

---

## MongoDB connection

**AI tool:** Cursor

**Prompt:**
```text
Connect the Express backend to MongoDB Atlas using MONGODB_URI and expose a health check that reports database status.
```

**Outcome:** Added database config, startup connection, and `/api/health`.

---

## Authentication API

**AI tool:** Cursor

**Prompt:**
```text
Implement register and login with JWT using TDD. Do not add code comments.
```

**Outcome:** Delivered auth endpoints, User model, password hashing, and JWT login.

---

## Vehicles and inventory API

**AI tool:** Cursor

**Prompt:**
```text
Implement protected vehicle CRUD, search, purchase, and admin-only restock/delete with Red-Green TDD commits.
```

**Outcome:** Completed vehicle and inventory APIs with passing backend tests.

---

## Admin setup and role verification

**AI tool:** Cursor

**Prompt:**
```text
Add admin seeding and verify role-based access for API and SPA.
Normal users may browse, search, and purchase.
Admins may add, update, delete, and restock.
Confirm UI and endpoints behave correctly per role.
```

**Outcome:** Added `seed:admin`, role API tests, and role-based SPA controls (admin management UI vs user purchase flow).

---

## Frontend auth and dashboard

**AI tool:** Cursor

**Prompt:**
```text
Build login/register with JWT storage, then the vehicle dashboard with search, purchase, and admin actions.
```

**Outcome:** Delivered auth UI, inventory dashboard, password visibility toggle, and clearer price/quantity inputs.

---

## Purchase history

**AI tool:** Cursor

**Prompt:**
```text
Add purchase history so each user can view their own purchases in the SPA.
```

**Outcome:** Added Purchase model, `GET /api/purchases`, purchase recording on buy, and a My purchases view.

---

## Visual design polish

**AI tool:** Cursor

**Prompt:**
```text
Improve the SPA design to be visually appealing, responsive, and provide a strong user experience.
```

**Outcome:** Polished the SPA under Car Dealership Inventory System branding with professional typography, atmospheric backgrounds, clearer hierarchy, motion, and mobile-friendly layouts.
