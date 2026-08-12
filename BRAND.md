# BRAND

Brand & Design System reference for the IdentityTokens EVM Frontend. This file is the single source of truth for how UI should look and feel. All visual values below are defined in [`app/globals.css`](app/globals.css) — **do not hardcode raw values in components**.

---

## Design Principles

1. **Self-Sovereign by Default** — The UI reflects the product's core promise: identity that is portable, recoverable, and fully owned by the user. Interfaces are transparent about what data is shown and what actions a user takes.
2. **Dark-first, Developer-grade** — The dashboard lives on a near-black canvas (`--color-app-bg`) with high-contrast text. Light mode is reserved for landing/marketing surfaces.
3. **Consistency over Creativity** — Always consume the existing CSS variables and typography tokens. Introduce new colors or sizes only when a semantic need cannot be met by what already exists.
4. **Clarity of Action** — Primary actions are unmistakable (brand blue / brand green), destructive actions are unmistakable (red), everything else is muted and recedes.
5. **Cards and Layers** — Content is organized into clearly layered cards (`--color-card-bg`, `--color-panel-bg`, borders via `--color-border`) to make hierarchy legible at a glance.
6. **Accessibility** — Maintain WCAG AA contrast between foreground text and its background, in both light and dark themes. Test interactive elements at all supported screen sizes.

---

## Color Palette

All colors are registered in the `@theme` block of [`app/globals.css`](app/globals.css) and are consumed in JSX as Tailwind utilities (e.g. `bg-brand-blue`, `text-text-error`). Reference the CSS variable — never the raw hex.

### Branding Colors

| Token | Value | Usage |
| --- | --- | --- |
| `--color-brand-blue` | `#0553fd` | Primary brand color, primary actions, links |
| `--color-brand-blue-hover` | `#0442cb` | Brand blue hover / pressed state |
| `--color-brand-green` | `#63fc9f` | Success accents, active/verified states |
| `--color-step-active` | `#65fc9f` | Active step indicator on landing flow |

### Layout Backgrounds

| Token | Value | Usage |
| --- | --- | --- |
| `--color-landing-bg` | `#f4f2ff` | Landing/marketing light background |
| `--color-landing-bg-dark` | `#0c0b1a` | Landing dark background |
| `--color-app-bg` | `#18191d` | Default app/dashboard background |
| `--color-dark-bg` | `#101115` | Deepest dark surface (cards, modals) |

### Landing Page Animated Card Colors

| Token | Value | Usage |
| --- | --- | --- |
| `--color-slate-white` | `#f4f4f4` | Landing card light surface |
| `--color-slate-dark` | `#0f1117` | Landing card dark surface |
| `--color-corner-stroke` | `#cdd4e3` | Landing corner border (light) |
| `--color-corner-stroke-dark` | `#252833` | Landing corner border (dark) |
| `--color-step-card` | `#18191d` | Step card surface (dark) |
| `--color-step-card-dark` | `#ffffff` | Step card surface (light) |
| `--color-step-line` | `#404348` | Step connector line (dark) |
| `--color-step-line-dark` | `#c9cdd9` | Step connector line (light) |
| `--color-landhead-text` | `#3c315b` | Landing heading text (light) |
| `--color-landhead-text-dark` | `#f0efff` | Landing heading text (dark) |

### Dashboard & Sidebar

| Token | Value | Usage |
| --- | --- | --- |
| `--color-dashboard-bg` | `#18191d` | Dashboard background |

### Token Card

| Token | Value | Usage |
| --- | --- | --- |
| `--color-card-bg` | `#050505` | Token card background |
| `--color-card-border` | `#18191b` | Token card border |

### Component Colors

| Token | Value | Usage |
| --- | --- | --- |
| `--color-trust-bg-1` | `#0a0a0f` | Trust/verification surface 1 |
| `--color-trust-bg-2` | `#1a1a2e` | Trust/verification surface 2 |
| `--color-search-bg` | `#151821` | Search input background |
| `--color-modal-inner-bg` | `#212734` | Modal inner surface |
| `--color-panel-bg` | `#2a2b30` | Raised panel background |
| `--color-modal-border` | `#2a3040` | Modal border |
| `--color-border-dark` | `#333333` | Dark border, dividers |
| `--color-card-inner-bg` | `#3a3a3a` | Inner card surface |
| `--color-text-grey` | `#95959d` | Muted / secondary text |

---

## Semantic Colors

Semantic states use dedicated tokens. Use them to communicate meaning at a glance.

| Semantic | Token | Value | Notes |
| --- | --- | --- | --- |
| **Success** | `--color-brand-green` | `#63fc9f` | Confirmation, verified identity, success states |
| **Error (border)** | `--color-border-error` | `#cc0000` | Error input / field borders |
| **Error (text)** | `--color-text-error` | `#ef4444` | Error messages, destructive text |
| **Error (text red)** | `--color-text-red` | `#ff0000` | Explicit destructive red text |
| **Warning** | `--color-text-warning` | `#facc15` | Warnings, caution indicators |
| **Info / Neutral** | `--color-text-grey` | `#95959d` | Informational / muted text |
| **Primary Action** | `--color-brand-blue` | `#0553fd` | Primary CTA, links, focus |
| **Destructive** | `--destructive` | ShadCN token (`oklch(...)`) | ShadCN destructive surfaces (light/dark) |

---

## Typography

Four fonts are exposed as Tailwind `font-*` utilities. They are mapped from Next.js `localFont` / Google fonts variables in the `@theme` block (see [`lib/fonts.ts`](lib/fonts.ts)).

