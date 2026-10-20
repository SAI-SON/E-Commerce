# "Heritage Jewel" Design System & Guidelines

## 1. Design Direction: "Heritage Jewel"
**Heritage Jewel** represents a modern, artisanal Indian luxury fashion experience. It blends centuries of textile tradition (handlooms, zardozi goldwork, royal jewel tones) with high-end editorial aesthetics and sleek digital ergonomics.

---

## 2. Color Palette & Design Tokens

Tailwind tokens are defined under `theme.extend.colors.jewel` and mapped into CSS variables:

| Token Name | Hex Code | Role | Description |
|---|---|---|---|
| `bg` | `#FFF9F0` | Canvas / Background | Warm cream inspired by unbleached kora cotton |
| `surface` | `#FFFFFF` | Cards & Surfaces | Pure white elevated surfaces with soft layered shadow |
| `primary` | `#1E2A5E` | Brand Primary | Deep Indigo / Royal Navy for regal authority and trust |
| `primary-hover` | `#2B3A85` | Primary Hover | Luminous indigo lift state |
| `accent` | `#F2A33A` | Primary Accent | Saffron / Marigold gold for CTAs, highlights, and focus |
| `accent-hover` | `#E08E1F` | Accent Hover | Deepened warm saffron |
| `rose` | `#B83A4B` | Secondary Accent | Rose Madder for badges, discounts, low-stock, and alerts |
| `emerald` | `#2E8B6E` | Success Accent | Emerald green for confirmations, in-stock badges |
| `ink` | `#15131F` | Primary Text | Deep ink black with high contrast (WCAG AAA) |
| `muted` | `#6B6880` | Muted Text | Dusty slate for subtitles and metadata |
| `border` | `#EDE6DA` | Structural Borders | Subtle warm sand border for delicate separation |
| `dark-footer` | `#1E2A5E` to `#3A1F5C` | Footer / Hero Gradients | Midnight indigo to amethyst jewel tone gradient |

---

## 3. Typography Hierarchy

Fonts are loaded asynchronously from Google Fonts with `font-display: swap`:
- **Display & Headings**: `Cormorant Garamond` (weights 600, 700), with `Playfair Display` fallback.
- **Body & Interactive UI**: `Plus Jakarta Sans` (weights 400, 500, 600), with `Inter` fallback.

### Fluid Typography Scale (`clamp`)
- `h1`: `clamp(2.25rem, 5vw + 1rem, 3.75rem)` (36px – 60px)
- `h2`: `clamp(1.75rem, 3.5vw + 0.5rem, 2.75rem)` (28px – 44px)
- `h3`: `clamp(1.25rem, 2vw + 0.5rem, 1.85rem)` (20px – 30px)
- `body`: `1rem` (16px) with 1.625 line height

---

## 4. Spacing, Shapes & Depth

- **Spacing Grid**: 8px modular spacing system (`p-2`, `p-4`, `p-6`, `p-8`, `p-12`).
- **Border Radii**:
  - `rounded-xl` (12px) for buttons, badges, and input controls.
  - `rounded-2xl` (16px) for cards, dialogs, and image containers.
  - `rounded-3xl` (24px) for modals, feature hero banners, and bottom sheets.
- **Elevation / Layered Shadows**:
  - `shadow-jewel`: `0 2px 10px -2px rgba(30, 42, 94, 0.05), 0 8px 24px -4px rgba(30, 42, 94, 0.07)`
  - `shadow-jewel-hover`: `0 14px 34px -4px rgba(30, 42, 94, 0.12), 0 4px 12px -2px rgba(242, 163, 58, 0.08)`
  - `shadow-saffron-glow`: `0 0 20px -3px rgba(242, 163, 58, 0.35)`
- **Glassmorphism**:
  - `.glass-navbar`: `background: rgba(255, 249, 240, 0.85); backdrop-filter: blur(14px)`
  - `.glass-card`: `background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(10px)`

---

## 5. Animation Conventions (Framer Motion)

- **Page Transitions**: Smooth fade & slide-up (`opacity: 0, y: 12` to `opacity: 1, y: 0`).
- **Buttons**:
  - Press feedback: `whileTap={{ scale: 0.97 }}`
  - Hover elevation: `whileHover={{ y: -1 }}`
- **Card Hover Effects**:
  - Lift on hover: `whileHover={{ y: -4 }}` with saffron subtle glow or border tint.
  - Product image zoom: `group-hover:scale-105 duration-500 ease-out`.
- **Skeleton Loaders**: Linear gradient shimmering across surface (`@keyframes shimmer`).
- **Reduced Motion**: Respects `@media (prefers-reduced-motion: reduce)` by disabling animations and instant-rendering elements.

---

## 6. Shared Component Inventory

1. **`Button`** (`client/src/components/common/Button.tsx`):
   - Variants: `primary`, `secondary`, `accent`, `outline`, `ghost`, `danger`.
   - Sizes: `sm` (36px min-h), `md` (44px min-h touch target), `lg` (48px min-h).
   - States: `isLoading` (custom SVG spinner), `disabled`.
2. **`Card`** (`client/src/components/common/Card.tsx`):
   - Rounded-2xl, customizable `hoverable` lift, and `glass` option.
3. **`Badge`** (`client/src/components/common/Badge.tsx`):
   - Variants: `default`, `sale`, `new`, `lowStock`, `success`, `warning`, `danger`, `accent`, `indigo`.
4. **`Skeleton`** (`client/src/components/common/Skeleton.tsx`):
   - Variants: `text`, `circular`, `rectangular`, `card`, plus composite `ProductCardSkeleton`.
5. **`Modal`** (`client/src/components/common/Modal.tsx`):
   - Spring modal dialog with backdrop blur, Escape listener, responsive sizes (`sm`, `md`, `lg`, `xl`).
6. **`Drawer`** (`client/src/components/common/Drawer.tsx`):
   - Spring slide-in panel supporting `right`, `left`, and `bottom` positions.
7. **`Toast`** (`client/src/components/common/Toast.tsx`):
   - Floating notification with spring animation, status icons, and auto-dismiss timer.
8. **`SectionHeading`** (`client/src/components/common/SectionHeading.tsx`):
   - Editorial serif title, gold diamond divider ornament, subtitle, and responsive actions.
9. **`Container`** (`client/src/components/common/Container.tsx`):
   - Standardized maximum width and horizontal padding (`sm`, `md`, `lg`, `full`).
10. **`EmptyState`** (`client/src/components/common/EmptyState.tsx`):
   - Premium empty state card with gold glowing icon badge and CTA button.
