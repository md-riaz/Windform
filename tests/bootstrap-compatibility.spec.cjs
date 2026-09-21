const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const cssPath = path.resolve(__dirname, '../docs/assets/windform.css');
const bootstrapPath = path.resolve(__dirname, '../node_modules/bootstrap/dist/js/bootstrap.bundle.js');
const cdnStarterPath = path.resolve(__dirname, '../docs/cdn-starter.html');
const templatesPath = path.resolve(__dirname, '../docs/templates.html');
const authPath = path.resolve(__dirname, '../docs/auth.html');
const componentsPath = path.resolve(__dirname, '../docs/components.html');
const adminPanelExamplePath = path.resolve(__dirname, '../examples/admin-panel/index.html');
const adminPanelDir = path.resolve(__dirname, '../examples/admin-panel');

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
  await page.setViewportSize({ width: 390, height: 800 });
  await page.locator('[data-bs-target="#templateNav"]').click();
  await expect(page.locator('#templateNav')).toHaveClass(/show/);
  await expect(page.locator('#templateNav')).toContainText('AdminLTE-style shell');
  await page.reload();
  await page.setViewportSize({ width: 1280, height: 900 });
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
  const profileNameColor = await page.locator('#adminlte-shell aside').getByText('Maya Rahman').evaluate((node) => getComputedStyle(node).color);
  expect(profileNameColor).toBe('rgb(255, 255, 255)');
  const templateNoteColor = await page.locator('#adminlte-shell aside').getByText('Use this as an application shell starter').evaluate((node) => getComputedStyle(node).color);
  expect(templateNoteColor).not.toBe('rgb(2, 6, 23)');
  await page.locator('#invoiceStatusModal .btn-close').click();
  await expect(page.locator('#invoiceStatusModal')).not.toHaveClass(/show/);
});

test('Component docs include remaining Bootstrap copy examples', async ({ page }) => {
  const html = fs.readFileSync(componentsPath, 'utf8');
  for (const fragment of [
    'Form states and controls',
    'class="form-floating"',
    'class="form-control is-valid"',
    'class="form-control is-invalid"',
    'class="form-check form-switch"',
    'type="file"',
    'type="color"',
    'class="form-range"',
    'Close buttons',
    'class="btn-close"',
    'Placeholders',
    'placeholder-glow',
    'placeholder-wave'
  ]) {
    expect(html).toContain(fragment);
  }

  await loadRuntime(page, `
    <button type="button" class="btn-close" aria-label="Close panel"></button>
    <div class="placeholder-glow"><span class="placeholder col-6 rounded"></span></div>
    <div class="placeholder-wave"><span class="placeholder col-4 rounded"></span></div>
    <div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" checked></div>
  `);
  await expect(page.locator('.btn-close')).toHaveAttribute('aria-label', 'Close panel');
  await expect(page.locator('.placeholder').first()).toHaveCSS('display', 'inline-block');
  await expect(page.locator('.form-switch .form-check-input')).toHaveCSS('appearance', 'none');
});

test('Admin panel example clones AdminLTE page families with Bootstrap runtime', async ({ page }) => {
  const pages = ['index.html', 'widgets.html', 'mailbox.html', 'forms.html', 'advanced-forms.html', 'tables.html', 'profile.html', 'invoice.html', 'calendar.html', 'buttons.html', 'modals.html', 'timeline.html', 'login.html', 'errors.html'];
  for (const name of pages) {
    const html = fs.readFileSync(path.join(adminPanelDir, name), 'utf8');
    expect(html).toContain('../../docs/assets/windform.css');
    expect(html).toContain('bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js');
    expect(html).not.toMatch(/jquery|adminlte\.min|adminlte\.css|adminlte\.js/i);
  }
  const pluginHtml = fs.readFileSync(path.join(adminPanelDir, 'plugins.html'), 'utf8');
  expect(pluginHtml).toContain('select2@4.1.0-rc.0');
  expect(pluginHtml).toContain('jquery@3.7.1');
  expect(pluginHtml).toContain('Plugin bridge: Select2');
  expect(pluginHtml).not.toMatch(/adminlte\.min|adminlte\.css|adminlte\.js/i);
  const cdnHtml = fs.readFileSync(path.join(adminPanelDir, 'cdn-starter.html'), 'utf8');
  expect(cdnHtml).toContain('@tailwindcss/browser@4');
  expect(cdnHtml).toContain('@theme');
  expect(cdnHtml).toContain('No build required');

  await page.route('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js', (route) => route.fulfill({ path: bootstrapPath }));
  await page.goto(`file://${adminPanelExamplePath.replace(/\\/g, '/')}`);
  await expect(page.locator('h1')).toContainText('AdminLTE dashboard, Windform design');
  await expect.poll(() => page.evaluate(() => typeof window.bootstrap)).toBe('object');
  await page.getByRole('button', { name: /Messages/ }).click();
  await expect(page.getByRole('button', { name: 'Support replied' })).toBeVisible();
  await expect(page.locator('#areaChartTab')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#donutChart')).toHaveCSS('display', 'none');
  await page.locator('#donutChartTab').click();
  await expect(page.locator('#areaChartTab')).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('#donutChartTab')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#donutChart')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 800 });
  await page.locator('[data-bs-target="#mobileNav"]').click();
  await expect(page.locator('#mobileNav')).toHaveClass(/show/);
  await expect(page.locator('#mobileNav')).toContainText('Errors');

  await page.goto(`file://${path.join(adminPanelDir, 'mailbox.html').replace(/\\/g, '/')}`);
  await page.locator('[data-bs-target="#composeModal"]').click();
  await expect(page.locator('#composeModal')).toHaveClass(/show/);
  await page.locator('#composeModal .btn-close').click();
  await expect(page.locator('#composeModal')).not.toHaveClass(/show/);

  await page.goto(`file://${path.join(adminPanelDir, 'profile.html').replace(/\\/g, '/')}`);
  await page.locator('#timelinePaneTab').click();
  await expect(page.locator('#timelinePane')).toBeVisible();

  await page.goto(`file://${path.join(adminPanelDir, 'invoice.html').replace(/\\/g, '/')}`);
  await page.getByRole('button', { name: 'Download' }).click();
  await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();

  await page.goto(`file://${path.join(adminPanelDir, 'login.html').replace(/\\/g, '/')}`);
  await expect(page.getByLabel('Remember me')).toBeVisible();

  await page.goto(`file://${path.join(adminPanelDir, 'modals.html').replace(/\\/g, '/')}`);
  await page.getByRole('button', { name: 'Open modal' }).click();
  await expect(page.locator('#confirmModal')).toHaveClass(/show/);

  await page.goto(`file://${path.join(adminPanelDir, 'buttons.html').replace(/\\/g, '/')}`);
  await page.getByRole('button', { name: 'Bulk action' }).click();
  await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();

  await page.goto(`file://${path.join(adminPanelDir, 'cdn-starter.html').replace(/\\/g, '/')}`);
  await expect(page.locator('h1')).toContainText('Admin panel from CDN assets');
  await page.getByRole('button', { name: 'Open actions' }).click();
  await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
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
