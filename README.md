# Car Dealership Inventory System

## Stack

- **Backend:** Node.js, TypeScript, Express, MongoDB, JWT
- **Frontend:** React, Vite, Tailwind CSS
- **Testing:** Vitest + Supertest (backend)

## Setup

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MongoDB URI, JWT secret, and admin credentials.

```bash
npm install
npm run seed:admin
npm run dev
```

Default admin (from `.env`):
- email: `admin@carinventory.com`
- password: `admin123`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Roles

| Action | Normal user | Admin |
|--------|-------------|-------|
| Register / Login | Yes | Yes |
| Create / List / Search / Update vehicles | Yes (auth) | Yes |
| Purchase vehicle | Yes (auth) | Yes |
| Delete vehicle | No | Yes |
| Restock vehicle | No | Yes |

Register always creates `role: "user"`. Admins are created with `npm run seed:admin`.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/vehicles` (auth)
- `GET /api/vehicles` (auth)
- `GET /api/vehicles/search` (auth)
- `PUT /api/vehicles/:id` (auth)
- `DELETE /api/vehicles/:id` (admin)
- `POST /api/vehicles/:id/purchase` (auth)
- `POST /api/vehicles/:id/restock` (admin)

## Tests

```bash
cd backend
npm test
```

## AI Usage

See `PROMPTS.md` for prompt history. Full My AI Usage section will be expanded before submission.
