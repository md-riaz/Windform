# Windform

> **Tailwind freedom with Bootstrap-ready interactions.**

Windform is a Tailwind 4-authored visual layer with one shared shadcn/ui-style HSL token system and two supported authoring paths. Write semantic Tailwind utilities directly in HTML for new work, or use selected Bootstrap class names styled through `@apply` for Bootstrap-compatible markup. Bootstrap 5.3.8's bundle is the sole component-interaction runtime.

> **Project motto**: _Tailwind freedom with Bootstrap-ready interactions._

Windform works with or without a local build. For a fast prototype, load the published Windform stylesheet, Tailwind’s browser CDN, and Bootstrap’s bundle from a page. For a production app, compile `src/windform.css` with your own Tailwind build so your output contains only the utilities your markup uses.

## Key Goals

- **Two authoring paths** – Use semantic Tailwind utilities in templates, or selected Bootstrap selectors composed from the same utilities with `@apply`.
- **Bootstrap runtime compatibility** – Bootstrap 5.3.8 supplies all supported component behavior, Popper placement, keyboard handling, focus management, and lifecycle classes.
- **Shared shadcn-style tokens** – The classic semantic HSL token contract (`--background`, `--foreground`, `--primary`, ...) is shared across both paths and extended with status tokens.
- **No-build or optimized build** – Start with CDN links for a static page, then compile `src/windform.css` with Tailwind when you need a smaller, customized production bundle.

> **Scope**: Windform is not full Bootstrap CSS or a shadcn/Radix runtime. It supports selected Bootstrap 5.3 components and styles additional CSS-only visual recipes separately. Use Tailwind utilities for layout and local composition outside the documented compatibility selectors.

## Choose an authoring path

### Tailwind-native markup

Use semantic utilities directly for new UI. Bootstrap data attributes can still provide supported interaction.

```html
<button class="inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground" data-bs-toggle="modal" data-bs-target="#settings">
  Open settings
</button>
```

### Bootstrap-compatible markup

Use documented Bootstrap class names when migrating existing markup or when your team prefers Bootstrap semantics. Windform styles them with the same Tailwind utilities through `@apply`.

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#settings">
  Open settings
</button>
```

Both paths use the same tokens. Component selectors own reusable component styling; utility classes remain available for local layout and composition.

## Fast start — no build required

For a static prototype or a quick proof of concept, copy these three tags. Windform supplies the Bootstrap-compatible component styling, Tailwind’s browser CDN makes Tailwind utilities available in markup, and Bootstrap’s bundle provides interaction.

```html
<head>
  <!-- Windform tokens + Bootstrap-compatible classes -->
  <link rel="stylesheet" href="https://md-riaz.github.io/Windform/assets/windform.css">

  <!-- Tailwind generates utilities in the browser -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <!-- Map Windform tokens to Tailwind semantic utility names -->
  <style type="text/tailwindcss">
    @theme {
      --color-background: hsl(var(--background));
      --color-foreground: hsl(var(--foreground));
      --color-card: hsl(var(--card));
      --color-card-foreground: hsl(var(--card-foreground));
      --color-primary: hsl(var(--primary));
      --color-primary-foreground: hsl(var(--primary-foreground));
      --color-secondary: hsl(var(--secondary));
      --color-secondary-foreground: hsl(var(--secondary-foreground));
      --color-muted: hsl(var(--muted));
      --color-muted-foreground: hsl(var(--muted-foreground));
      --color-accent: hsl(var(--accent));
      --color-accent-foreground: hsl(var(--accent-foreground));
      --color-border: hsl(var(--border));
      --color-input: hsl(var(--input));
      --color-ring: hsl(var(--ring));
      --radius-sm: calc(var(--radius) - 4px);
      --radius-md: calc(var(--radius) - 2px);
      --radius-lg: var(--radius);
    }
  </style>

  <!-- Bootstrap remains the interaction runtime -->
  <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</head>
```

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#welcome">
  Open dialog
</button>

<div id="welcome" class="modal fade" tabindex="-1" aria-labelledby="welcome-title">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h2 id="welcome-title" class="modal-title">Welcome</h2></div>
    <div class="modal-body">Tailwind utilities and Bootstrap interactions work without a local build.</div>
  </div></div>
</div>
```

The `@theme` block is required: `windform.css` provides CSS variables and component classes, while Tailwind&rsquo;s browser CDN needs that mapping before new utilities such as `bg-primary`, `text-muted-foreground`, `border-border`, and `rounded-lg` can be generated. The browser CDN is ideal for learning, demos, and small static pages; pin CDN versions and use a self-hosted/compiled stylesheet for production performance, strict content-security policies, offline/reproducible deployments, or a customized/purged stylesheet.

## Optimized build for production

Use the build path when you want a minimal CSS bundle or need to customize the Windform source/config pair.

## Project Structure

```
Windform/
├── docs/assets/windform.css  # Generated CSS served to browsers and docs
├── docs/components.html    # Showcase of supported components
├── src/windform.css          # Tailwind-authored source file
├── tailwind.config.js      # Tailwind content scan
└── package.json            # Scripts for build/watch + Tailwind dependency
```

