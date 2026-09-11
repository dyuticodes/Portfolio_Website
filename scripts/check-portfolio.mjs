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
  await page.screenshot({ path: `${output}/initial.png` });
  await page.getByRole('button', { name: 'Say hello ↗', exact: true }).waitFor();
  await page.screenshot({ path: `${output}/desktop.png` });
  assert.equal(await page.locator('.project-card').count(), 6);
  assert.equal(await page.locator('.leadership-card').count(), 4);
  assert.equal(await page.locator('a[aria-label="LinkedIn"]').getAttribute('href'), 'https://www.linkedin.com/in/dyuti-ghosh/');
  assert.equal((await page.request.get(new URL('/resume.pdf', page.url()).href)).status(), 200);
  assert.ok(await page.locator('.nav-links').evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 17));
  await page.locator('.robot-stage').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Home');
  await page.mouse.move(1200, 240);
  await page.getByRole('button', { name: 'Say hello ↗', exact: true }).click();
  await page.getByRole('button', { name: 'Hello there!', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Say hello ↗', exact: true }).waitFor();
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
    if (width <= 1000) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false');
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => window.scrollY === 0);
    await page.waitForTimeout(400); // Allow ResizeObserver, IntersectionObserver, and a rendered WebGL frame.
    await page.screenshot({ path: `${output}/viewport-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${output}/mobile-experience.png` });
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${output}/mobile-projects.png` });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('YOUR ENGINEERING COMPANION').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Say hello ↗', exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  console.log('Passed: WebGL robot loads, wave completes, navigation works, résumé downloads, content renders, no horizontal overflow, reduced motion respected, no browser exceptions.');
} catch (error) { await page.screenshot({ path: `${output}/failure.png` }); console.error('Browser exceptions:', errors); throw error; } finally { await browser.close(); }
