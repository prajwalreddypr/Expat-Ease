# Expat Ease Frontend

React 19 and TypeScript frontend for the Expat Ease settlement platform.

## Stack

- React 19.1
- TypeScript 5.8
- Vite 7.1
- React Router DOM 7.9
- Tailwind CSS 3.4
- ESLint 9
- Vitest 5 and React Testing Library

## Setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The development server runs at <http://localhost:5173>.

## Environment

```env
VITE_API_URL=http://localhost:8000
```

`VITE_API_URL` is the backend base URL. When omitted, local development falls back to `http://localhost:8000`.

## Scripts

```powershell
npm run dev        # Start Vite development server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript project checks
npm test           # Run Vitest once
npm run test:watch # Run Vitest in watch mode
npm run build      # Type-check and create production build
npm run preview    # Preview the production build
```

## Source structure

```text
src/
├── assets/                 Static application assets
├── components/             Reusable UI and feature components
│   ├── forum/              Forum cards, forms, and reporting UI
│   ├── toast-context.ts    Toast contract and hook
│   └── Toast.tsx           Toast provider and rendering
├── contexts/
│   ├── auth-context.ts     Authentication contract and hook
│   └── AuthContext.tsx     Authentication provider
├── pages/                  Route-level components
├── test/setup.ts           Shared Vitest setup
├── types/forum.ts          Shared forum domain types
├── utils/
│   ├── api.ts              API base URL, transport, and error parsing
│   ├── forumUtils.ts       Shared forum presentation utilities
│   └── sanitize.ts         Input sanitization helpers
├── App.tsx                 Routes and authentication gates
└── main.tsx                Application entry point and providers
```

## API integration

All backend requests go through `apiFetch()` in `src/utils/api.ts`. Callers continue to own their feature-specific response handling and user-facing messages. API error bodies are parsed through `getApiErrorDetail()`.

```typescript
const response = await apiFetch('/api/v1/users/me', {
  headers: { Authorization: `Bearer ${token}` },
})
```

Do not call `fetch()` directly from components or concatenate the backend URL manually.

## State

- Authentication is exposed by `useAuth()` from `contexts/auth-context.ts`.
- Toast notifications are exposed by `useToast()` from `components/toast-context.ts`.
- Feature-specific state remains local to its page or component.

Keeping hooks separate from provider components satisfies React Fast Refresh and keeps dependency boundaries explicit.

## Testing and validation

Before pushing a frontend change, run:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Tests use jsdom and shared setup from `src/test/setup.ts`. New refactors should preserve visible UI and behavior unless the issue explicitly requests a product change.

## Branch workflow

Create one feature branch per bounded issue step from updated `dev`:

```powershell
git switch dev
git pull --ff-only origin dev
git switch -c 38-frontend-example-refactor
```

Use issue-linked commit messages:

```text
[#38] Frontend: Scope - Description
```

Open the pull request into `dev`. Merge `dev` into `main` only after validation.

## Production build

```powershell
npm run build
```

Vite writes the deployable output to `dist/`. Vercel must provide the production `VITE_API_URL` during the build.
