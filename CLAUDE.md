# Bulk App Builder — Embedded Shopify Admin App

This is a Shopify embedded admin app (React + TypeScript) living under `app/src`.
UI is built with Shopify Polaris Web Components, styled via Tailwind/SCSS as a fallback.

## Where the rules live

Detailed rules are split so Claude only loads what's relevant to the files it's touching:

- `app/src/CLAUDE.md` — code style, naming conventions, folder structure.
  Auto-loads whenever Claude reads a file under `app/src/`.
- `docs/polaris-web-components.md` — Polaris Web Components reference (props, layout,
  accessibility, examples). Read this before writing or reviewing any `.tsx` UI code.
- `docs/i18n.md` — translation/i18n key conventions. Read this before touching
  `app/src/locales/en.json` or adding `t()`/`useTranslation`/`Trans` usage.

## Non-negotiables (apply everywhere)

- TypeScript strict mode always on; no `any`.
- Naming prefixes: `I` interfaces, `T` type aliases, `E` enum-like types, `C` classes,
  `UPPER_CASE` constants. Full table in `app/src/CLAUDE.md`.
- Never format numbers/dates/currency manually — use the shared helpers
  (`returnFormatNumber`, `returnFormatDate`, `returnFormatCurrency`).
- UI priority: Polaris Web Components → Tailwind → SCSS module (last resort).
  Never write custom CSS for a Polaris component's own styling.

## Commands

<!-- Fill in real commands, e.g.: -->
<!-- - `npm run dev` — start the app locally -->
<!-- - `npm run typecheck` — run the TypeScript checker -->
<!-- - `npm run lint` — run ESLint -->
