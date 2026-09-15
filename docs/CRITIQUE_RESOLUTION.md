# Critique resolution

This note supersedes the initial `aero critique.txt` assessment for the renamed project, **Windform**. The assessment described an early alpha prototype. Windform is now evaluated against its explicit release contract rather than full Bootstrap CSS or full shadcn/Radix parity.

## Product contract

Windform provides one shadcn-inspired token system through two authoring paths:

1. **Tailwind-native** — semantic Tailwind utilities directly in HTML. Use the browser CDN plus the documented `@theme` mapping for a no-build page, or compile the source for production.
2. **Bootstrap-compatible** — selected Bootstrap class names styled with Tailwind `@apply`; Bootstrap 5.3.8’s bundle is the only interaction runtime.

The supported Bootstrap subset and exclusions are normative in [SUPPORTED_BOOTSTRAP_5_3_8.md](SUPPORTED_BOOTSTRAP_5_3_8.md).

## Resolved critique findings

| Original finding | Current resolution | Evidence |
| --- | --- | --- |
| Carousel lacked Bootstrap lifecycle styling | Implemented `.carousel-inner`, active/directional state classes, controls, indicators, and fade departure cleanup. | `src/windform.css`; Playwright slide and fade tests. |
| Tooltip/popover used incorrect placement selectors and could conflict with Popper | Uses Popper’s `[data-popper-placement]` contract without overriding outer placement; supports Bootstrap auto-placement classes for arrows. | `src/windform.css`; Playwright placement/arrow test. |
| Offcanvas lifecycle/directions/backdrop were incomplete | Supports start/end/top/bottom, `.showing`, `.show`, `.hiding`, and backdrop lifecycle. | `src/windform.css`; Playwright lifecycle test. |
| Modal variants and runtime states were incomplete | Supports centered, scrollable, size variants, backdrops, and Bootstrap focus/Escape behavior. | `src/windform.css`; accessibility test. |
| Responsive navbar was incomplete | Supports navbar collapse, toggler icon, and Bootstrap responsive expand breakpoints. | `src/windform.css`; Playwright responsive test. |
| Forms, placeholders, button states, and dismissible alerts were basic | Adds validation states/feedback, floating labels, ranges, placeholders, check-driven buttons, and alert dismissal styling. | `src/windform.css`; Playwright test. |
| No automated compatibility, accessibility, or CI validation | Includes Playwright compatibility coverage, axe checks, package/build checks, npm audit, and a Node 20/22 GitHub Actions workflow. | `tests/`, `scripts/`, `.github/workflows/ci.yml`. |
| Versions, jQuery, package metadata, and release information were incomplete | Uses Tailwind 4.3.3 and Bootstrap 5.3.8, removes jQuery, and provides package exports, peers, changelog, lockfile, and CI. | `package.json`, `package-lock.json`, `CHANGELOG.md`. |
| Documentation implied a build was mandatory | Documents a no-build route: published Windform CSS + Tailwind browser CDN + required token `@theme` map + Bootstrap bundle; the source build is the optimized route. | `README.md`, `docs/docs.html`. |

## Intentionally not claimed

The critique also identified missing behavior for shadcn-inspired recipes and complete Bootstrap API parity. Those are not unresolved defects under Windform’s contract:

- Tier 3 recipes are visual-only; consumers own state, keyboard interaction, and accessibility behavior where Bootstrap has no equivalent runtime.
- Full Bootstrap CSS/grid/utility parity, ScrollSpy support, exhaustive form variants (including file-control details), and full shadcn/Radix JavaScript behavior are out of scope.

## Retirement gate

This critique can be removed after these release checks pass locally and in CI:

```bash
npm ci
npm test
npm audit --audit-level=high
npm pack --dry-run --json
```

The tracked contract, tests, and this resolution note replace the historical critique as the source of truth.
