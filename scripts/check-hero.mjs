import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 await page.goto('http://localhost:3002');
 await page.locator('spline-viewer').waitFor({ timeout: 60000 });
 assert.equal(await page.locator('spline-viewer').getAttribute('events-target'), 'global');
 assert.equal(await page.locator('spline-viewer').getAttribute('background'), '#e9e9e8');
 await page.locator('a[href="#contact"]').first().click();
 await page.waitForTimeout(1200);
 await page.reload();
 await page.waitForTimeout(1500);
 assert.equal(await page.evaluate(()=>location.hash), '');
 assert.ok(await page.evaluate(()=>scrollY < 3), 'Reload from Contact must open on the hero');
 await page.locator('spline-viewer').waitFor({timeout:60000});
 for (const width of [1440, 390]) {
  await page.setViewportSize({width,height:1000});
  const hero = await page.locator('.hero').boundingBox();
  const stage = await page.locator('.robot-stage').boundingBox();
  assert.ok(Math.abs(hero.width-stage.width)<2 && Math.abs(hero.height-stage.height)<2);
  assert.equal(await page.locator('.hero-copy').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.setViewportSize({width:1440,height:1000});
 assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollSnapType),'y mandatory');
 const transform = await page.locator('spline-viewer').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41);
 assert.ok(transform > 100, 'Robot scene is shifted right on desktop');
 await page.mouse.move(100,500);
 await page.mouse.wheel(0,900);
 await page.waitForTimeout(1600);
 const aboutTop = await page.locator('#about').evaluate(el=>el.getBoundingClientRect().top);
 assert.ok(Math.abs(aboutTop-92)<3, `Swipe should settle at About: ${aboutTop}`);
 await page.screenshot({path:'.test-output/swipe-about.png'});
 await page.locator('.wordmark').click();
 await page.waitForTimeout(1200);
 await page.screenshot({path:'.test-output/hero-refined.png'});
 assert.equal(await page.locator('.project-card').count(),7);
 assert.equal(await page.locator('a[href="https://github.com/dyuticodes/WDAC-2026"]').count(),1);
 assert.equal(await page.locator('a[href="https://github.com/dyuticodes"]').count(),2);
 console.log('Passed: full-hero scene bounds on desktop/mobile, global events, pointer pass-through, project and GitHub links.');
} finally { await browser.close(); }
