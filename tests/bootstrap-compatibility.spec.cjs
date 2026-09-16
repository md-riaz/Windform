const path = require('node:path');
const { test, expect } = require('@playwright/test');

const cssPath = path.resolve(__dirname, '../docs/assets/windform.css');
const bootstrapPath = path.resolve(__dirname, '../node_modules/bootstrap/dist/js/bootstrap.bundle.js');
const cdnStarterPath = path.resolve(__dirname, '../docs/cdn-starter.html');
const templatesPath = path.resolve(__dirname, '../docs/templates.html');
const authPath = path.resolve(__dirname, '../docs/auth.html');

async function loadRuntime(page, markup) {
  await page.setContent(`<main>${markup}</main>`);
  await page.addStyleTag({ path: cssPath });
  await page.addScriptTag({ path: bootstrapPath });
}

test('Bootstrap tabs hide inactive panes', async ({ page }) => {
  await loadRuntime(page, `
    <nav class="nav nav-tabs"><button id="first-tab" class="nav-link active" data-bs-toggle="tab" data-bs-target="#first">First</button><button id="second-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#second">Second</button></nav>
    <div class="tab-content"><section id="first" class="tab-pane fade show active">First panel</section><section id="second" class="tab-pane fade">Second panel</section></div>
  `);

  await expect(page.locator('#second')).toHaveCSS('display', 'none');
  await page.locator('#second-tab').click();
  await expect(page.locator('#first')).toHaveCSS('display', 'none');
  await expect(page.locator('#second')).toBeVisible();
});

