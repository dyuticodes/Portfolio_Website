import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const output = '.test-output';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:3001', { waitUntil: 'networkidle' });
  await page.locator('.robot-stage[data-ready="true"] canvas').waitFor();
  assert.equal(await page.locator('.robot-fallback').count(), 0, 'Never show a different robot while loading');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.wordmark').innerText(), 'Dyuti Shraboni Ghosh');
  assert.equal(await page.locator('.project-card').count(), 6);
  assert.equal(await page.locator('.leadership-card').count(), 4);
  assert.equal(await page.locator('.award-card').count(), 4);
  assert.equal(await page.locator('.robot-controls').count(), 0);
  assert.equal(await page.getByRole('button', { name: /Say hello/ }).count(), 0);
  assert.equal((await page.request.get(new URL('/resume.pdf', page.url()).href)).status(), 200);
  await page.screenshot({ path: `${output}/desktop.png` });
  await page.waitForTimeout(900);
  const stillFrame = await page.locator('.robot-stage').screenshot();
  await page.waitForTimeout(400);
  assert.ok(stillFrame.equals(await page.locator('.robot-stage').screenshot()), 'Robot must remain perfectly still at rest');
  await page.mouse.move(1000, 45);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/robot-look-up.png` });
  await page.mouse.move(1000, 790);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/robot-look-down.png` });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  for (const width of [360, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${output}/viewport-${width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const section of ['leadership', 'awards', 'projects', 'contact']) {
    await page.locator(`#${section}`).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${output}/desktop-${section}.png` });
  }
  const technology = page.locator('.project-card details').first();
  await technology.locator('summary').click();
  assert.equal(await technology.evaluate(el => el.open), false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.robot-stage').getAttribute('tabindex'), '-1');
  assert.deepEqual(errors, []);
  console.log('Passed: full-name branding, robot controls removed, WebGL render, responsive layouts, navigation, résumé download, project details, reduced motion, and no browser exceptions.');
} catch (error) { await page.screenshot({ path: `${output}/failure.png` }); console.error(errors); throw error; } finally { await browser.close(); }
