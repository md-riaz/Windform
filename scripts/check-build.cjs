const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const outputPath = path.resolve(__dirname, '../docs/assets/windform.css');
const blocksPath = path.resolve(__dirname, '../docs/blocks.html');
const css = fs.readFileSync(outputPath, 'utf8');
const blocks = fs.readFileSync(blocksPath, 'utf8');
const requiredFragments = [
  '.carousel-inner',
  '.carousel-item.active',
  '.carousel-item-next',
  '.tab-content>.tab-pane',
  '.offcanvas.showing',
  '.offcanvas-backdrop',
  '.dropdown-menu-end',
  '.navbar-collapse',
  '.navbar-expand-lg',
  '.form-floating',
  '.form-control.is-invalid',
  '.placeholder-wave',
  '.alert-dismissible .btn-close',
  '.btn-check',
  '.toast.showing',
  '[data-popper-placement^=',
  '.modal-backdrop',
  '.collapse-horizontal',
];

assert.ok(css.length > 0, 'Generated CSS is empty.');

const missing = requiredFragments.filter((fragment) => !css.includes(fragment));
assert.equal(missing.length, 0, `Generated CSS is missing: ${missing.join(', ')}`);

const ariaControls = [...blocks.matchAll(/\baria-controls="([^"]+)"/g)].map((match) => match[1]);
const invalidIdRefs = ariaControls.filter((id) => id.startsWith('#') || !blocks.includes(`id="${id}"`));
assert.equal(invalidIdRefs.length, 0, `Invalid aria-controls IDREFs: ${invalidIdRefs.join(', ')}`);

console.log(`Validated ${path.relative(process.cwd(), outputPath)} (${css.length} bytes) and ${ariaControls.length} aria-controls references.`);
