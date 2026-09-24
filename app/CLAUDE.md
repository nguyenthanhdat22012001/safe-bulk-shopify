# `app/src` — Code Style & Folder Structure

> Auto-loaded whenever Claude reads a file under `app/src/`.
> For UI component rules (Polaris Web Components), see `@../../docs/polaris-web-components.md`.
> For i18n/translation rules, see `@../../docs/i18n.md`.

## Code Style

### General
- Descriptive names (no single letters except loop counters).
- Prefer functional/declarative patterns over imperative.
- Functions under 50 lines; max 3 levels of nesting. Use early returns.
- Self-documenting code — minimize comments.

### TypeScript/JavaScript
- Strict mode always on.
- `const` over `let`; never `var`.
- Named exports only (exception: components use `export default`, see Folder Structure).
- Async functions must always try-catch.
- Use `?.` and `??`. Prefer arrow functions for callbacks. Template literals over concatenation.

### Type Definitions
- `interface` for object shapes; `type` for unions/intersections.
- Avoid `any` — use `unknown` when truly unknown. Be as specific as possible.
- **Naming prefix convention (mandatory):**

  | Kind | Prefix | Example |
  |---|---|---|
  | Interface | `I` | `IUserProfile`, `ICampaignData` |
  | Type alias | `T` | `TUserStatus`, `TApiResponse` |
  | Enum-like type | `E` | `ECampaignStatus`, `ECheckoutStep` |
  | Class | `C` | `CUserService` |
  | Constant | `UPPER_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |

- `@shopify/app-bridge-types` and `@shopify/polaris-types` are ambient — `shopify` global
  needs no import.

### Display Formatting (never format manually)
- Numbers → `returnFormatNumber` from `@/utils/funcFormat`
- Dates → `returnFormatDate` from `useFormat` (`@/hooks/shopify/useFormat`)
- Currency → `returnFormatCurrency` from `useFormat` (`@/hooks/shopify/useFormat`)

### Error Handling
- Always try-catch async operations; never swallow errors silently.
- Log errors with context at appropriate severity.
- Return meaningful, user-facing error objects across boundaries instead of throwing,
  e.g. `{ success: false, error: 'message' }`.
- Use custom error classes for domain-specific errors.

### Documentation
- JSDoc/TSDoc (`@param`, `@returns`, `@example`) on exported/public functions.
- Comment the "why", not the "what".
- Keep `README.md` current; document breaking changes in `CHANGELOG.md`.

---

## Folder Structure

### Top-level `app/src` folders (single responsibility each)

| Folder | Purpose |
|---|---|
| `services/` | API/service calls (axios, GraphQL clients) |
| `queries/` | Query keys/hooks for GET APIs (React Query) |
| `routes/` | Route components (file-based routing) |
| `types/` | Shared TypeScript types |
| `utils/` | Shared utility functions |
| `constants/` | Shared constants |
| `validations/` | Shared validation schemas |
| `hooks/` | Shared custom hooks |
| `features/` | Feature modules |
| `components/` | Shared/reusable components |
| `locales/` | i18n translation files |
| `assets/` | Icons and images |

- New API → `services/`. New route → `routes/`. New shared type → `types/`.
- New GET API → also add its query key in `queries/`.

### Per-feature shared subfolders
If `features/<Feature>` needs its own types/utils/constants/validations/hooks, **do not**
put them inside the feature folder. Create a same-named subfolder inside the matching
shared folder with an `index.ts` barrel:

```
app/src/types/pricing/
  index.ts        # export * from './plan.types'; export * from './usage.types';
  plan.types.ts
  usage.types.ts
```
Same pattern for `utils/<feature>/`, `constants/<feature>/`, `validations/<feature>/`,
`hooks/<feature>/`.

**Exception:** a component's own props → local `interface IProps` inside that component's
file only (e.g. `features/Pricing/components/PricingCard/index.tsx`). Never export `IProps`
from the file.

```tsx
interface IProps {
  title: string;
  price: number;
}

const PricingCard = ({ title, price }: IProps) => {
  // ...
};

export default PricingCard;
```

### `assets/<feature>/`
Feature icons/images go in `app/src/assets/<feature>/`, not inside the feature folder.
One file per icon/image, imported directly (no barrel `index.ts`):

```
app/src/assets/pricing/
  CheckCircleIcon.tsx
  CrossCircleIcon.tsx
```
```tsx
import { CheckCircleIcon } from "@/assets/pricing/CheckCircleIcon";
```

### `features/<FeatureName>/`
Exactly two subfolders:
- `components/` — feature-specific components (not reused elsewhere)
- `views/` — components rendered by `app/src/routes/`

### `components/` (shared/reusable)
- `components/commonUIs/` — pure UI, no business/data logic (e.g. `ToggleSwitch`)
- `components/<feature>/` — shared components belonging to a feature domain, used across
  multiple features (e.g. `components/pricing/PaywallModal`)
- `components/` (top level) — shared components not tied to any single feature domain

### Creating a component (anywhere: `features/*/components`, `features/*/views`,
`components/`, `components/commonUIs`)
Single or multi-file component → its own `ComponentName/` folder with `index.tsx`
(default export), plus any sibling files:

```
ComponentName/
  index.tsx
  styles.module.scss
```

### UI implementation priority
See `@../../docs/polaris-web-components.md` (Polaris → Tailwind → SCSS module) for
how to style anything under `app/src`.
