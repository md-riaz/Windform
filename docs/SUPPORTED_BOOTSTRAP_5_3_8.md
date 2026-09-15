# Supported Bootstrap 5.3.8 contract

Bootstrap 5.3.8's bundle is Windform's only interaction runtime. Windform does not ship Bootstrap CSS, a custom JavaScript runtime, or Radix/shadcn behavior.

## Tier 1 — supported and browser-tested

- Alerts and dismissible alerts
- Button groups and selectable button controls
- Collapse and accordion
- Dropdowns, including end alignment
- Responsive navbar collapse
- Tabs
- Modal and offcanvas
- Toast
- Core form controls, validation states, floating labels, ranges, and file controls

## Tier 2 — beta, browser-tested

- Carousel
- Tooltip
- Popover

## Tier 3 — visual recipes only

shadcn-inspired controls without a Bootstrap equivalent, including command, calendar, combobox, context menu, menubar, resizable panels, OTP input, data table, and Sonner styles. Consumers supply behavior, keyboard handling, state management, and accessibility semantics.

## Out of scope

- Full Bootstrap CSS, grid, and helper-utility parity
- ScrollSpy as a package contract
- Full Bootstrap form API or responsive utility matrix
- shadcn/Radix JavaScript behavior
