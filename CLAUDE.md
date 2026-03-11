# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

No test suite is configured.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router DOM v7

**Project:** CambioJoyasLourdes — a currency exchange and jewelry trade management app.

### Folder structure

```
src/
├── api/
│   └── client.ts              # Axios instance (baseURL = TODO_BACKEND_URL)
├── services/                  # Framework-agnostic API call functions
│   ├── dashboard.service.ts
│   ├── operaciones.service.ts
│   └── deudores.service.ts
├── queries/                   # TanStack Query hooks (cache, mutations, invalidation)
│   ├── dashboard.query.ts
│   ├── operaciones.query.ts
│   └── deudores.query.ts
├── components/
│   ├── dashboard/             # Dashboard-specific components
│   ├── debtors/               # Debtors management
│   ├── layout/                # Navbar
│   ├── operations/            # Operations CRUD UI
│   ├── trade/                 # Trade/market UI
│   └── ui/                    # Reusable primitives (Button, Badge, Toast, Pagination)
├── pages/                     # Route-level components
├── data/mockData.ts           # Centralized mock data (used until backend is ready)
└── App.tsx                    # Router: / → Dashboard, /operations, /debtors, /settings
```

### Backend integration layer

The `api/` → `services/` → `queries/` pattern is intentional:

- **`api/client.ts`** — single axios instance; `baseURL` has a `TODO_BACKEND_URL` placeholder. Auth token, interceptors, and refresh token logic are marked with TODO comments.
- **`services/`** — pure async functions, no React, no types for domain models. Functions accept `unknown` or optional `params` to stay schema-agnostic.
- **`queries/`** — TanStack Query hooks consumed by components. Mutations must `invalidateQueries` on success.

**Key constraint:** Do not define domain models, DTOs, or assume backend field names. The backend contract is not finalized. When the backend is ready, only the `baseURL`, endpoint paths, and mutation payloads should need updating.

### Current state

All pages are UI-complete with mock data from `data/mockData.ts`. The `api/`, `services/`, and `queries/` layers exist as architecture scaffolding but are not yet wired to components — components still consume mock data directly.