| Font | CSS Variable | Tailwind Utility | Style / Weights | Source | Use Case |
| --- | --- | --- | --- | --- | --- |
| Atyp Display Trial Bold | `--font-atyp` | `font-atyp` | Bold (700), normal | Local `AtypDisplayTRIAL-Bold.woff2` | Headings, display text, brand statements |
| Garamond | `--font-garamond` | `font-garamond` | Regular (400), italic | Local `Garamond.woff2` | Elegant italic accents, editorial highlights |
| UtSaHaGumm | `--font-utsaha` | `font-utsaha` | Regular (400), normal | Local `UtSaHaGumm.woff2` | Decorative / handwritten accents |
| Comfortaa | `--font-comfortaa` | `font-comfortaa` | 400, 700 | Google Fonts | Rounded, friendly UI accents |

### Font Stack

- **Sans (default body):** `--font-atyp` → `ui-sans-serif` → `system-ui`
- **Serif (editorial):** `--font-garamond` → `ui-serif` → `Georgia`
- **Cursive (decorative):** `--font-utsaha` → `cursive`
- **Rounded Sans:** `--font-comfortaa` → `ui-sans-serif` → `system-ui`

Apply fonts via utilities (`font-atyp`, `font-garamond`, etc.) rather than inline `font-family`.

### Text Sizes

There is no custom text-size scale in `globals.css`; the project uses Tailwind's default scale (`text-sm`, `text-base`, `text-lg`, `text-2xl`, etc.). Atyp Bold is the intended heading font, and body text defaults to the UI sans stack.

---

## Border Radius

Radius is driven by the `--radius` base token with a ShadCN-derived scale in the `@theme inline` block.

| Token | Value | Tailwind Utility |
| --- | --- | --- |
| `--radius` (base) | `0.625rem` | — |
| `--radius-sm` | `calc(var(--radius) - 4px)` → `0.375rem` | `rounded-sm` |
| `--radius-md` | `calc(var(--radius) - 2px)` → `0.5rem` | `rounded-md` |
| `--radius-lg` | `var(--radius)` → `0.625rem` | `rounded-lg` |
| `--radius-xl` | `calc(var(--radius) + 4px)` → `0.875rem` | `rounded-xl` |
| `--radius-2xl` | `calc(var(--radius) + 8px)` → `1.125rem` | `rounded-2xl` |
| `--radius-3xl` | `calc(var(--radius) + 12px)` → `1.375rem` | `rounded-3xl` |
| `--radius-4xl` | `calc(var(--radius) + 16px)` → `1.625rem` | `rounded-4xl` |

---

## Theme Support

The project supports **light and dark themes** via a `.dark` class toggle (`@custom-variant dark` in `globals.css`).

- **Default (`:root`)** — Light theme. Landing surfaces use `--color-landing-bg`; ShadCN semantic tokens are tuned for light.
- **`.dark`** — Dark theme. Backgrounds switch to `--color-app-bg` / `--color-dark-bg`; all ShadCN tokens (`--card`, `--popover`, `--muted`, `--destructive`, `--sidebar-*`, etc.) flip to their dark values.

Use `dark:` variants (`dark:bg-app-bg`) and semantic tokens (`bg-background`, `text-foreground`) instead of hardcoding hex values so both themes stay consistent.

---

## Links

- **Brand link color:** `--color-brand-blue` (`#0553fd`)
- **Brand link hover:** `--color-brand-blue-hover` (`#0442cb`)
- Dark theme links should remain legible on dark surfaces (test contrast against `--color-app-bg`).

---

## Icons & Logos

Icons and logos live in the `public` directory:

| Asset | Path | Usage |
| --- | --- | --- |
| Primary logo | `public/assets/logo.svg` | Favicon, header brand mark |
| Dark logo | `public/assets/dark-logo.svg` | Logo for dark surfaces |
| Isologo | `public/assets/Isologo.svg` | Brand isologo |
| Isologo dark | `public/assets/Isologo-dark.svg` | Brand isologo (dark) |
| Logos | `public/logos/logo.svg` | Logo variant |
| Dashboard icons | `public/assets/` (`home.svg`, `discover.svg`, `dashboard.svg`, `report.svg`, `share.svg`, `copy.svg`, `edit.svg`, `trash.svg`, `sidebarclose.svg`) | Sidebar, actions, utility icons |

Keep SVG usage inline (or via existing components) so they inherit current text/border colors.

---

## Spacing

No custom spacing scale is defined — use **Tailwind's default spacing scale** (`p-4`, `gap-6`, `space-y-4`, etc.). Keep spacing consistent within a surface:

- **4px / 8px** micro-gaps (icons, compact controls)
- **16px** default component padding
- **24px** card / panel padding
- **32px+** section and layout gaps

---

## Instruction before opening a UI Pull Request

Before you open a UI pull request, verify the change:

- [ ] **Uses existing CSS variables.** No hardcoded hex colors or arbitrary values that already exist as tokens in `app/globals.css`.
- [ ] **Uses the project's typography.** Fonts come from the `font-*` utilities (`font-atyp`, `font-garamond`, etc.); sizes stay on the default Tailwind scale.
- [ ] **Maintains consistent spacing.** Follows the spacing guidance above and the surrounding component patterns.
- [ ] **Does not introduce unnecessary colors.** New surfaces/states reuse semantic tokens (success, error, warning, brand) wherever possible.
- [ ] **Works across common screen sizes.** Verified on mobile, tablet, and desktop — including the `xs` (`400px`) breakpoint.

When in doubt, reference this file and [`app/globals.css`](app/globals.css) before inventing new values.