The Tailwind source describes structural expectations (modals, dropdowns, offcanvas, collapse) alongside component visuals so the generated CSS works out of the box with Bootstrap's JavaScript.

## Build setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the Tailwind CLI**
   ```bash
   # One-off build
   npm run build

   # Live rebuild while editing src/windform.css
   npm run dev
   ```

3. **Open the docs and components gallery**
   ```bash
   python3 -m http.server
   ```
   Navigate to `http://localhost:8000/docs/components.html` to explore every component wired to Bootstrap JS.

## Using Windform in a built project

1. **Copy and own Windform's source/config pair** – `src/windform.css` begins with `@config "../tailwind.config.js"`. Copy it with `tailwind.config.js` in the same relative layout (for example `resources/css/windform.css` beside `tailwind.config.js` at the project root), then extend that copied config for your HTML, Blade, JSX, or other templates. Directly importing `windform/windform.css` is not the supported configuration route in 0.1.0 because its paired config template must be owned and extended by your application.
2. **Bundle Bootstrap JavaScript** – Include `bootstrap.bundle.min.js` (via npm, CDN, or your preferred bundler) so data attributes continue to power supported interactive components.
3. **Serve your generated CSS** – Point your app to the Tailwind build artifact produced on your machine or CI. The sample `docs/assets/windform.css` is useful for demos but should not be treated as an immutable production asset.

Your existing Bootstrap markup continues to function once those pieces are in place:

```html
<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Launch modal
</button>

<div class="modal fade" id="exampleModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Welcome to Windform</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p class="text-muted">Bootstrap JavaScript drives the behaviour while Tailwind utilities provide the visuals.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
```

## Tailwind-powered styling

`src/windform.css` composes Bootstrap-flavoured classes from Tailwind utilities:

```css
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
  }

  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }
}
```

Override utilities in your application (or fork the source file) to customise colours, spacing, and typography to match your brand.

The base layer exports the full shadcn token map (`--background`, `--foreground`, `--primary`, etc.) so you can theme components globally or on a per-component basis by overriding CSS variables.

## Supported component tiers

The detailed release contract lives in [`docs/SUPPORTED_BOOTSTRAP_5_3_8.md`](docs/SUPPORTED_BOOTSTRAP_5_3_8.md). The historical audit has been closed against that contract in [`docs/CRITIQUE_RESOLUTION.md`](docs/CRITIQUE_RESOLUTION.md).

- **Tier 1 — supported and browser-tested:** alerts, button controls, collapse/accordion, dropdown, responsive navbar collapse, tabs, modal, offcanvas, toast, and scoped form controls.
- **Tier 2 — beta and browser-tested:** carousel, tooltip, and popover.
- **Tier 3 — visual recipes:** shadcn-inspired selectors where no Bootstrap runtime exists; consumers provide behavior and accessibility semantics.

The single CSS layer implements the following Bootstrap-compatible selectors:

- Buttons (`.btn`, variants, sizes, button groups)
- Cards (`.card`, `.card-header`, `.card-body`, `.card-footer`)
- Forms (`.form-control`, `.form-select`, `.input-group`, `.form-label`, `.form-check`)
- Dropdowns (`.dropdown-menu`, `.dropdown-item`, placement modifiers)
- Modals (`.modal`, `.modal-dialog`, `.modal-backdrop`, `.fade`)
- Collapse & Accordion (`.collapse`, `.collapsing`, `.accordion-*`)
- Offcanvas (`.offcanvas`, directional variants)
- Navigation (`.nav-tabs`, `.nav-pills`)
- Alerts, badges, progress bar, table styling
- CSS-only visual recipes, explicitly marked where Bootstrap has no matching interaction runtime

Bootstrap layout and helper utilities are out of scope; use Tailwind utilities directly for layout and local composition. `text-muted` is retained as a text-color compatibility selector and maps to `text-muted-foreground`.

Refer to `docs/components.html` for real-world markup examples that exercise each component and match the Bootstrap data-API triggers. A larger AdminLTE 2-inspired migration example family starts at `examples/admin-panel/index.html`, with generated split pages for widgets, mailbox, forms, advanced forms, plugin bridging, tables, profile, invoice, calendar, buttons, modals, timeline, login, and errors. `examples/admin-panel/cdn-starter.html` is the quick no-build variant: it uses `@tailwindcss/browser@4`, inline `@theme` tokens, and Bootstrap JS from CDN. `examples/admin-panel/plugins.html` demonstrates scoped optional Select2 integration for legacy plugin screens. The generated examples keep Bootstrap JS interactions while using Windform/Tailwind tokens instead of AdminLTE assets. Run `npm run build:admin` to regenerate those static pages; the production stylesheet scans `./examples/**/*.html`, so run `npm run build` before opening a source checkout directly.

## Accessibility Notes

- Focus states use Tailwind's `focus-visible` utilities with high-contrast outlines.
- Dropdowns, modals, collapse, and offcanvas respect Bootstrap's keyboard interactions because structural classes remain intact.
- Reduced motion preferences are honoured through the base layer media query.

## License

MIT © Windform contributors.
