const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const cssPath = path.resolve(__dirname, '../docs/assets/windform.css');
const bootstrapPath = path.resolve(__dirname, '../node_modules/bootstrap/dist/js/bootstrap.bundle.js');
const adminPanelDir = path.resolve(__dirname, '../examples/admin-panel');

async function loadFixture(page) {
  await page.setContent(`
    <!doctype html>
    <html lang="en"><head><meta charset="utf-8"><title>Windform accessibility fixture</title></head><body>
      <main>
        <button id="open" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#dialog">Open dialog</button>
        <div id="dialog" class="modal fade" tabindex="-1" aria-labelledby="dialog-title" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 id="dialog-title" class="modal-title">Settings</h2><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">Content</div></div></div></div>
        <nav class="nav nav-tabs" role="tablist"><button id="first-tab" class="nav-link active" data-bs-toggle="tab" data-bs-target="#first" type="button" role="tab" aria-controls="first" aria-selected="true">First</button><button id="second-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#second" type="button" role="tab" aria-controls="second" aria-selected="false">Second</button></nav>
        <div class="tab-content"><section id="first" class="tab-pane fade show active" role="tabpanel" aria-labelledby="first-tab">First</section><section id="second" class="tab-pane fade" role="tabpanel" aria-labelledby="second-tab">Second</section></div>
      </main>
    </body></html>
  `);
  await page.addStyleTag({ path: cssPath });
  await page.addScriptTag({ path: bootstrapPath });
}

test('Bootstrap overlay focus and Escape behavior work @a11y', async ({ page }) => {
  await loadFixture(page);
  await page.locator('#open').click();
  await expect(page.locator('#dialog')).toHaveClass(/show/);
  await expect(page.locator('#dialog')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialog')).not.toHaveClass(/show/);
  await expect(page.locator('#open')).toBeFocused();
});

test('core Bootstrap fixture has no serious axe violations @a11y', async ({ page }) => {
  await loadFixture(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))).toEqual([]);
});

for (const adminPage of ['index.html', 'mailbox.html', 'errors.html', 'modals.html', 'cdn-starter.html']) {
  test(`admin panel ${adminPage} has no serious axe violations @a11y`, async ({ page }) => {
    await page.route('https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js', (route) => route.fulfill({ path: bootstrapPath }));
    await page.goto(`file://${path.join(adminPanelDir, adminPage).replace(/\\/g, '/')}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))).toEqual([]);
  });
}
