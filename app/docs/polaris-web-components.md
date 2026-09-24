# Polaris Web Components Guidelines

> Read this before writing or reviewing any `.tsx` UI code under `app/src`.
> If a prop isn't documented here or at https://shopify.dev/docs/api/app-home/web-components,
> assume it doesn't exist — verify before using instead of guessing.

## Mandatory UI priority order
1. **Polaris Web Components (`s-*`)** — always check first for any UI need (layout, forms,
   feedback, actions).
2. **Tailwind CSS** — only when Polaris has no matching component; simple inline
   styling/layout tweaks.
3. **SCSS module** — sparingly; only for complex responsive behavior (media queries),
   complex animations, or deep component-specific state-driven styling.

```tsx
// ✅ Polaris first
<s-page heading="Product Details">
  <s-section>
    <s-stack gap="base">
      <s-text-field label="Product name" />
      <s-button variant="primary">Save</s-button>
    </s-stack>
  </s-section>
</s-page>

// ✅ Tailwind only when Polaris doesn't fit
<div className="flex items-center gap-4">
  <s-badge>Status</s-badge>
  <span className="text-gray-600">Last updated</span>
</div>

// ❌ Custom HTML when Polaris has the component
<div className="custom-button" onClick={handleClick}>Click me</div>
// ✅ Correct
<s-button onClick={handleClick}>Click me</s-button>
```

Decision flow: Polaris has it? → use it. No + simple styling? → Tailwind.
No + complex responsive/animation? → SCSS module.

## Setup
```html
<head>
  <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
  <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
</head>
```
- `polaris.js` = web components library. `app-bridge.js` = separate App Bridge features
  (title bar, nav menu, toasts). Keep both if using App Bridge.
- TypeScript: `npm install @shopify/polaris-types`, pin `@latest` since Polaris CDN always
  serves the newest version.

## Component categories (reference)
- **Actions:** `s-button`, `s-button-group`, `s-clickable`, `s-clickable-chip`, `s-link`, `s-menu`
- **Feedback:** `s-badge`, `s-banner`, `s-spinner`
- **Forms:** `s-checkbox`, `s-choice-list`, `s-color-field`, `s-color-picker`, `s-date-field`,
  `s-date-picker`, `s-drop-zone`, `s-email-field`, `s-money-field`, `s-number-field`,
  `s-password-field`, `s-search-field`, `s-select` (children `s-option`/`s-option-group`),
  `s-switch`, `s-text-area`, `s-text-field`, `s-url-field`
- **Layout:** `s-box`, `s-divider`, `s-grid`, `s-ordered-list`, `s-page`, `s-query-container`,
  `s-section`, `s-stack`, `s-table`, `s-unordered-list`
- **Overlays:** `s-modal`, `s-popover`
- **Media:** `s-avatar`, `s-icon`, `s-image`, `s-thumbnail`
- **Typography:** `s-chip`, `s-paragraph`, `s-text`, `s-tooltip`

## Styling rules
- **Never use custom CSS** on Polaris components — use built-in props.
```tsx
// ✅
<s-box padding="base" background="subdued" borderWidth="base" borderColor="base" borderRadius="base">Content</s-box>
// ❌
<s-box style={{ padding: '16px', background: '#f5f5f5' }}>Content</s-box>
// ❌ bare keyword is invalid
<s-box border="base">Content</s-box>
// ✅ shorthand: size, color, style
<s-box border="base subdued solid">Content</s-box>
```
- Components auto-style based on props set, usage context, and nesting depth (e.g. headings
  get less prominent when nested deeper).

## Layout
- **Opinionated (preferred):** `s-page` + `s-section`.
  - `s-page`: `heading` (string) is **required**. Size via `inlineSize`
    (`small` | `base` | `large`, default `base`), not `size`. `aside` slot only renders
    when `inlineSize="base"`. Supports `primary-action`, `secondary-actions`,
    `breadcrumb-actions` slots.
  - `s-section`: structured content area, default vertical spacing for children, no need
    for `s-stack`/`s-grid` unless complex. Nesting changes heading level. Top-level renders
    as a card.
- **Custom (use sparingly):** `s-stack`, `s-grid`, `s-box`.
  - `direction` only accepts `"inline"` (horizontal) or `"block"` (vertical, default) —
    never `"vertical"`/`"horizontal"`.
  - `display` only accepts `"auto"` | `"none"` — does not control stacking/wrapping; use
    `direction`.
  - `s-stack`/`s-grid` have no default spacing — use `gap="base"`.
  - Avoid custom vertical spacing; prefer `s-section` default spacing.

## Scale system
```typescript
type Scale =
  | "small-300" | "small-200" | "small-100" | "small" // alias of small-100
  | "base" // default
  | "large" | "large-100" | "large-200" | "large-300"; // large = alias of large-100
```
`small-300` < `small-100`; `large-300` > `large-100`.

## Responsive values
```
@container (inline-size < 500px) small, large
```
Rules: start with `@container`; optional name to target a specific container;
`inline-size` condition in parens; true-value, false-value.
```tsx
<s-box padding="@container (inline-size < 500px) small, large">Hello</s-box>

<s-query-container name="product-card">
  <s-box padding="@container product-card (inline-size < 400px) small-200, base">Content</s-box>
</s-query-container>
```

## Interactive elements
- `s-button` / `s-link` render as `<a>` when given `href`, as `<button>` when given
  `onClick` without `href`.
