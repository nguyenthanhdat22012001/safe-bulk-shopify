# SafeBulk

SafeBulk is an embedded Shopify admin app for editing products in bulk. You can preview every change before it runs and undo it afterwards.

🎥 **[Watch the demo (Loom)](https://www.loom.com/share/6c30f307347d4555b0214ff8be0ab84f)**

This repository contains the **frontend only**: a React + TypeScript single-page app that runs inside Shopify Admin through App Bridge. It talks to a separate backend API, set with `VITE_ROOT_API`.

## Features

| Area | Route | What it does |
|---|---|---|
| Dashboard | `/` | Task-run history with filters, run details (`/history/:id`), cancel/undo, onboarding checklist, plan and quota banners |
| Edit Wizard | `/edit-wizard` | 3-step bulk edit: **filter products → choose actions → preview and apply** |
| CSV Import/Export | `/csv` | Export products to CSV, then import an edited file with preview (template: `app/public/samples/csv-import-blank-template.csv`) |
| Pricing | `/pricing` | Plans (Free / Growth / Professional), trial, paywalls, downgrade flow |

Also included: an in-app feedback widget (FAB, NPS, rating prompt) and a watcher that reports when a running apply job finishes.

## Tech stack

- **React 19**, **TypeScript** (strict), **Vite**
- **Shopify App Bridge** and **Polaris Web Components** (`<s-*>` elements, loaded from Shopify's CDN)
- **TanStack Router** (file-based, in `app/src/routes`) and **TanStack Query**
- **Zustand** for client state, **react-hook-form** and **yup** for forms
- **i18next** / **react-i18next** for translations (`app/src/locales/en.json`)
- **Tailwind CSS v4**, with SCSS modules as a last resort
- **GraphQL Codegen** (`@shopify/api-codegen-preset`) for typed Admin API queries (API version `2026-10`)

## Project structure

```
.
├── package.json          # Shopify CLI scripts (config link, deploy)
├── Dockerfile            # Builds app/ and serves dist/ with nginx
└── app/                  # The Vite SPA
    ├── docs/             # Polaris Web Components + i18n conventions
    ├── public/           # Static assets, CSV sample template
    ├── codegen.ts        # GraphQL codegen config
    └── src/
        ├── routes/       # File-based routes (routeTree.gen.ts is generated)
        ├── features/     # Feature modules: Dashboard, EditWizard, CsvImportExport, Pricing
        ├── components/   # Shared components (commonUIs, feedback, pricing, productFilters, providers)
        ├── services/     # axios + GraphQL clients
        ├── queries/      # React Query keys/hooks for GET APIs
        ├── stores/       # Zustand stores
        ├── hooks/ utils/ constants/ types/
        ├── middleware/   # AuthShop (shop bootstrap/auth gate)
        └── locales/      # i18n JSON
```

## Getting started

### Prerequisites

- Node.js 22 (the Docker image uses `node:22-alpine`)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) installed globally
- A Shopify Partner account and a development store
- A running SafeBulk backend (for local development, usually exposed through ngrok)

### Environment variables

Create `app/.env`:

```bash
VITE_ROOT_API=https://your-backend.example.com   # Backend base URL
VITE_SHOPIFY_CLIENT_ID=your_shopify_client_id    # Injected into <meta name="shopify-api-key">
```

Every request to the backend sends `Authorization: Bearer <session token>`, using the token from `shopify.idToken()`. In dev mode it also sends `ngrok-skip-browser-warning`.

### Install and run

```bash
cd app
npm install --legacy-peer-deps
npm run dev          # Vite dev server on http://localhost:3000
```

The app only works when it is loaded inside Shopify Admin, because App Bridge and the `shopify` global need it. To do that, point your app's URL in the Partner Dashboard (or `shopify.app.*.toml`) at a public tunnel to port 3000.

## Scripts

Run these from `app/`:

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Type-check (`tsc -b`) and build to `app/dist` |
| `npm run build:ci` | Build with `--mode ci` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run graphql-codegen` | Regenerate Admin API types in `src/types/shopify` |
| `ANALYZE=1 npm run build` | Build and open a bundle-size report (`dist/stats.html`) |

Run these from the repo root (Shopify CLI):

| Command | Description |
|---|---|
| `npm run config:link` | Link a local config to a Shopify app |
| `npm run config:use` | Switch the active app config |
| `npm run deploy:dev` | Deploy using `shopify.app.develop.toml` |
| `npm run deploy:prod` | Deploy using `shopify.app.toml` |

## Docker

```bash
docker build \
  --build-arg VITE_ROOT_API=https://your-backend.example.com \
  --build-arg VITE_SHOPIFY_CLIENT_ID=your_client_id \
  -t safebulk-app .
docker run -p 8080:80 safebulk-app
```

The build fails if either build arg is missing. The image serves the SPA with nginx and has a health check at `/health-check`.

## Conventions

Read these before contributing:

- [`CLAUDE.md`](CLAUDE.md): project-wide non-negotiables
- [`app/CLAUDE.md`](app/CLAUDE.md): code style, naming prefixes (`I`/`T`/`E`/`C`/`UPPER_CASE`), folder structure
- [`app/docs/polaris-web-components.md`](app/docs/polaris-web-components.md): UI component rules
- [`app/docs/i18n.md`](app/docs/i18n.md): translation key conventions

The key rules:

- TypeScript strict mode is always on, and `any` is not allowed.
- UI priority: Polaris Web Components first, then Tailwind, then an SCSS module only as a last resort.
- Never format numbers, dates or currency by hand. Use `returnFormatNumber`, `returnFormatDate` and `returnFormatCurrency`.
- Every user-facing string goes through i18n.
