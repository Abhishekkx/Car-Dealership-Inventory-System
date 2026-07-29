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

**Outcome:** Generated the monorepo skeleton (`backend/`, `frontend/`), tooling configs, health endpoint test, and base project structure.
