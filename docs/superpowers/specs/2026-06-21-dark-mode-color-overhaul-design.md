# Theme Overhaul & Glassmorphism Spec

- **Date:** 2026-06-21
- **Status:** Approved
- **Author:** Antigravity (Google DeepMind Team)

## 1. Overview
The user wants to overhaul both the Dark Mode and Light Mode color palettes and layouts to use a premium glassmorphic style.
- **Dark Mode**: High-contrast, premium neon/lime green accents (`#8ae334`) on a deep charcoal-green background (`#060b08`), featuring dark translucent gradient cards and thin glows.
- **Light Mode**: Translucent frosted-glass cards sitting on top of a soft pastel green and pink gradient background, replacing the harsh split solid background.
- Both modes use semantic classes (`bg-bgSecondary`, `border-borderColor`) to represent glass elements.

## 2. Design Tokens

### 2.1 Dark Mode `.dark` Variables
We redefine the following custom properties inside `src/index.css` under the `.dark` class:

| CSS Variable | Value / RGB | Description |
|---|---|---|
| `--bg-primary` | `6 11 8` | Deep charcoal green background (`#060b08`) |
| `--bg-secondary` | `12 22 17` | Card base dark green (`#0c1611`) |
| `--app-bg` | `6 11 8` | Global application background |
| `--text-primary` | `255 255 255` | High contrast white text |
| `--text-secondary` | `156 163 175` | Slate-400 secondary text |
| `--border-color` | `138 227 52` | Lime/neon green brand color |
| `--brand-500` | `138 227 52` | Primary Neon/Lime Green (`#8ae334`) |

### 2.2 Light Mode `:root` Variables
We update these custom properties for Light Mode in `src/index.css`:

| CSS Variable | Value / RGB | Description |
|---|---|---|
| `--bg-primary` | `243 248 245` | Soft pastel greenish-gray background |
| `--bg-secondary` | `255 255 255` | Frosted glass card base (with opacity in CSS overrides) |
| `--app-bg` | `243 248 245` | Global application background base |
| `--border-color` | `255 255 255` | Translucent border (white glow overlay) |
| `--accent-green` | `34 197 94` | Soft emerald green accent |
| `--accent-pink` | `244 114 182` | Soft rose/pink accent |

## 3. Implementation Strategy

### Phase 1: CSS Variables Update
Update the `:root` and `.dark` blocks in `src/index.css` to define the new variables.

### Phase 2: Global Glassmorphic Overrides (`src/index.css`)
1. **Dark Mode overrides**:
   - `.dark .bg-bgSecondary`: Translucent dark green-black gradient with `backdrop-filter: blur(16px)` and thin neon green border.
   - `.dark .border`, `.dark .border-borderColor`: Translucent neon green borders.
2. **Light Mode overrides**:
   - `html:not(.dark) .bg-bgSecondary`: Translucent white frosted-glass (`rgba(255, 255, 255, 0.45)` to `rgba(255, 255, 255, 0.75)`) with `backdrop-filter: blur(16px)` and `border: 1px solid rgba(255, 255, 255, 0.4)`.
   - `html:not(.dark) .border`, `html:not(.dark) .border-borderColor`: Translucent white borders (`rgba(255, 255, 255, 0.4)` or soft gray).

### Phase 3: Background Layout Gradient Update (`src/layouts/AppLayout.tsx`)
In `src/layouts/AppLayout.tsx`, replace the solid split-colored blocks with a single full-screen diagonal gradient from pastel green to pastel pink and set the parent container background to transparent in light mode:
```tsx
{/* Decorative Background Shapes */}
<div className="absolute inset-0 z-[-1] flex overflow-hidden pointer-events-none bg-gradient-to-br from-[#d1fae5] to-[#fbcfe8] dark:from-[#060b08] dark:to-[#08120d]">
  {/* Giant Text overlays can remain with subtle opacity */}
</div>
```

## 4. Verification Plan
- **Light Mode Check**: Ensure frosted-glass cards appear beautifully over the pastel green-pink background gradient.
- **Dark Mode Check**: Confirm dark glass cards render correctly with neon active states.
- **Responsive Layout**: Check layout consistency.