test('Bootstrap offcanvas and toast render lifecycle states', async ({ page }) => {
  await loadRuntime(page, `
    <div id="drawer" class="offcanvas offcanvas-end" tabindex="-1"><div class="offcanvas-body">Drawer</div></div>
    <div class="toast-container bottom-0 end-0"><div id="toast" class="toast"><div class="toast-body">Saved</div></div></div>
  `);

  await page.evaluate(() => window.bootstrap.Offcanvas.getOrCreateInstance('#drawer').show());
  await expect(page.locator('#drawer')).toHaveClass(/show/);
  await expect(page.locator('#drawer')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.offcanvas-backdrop')).toHaveClass(/show/);
  await expect(page.locator('.offcanvas-backdrop')).toHaveCSS('position', 'fixed');
  await expect(page.locator('.offcanvas-backdrop')).toHaveCSS('opacity', '1');

  await page.evaluate(() => window.bootstrap.Toast.getOrCreateInstance('#toast').show());
  await expect(page.locator('#toast')).toHaveClass(/show/);
  await expect(page.locator('#toast')).toHaveCSS('opacity', '1');
});

test('Bootstrap end-aligned dropdown preserves its modifier geometry', async ({ page }) => {
  await loadRuntime(page, `
    <div class="dropdown"><button id="toggle" data-bs-toggle="dropdown">Menu</button><div id="menu" class="dropdown-menu dropdown-menu-end"><button class="dropdown-item">Item</button></div></div>
  `);

  await expect(page.locator('#menu')).toHaveCSS('--bs-position', 'end');
  await page.locator('#toggle').click();
  await expect(page.locator('#menu')).toHaveClass(/show/);
});

test('Bootstrap navbar expands responsively and collapse works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await loadRuntime(page, `
    <nav class="navbar navbar-expand-lg"><a class="navbar-brand">Brand</a><button id="toggler" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav"><span class="navbar-toggler-icon"></span></button><div id="nav" class="collapse navbar-collapse"><ul class="navbar-nav"><li><a class="nav-link">Home</a></li></ul></div></nav>
  `);
  await expect(page.locator('#nav')).toHaveCSS('display', 'none');
  await page.locator('#toggler').click();
  await expect(page.locator('#nav')).toHaveClass(/show/);
  await expect(page.locator('.navbar-toggler-icon')).toHaveCSS('background-image', /linear-gradient/);

  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(page.locator('#nav')).toHaveCSS('display', 'flex');
  await expect(page.locator('#toggler')).toHaveCSS('display', 'none');
});

test('Bootstrap validation, placeholders, alerts, and toggle buttons expose styled states', async ({ page }) => {
  await loadRuntime(page, `
    <form class="was-validated"><input id="invalid" class="form-control" required value=""><div id="feedback" class="invalid-feedback">Required</div></form>
    <span id="placeholder" class="placeholder placeholder-wave">Loading</span>
    <div id="alert" class="alert alert-dismissible">Notice<button id="close" class="btn-close" data-bs-dismiss="alert"></button></div>
    <input id="check" class="btn-check" type="checkbox"><label id="label" class="btn btn-primary" for="check">Toggle</label>
  `);
  await expect(page.locator('#feedback')).toHaveCSS('display', 'block');
  await expect(page.locator('#invalid')).toHaveCSS('border-color', /rgb/);
  await expect(page.locator('#placeholder')).toHaveCSS('display', 'inline-block');
  await expect(page.locator('#placeholder')).toHaveCSS('animation-name', /windform-placeholder-wave/);
  await expect(page.locator('#close')).toHaveCSS('position', 'absolute');
  await page.locator('#close').click();
  await expect(page.locator('#alert')).toHaveCount(0);
  await page.locator('#label').click();
  await expect(page.locator('#check')).toBeChecked();
  await expect(page.locator('#label')).toHaveCSS('box-shadow', /inset/);
});

test('Bootstrap Popper overlays retain runtime placement and arrow styles', async ({ page }) => {
  await loadRuntime(page, `<button id="target" title="Tooltip" data-bs-content="Popover">Target</button>`);

  await page.evaluate(() => window.bootstrap.Tooltip.getOrCreateInstance('#target', { placement: 'bottom' }).show());
  const tooltip = page.locator('.tooltip');
  await expect(tooltip).toHaveAttribute('data-popper-placement', /^bottom/);
  await expect(tooltip).toHaveClass(/bs-tooltip-auto/);
  await expect(tooltip).toHaveCSS('left', /^(?!50%)/);
  await expect(tooltip.locator('.tooltip-arrow')).toHaveCSS('top', /-/);

  await page.evaluate(() => window.bootstrap.Tooltip.getInstance('#target').dispose());
  await page.evaluate(() => window.bootstrap.Popover.getOrCreateInstance('#target', { placement: 'right' }).show());
  const popover = page.locator('.popover');
  await expect(popover).toHaveAttribute('data-popper-placement', /^right/);
  await expect(popover).toHaveClass(/bs-popover-auto/);
  await expect(popover).toHaveCSS('left', /^(?!50%)/);
  await expect(popover.locator('.popover-arrow')).toHaveCSS('left', /-/);
});

test('Bootstrap carousel moves active slide', async ({ page }) => {
  await loadRuntime(page, `
    <div id="carousel" class="carousel slide"><div class="carousel-inner"><div id="one" class="carousel-item active">One</div><div id="two" class="carousel-item">Two</div></div><button id="next" data-bs-target="#carousel" data-bs-slide="next">Next</button></div>
  `);

  await expect(page.locator('#one')).toHaveCSS('display', 'block');
  await expect(page.locator('#two')).toHaveCSS('display', 'none');
  await page.locator('#next').click();
  await expect(page.locator('#two')).toHaveClass(/active/);
  await expect(page.locator('#two')).toHaveCSS('display', 'block');
});

test('Bootstrap fade carousel clears the departing slide after transition', async ({ page }) => {
  await loadRuntime(page, `
    <div id="carousel" class="carousel carousel-fade slide"><div class="carousel-inner"><div id="one" class="carousel-item active">One</div><div id="two" class="carousel-item">Two</div></div><button id="next" data-bs-target="#carousel" data-bs-slide="next">Next</button></div>
  `);

  await page.locator('#next').click();
  await expect(page.locator('#two')).toHaveClass(/active/);
  await expect(page.locator('#one')).toHaveCSS('opacity', '0');
});

test('CDN starter documents token mapping and Bootstrap interactions', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js', (route) => route.fulfill({ path: bootstrapPath }));
  await page.goto(`file://${cdnStarterPath.replace(/\\/g, '/')}`);

  await expect.poll(() => page.locator('style[type="text/tailwindcss"]').evaluate((node) => node.textContent)).toContain('--color-primary: hsl(var(--primary));');
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href', 'assets/windform.css');
  await page.locator('[data-bs-target="#starterModal"]').click();
  await expect(page.locator('#starterModal')).toHaveClass(/show/);
});