- `target="auto"` → internal link = `_self`, external = `_blank`.
- `s-clickable` is an escape hatch — only when `s-link`/`s-button` genuinely can't do
  the design.

`s-button` props:

| Prop | Values |
|---|---|
| `variant` | `"primary" \| "secondary" \| "tertiary" \| "auto"` |
| `tone` | `"critical" \| "success"` |
| `type` | `"submit" \| "button" \| "reset"` (ignored if `href`/`commandFor` set) |
| `href` | renders as `<a>` |
| `commandFor` + `command` | declaratively control another component (e.g. modal) without JS; `command` values `"--show"` \| `"--hide"` |
| `loading` | boolean |
| `disabled` | boolean |

```tsx
<s-button commandFor="my-modal" command="--show">Open</s-button>
<s-button commandFor="my-modal" command="--hide">Close</s-button>
<s-modal id="my-modal" heading="Confirm">...</s-modal>
```

## Opening modals programmatically (state-dependent)
When a modal needs React state set first (e.g. which variant to show), use the App Bridge
API — **not** `commandFor` and **not** a component ref.
```tsx
const [variant, setVariant] = useState<TPaywallVariant>("product_limit");

const handleOpen = (v: TPaywallVariant) => {
  setVariant(v);
  shopify.modal.show("my-modal-id"); // App Bridge — ambient global, no import
};

<PaywallModal variant={variant} />
```
- **Never** use `forwardRef` + `useImperativeHandle` to expose `open()` on a modal — use a
  controlled prop + `shopify.modal.show()`.
- Use `onShow` on `s-modal` to reset internal multi-step state when it opens.

## Tone / Color / Variant
- **Tone:** `critical`, `success`, `info`, `warning`, `caution`/`neutral` (some components).
- **Color:** intensity, usually `"base" | "subdued"` (some also `"strong"`).
- **Variant:** component-specific rendering — check each component's own accepted values.


## `s-text`
Inline by default. No `variant`/`fontWeight`/`as` — use `type`, `tone`, `color` instead.

| Prop | Values |
|---|---|
| `type` | `"strong" \| "generic" \| "address" \| "redundant"` |
| `tone` | `"info" \| "success" \| "warning" \| "critical" \| "auto" \| "neutral" \| "caution"` |
| `color` | `"base" \| "subdued"` |
| `fontVariantNumeric` | `"auto" \| "normal" \| "tabular-nums"` |
| `accessibilityVisibility` | `"visible" \| "hidden" \| "exclusive"` |

For block-level text with spacing, use `s-paragraph`, not `s-text` in a `<div>`.

## React integration example
```tsx
import { useState } from "react";

interface IProps {
  onSubmit: (name: string) => void;
}

function ProductForm({ onSubmit }: IProps) {
  const [productName, setProductName] = useState("");

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    onSubmit(productName);
  };

  return (
    <s-section heading="Add Product">
      <form onSubmit={handleSubmit}>
        <s-stack gap="base">
          <s-text-field
            label="Product name"
            value={productName}
            onChange={(e) => setProductName(e.currentTarget.value)}
            required
          />
          <s-button variant="primary" type="submit">Save product</s-button>
        </s-stack>
      </form>
    </s-section>
  );
}
```

## Properties vs attributes
- In JSX, props are set as DOM **properties**, not HTML attributes.
- Exceptions following HTML standard behavior: `value`, `checked`.

## Events
Standard camelCase DOM events (`onClick`, `onChange`, `onInput`, `onBlur`, `onFocus`)
work as usual.

## Slots
```tsx
<s-banner heading="Order created" tone="success">
  The order has been created successfully.
  <s-button slot="secondary-actions">View order</s-button>
  <s-button slot="secondary-actions">Download invoice</s-button>
</s-banner>
```
Multiple elements can share a slot name; elements without `slot` go to the default slot.

## Forms
```tsx
<form onSubmit={handleSubmit}>
  <s-stack gap="base">
    <s-text-field name="email" label="Email" type="email" required />
    <s-password-field name="password" label="Password" required />
    <s-button type="submit" variant="primary">Sign in</s-button>
  </s-stack>
</form>
```
- Add `name` for form submission, `type` for validation, `required` for required fields —
  components auto-participate in form validation.

## Accessibility
- Always provide `label` on form elements — never rely on `placeholder` alone.
- `labelAccessibilityVisibility` only accepts `"visible" | "exclusive"` — **not** `"hidden"`.
  Use `"exclusive"` to hide visually but keep for screen readers.
- Use `accessibilityRole` for ARIA roles when needed.
- Use `error` prop to show validation errors. Test keyboard navigation and color contrast.

## Controlled vs uncontrolled
- Prefer controlled components (React state via `value`/`onChange`).
- Uncontrolled is fine when letting a `<form>` own the state (`name` + `defaultValue`).

## TypeScript for component props
Local, non-exported `IProps` interface per component file (see `app/src/CLAUDE.md`).
Full example:
```tsx
interface IFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface IProps {
  onSubmit: (data: IFormData) => void;
  isLoading?: boolean;
}

const LoginForm = ({ onSubmit, isLoading = false }: IProps) => {
  // ...
};

export default LoginForm;
```

## Resources
- Polaris Web Components docs: https://shopify.dev/docs/api/app-home/web-components
- Shopify Design System: https://polaris.shopify.com/
- Web Components standard: https://developer.mozilla.org/en-US/docs/Web/Web_Components