test('Application templates expose responsive CRUD and layout interactions', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js', (route) => route.fulfill({ path: bootstrapPath }));
  await page.goto(`file://${templatesPath.replace(/\\/g, '/')}`);

  await expect(page.locator('#admin')).toContainText('Operations overview');
  await expect(page.locator('#crud')).toContainText('Customers');
  await expect(page.locator('#tables table tbody tr')).toHaveCount(3);
  await expect(page.locator('#tables table tbody tr').nth(1).locator('td').last()).toHaveText('—');
  await expect(page.locator('#segment')).toHaveCSS('appearance', 'none');
  await page.locator('[data-bs-target="#customerModal"]').click();
  await expect(page.locator('#customerModal')).toHaveClass(/show/);
  await page.locator('#customerModal .btn-close').click();
  await expect(page.locator('#customerModal')).not.toHaveClass(/show/);
  await page.locator('[data-bs-target="#settings-panel"]').click();
  await expect(page.locator('#settings-panel')).toHaveClass(/active/);
});

test('AdminLTE-inspired template exposes dashboard app families', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js', (route) => route.fulfill({ path: bootstrapPath }));
  await page.goto(`file://${templatesPath.replace(/\\/g, '/')}`);

  await expect(page.locator('#adminlte-shell')).toContainText('Classic admin preview');
  await expect(page.locator('#adminlte-shell')).toContainText('New orders');
  await expect(page.locator('#mailbox-preview')).toContainText('Welcome to Windform admin');
  await expect(page.locator('#invoice-preview')).toContainText('Invoice #WF-2048');
  await page.locator('[data-bs-target="#adminMenuCharts"]').click();
  await expect(page.locator('#adminMenuCharts')).toHaveClass(/show/);
  await page.locator('[data-bs-target="#salesDonut"]').click();
  await expect(page.locator('#salesDonut')).toHaveClass(/active/);
  await page.locator('[data-bs-target="#invoiceStatusModal"]').click();
  await expect(page.locator('#invoiceStatusModal')).toHaveClass(/show/);
  await page.locator('#invoiceStatusModal .btn-close').click();
  await expect(page.locator('#invoiceStatusModal')).not.toHaveClass(/show/);
});

test('Auth templates include the complete account access flow', async ({ page }) => {
  await page.goto(`file://${authPath.replace(/\\/g, '/')}`);

  await expect(page.locator('#login')).toContainText('Welcome back');
  await expect(page.locator('#register')).toContainText('Create your workspace');
  await expect(page.locator('#forgot')).toContainText('Recover access');
  await expect(page.locator('#reset')).toContainText('Choose a new password');
  await expect(page.locator('#verify input[aria-label^="Digit"]')).toHaveCount(6);
  await expect(page.locator('#lockscreen')).toContainText('Session locked');
  await expect(page.locator('#lockPassword')).toHaveAttribute('autocomplete', 'current-password');
  await expect(page.locator('input[autocomplete="current-password"]')).toHaveCount(2);
  await expect(page.locator('input[autocomplete="new-password"]')).toHaveCount(3);
});
