import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 const response = await page.goto('http://localhost:3002');
 const html = await response.text();
 assert.ok(html.includes('<spline-viewer'), 'Scene element is present before hydration');
 assert.ok(html.includes('rel="preload"') && html.includes('as="fetch"'), 'Scene download is preloaded');
 assert.equal(await page.locator('.robot-stage').evaluate(el=>getComputedStyle(el).opacity), '1');
 const wheelCancelled = await page.evaluate(()=>!window.dispatchEvent(new WheelEvent('wheel',{deltaY:80,cancelable:true})));
 assert.equal(wheelCancelled,false,'Scrolling must not be intercepted');
 await page.locator('spline-viewer').waitFor({ timeout: 60000 });
 assert.equal(await page.locator('.hero-copy').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await page.locator('spline-viewer').getAttribute('events-target'), 'global');
 assert.equal(await page.locator('spline-viewer').getAttribute('background'), '#f2f5f9');
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
  assert.ok(Math.abs(hero.width-stage.width)<2 && Math.abs(hero.height-stage.height-(width<=760?440:0))<2);
  assert.equal(await page.locator('.hero-copy').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.setViewportSize({width:1440,height:1000});
 assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollSnapType),'none');
 assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');
 const transform = await page.locator('spline-viewer').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41);
 assert.ok(transform > 100, 'Robot scene is shifted right on desktop');
 await page.mouse.move(100,500);
 await page.mouse.wheel(0,900);
 await page.waitForTimeout(1600);
 const aboutTop = await page.locator('#about').evaluate(el=>el.getBoundingClientRect().top);
 assert.ok(Math.abs(await page.evaluate(()=>scrollY)-900)<5, 'Scroll follows the wheel distance without snapping');
 await page.screenshot({path:'.test-output/swipe-about.png'});
 await page.mouse.wheel(0,-900);
 await page.waitForTimeout(900);
 assert.ok(await page.evaluate(()=>scrollY < 3), 'Upward gesture returns to hero');
 await page.locator('.wordmark').click();
 await page.waitForTimeout(1200);
 await page.screenshot({path:'.test-output/hero-refined.png'});
 assert.equal(await page.locator('.project-card').count(),5);
 assert.equal(await page.locator('a[href="https://github.com/dyuticodes/WDAC-2026"]').count(),1);
 assert.equal(await page.locator('a[href="https://github.com/dyuticodes"]').count(),3);
 for (const width of [1440, 390]) {
  await page.setViewportSize({width,height:1000});
  for (const id of ['about','experience','projects','leadership','awards','contact']) {
   await page.locator('#'+id).scrollIntoViewIfNeeded();
   await page.waitForTimeout(400);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${id} fits at ${width}`);
   await page.locator('#'+id).screenshot({path:`.test-output/${id}-${width}.png`});
  }
 }
 const contrastPairs = [
  ['.about-body .lead','#ffffff'], ['.skill-grid p','#e5ebf3'],
  ['.experience-card>p','#ffffff'], ['.leadership-card>p','#ffffff'],
  ['.project-copy>p','#203651'], ['.project-category','#203651'],
  ['.project-tags span','#475e7b'], ['.contact-item span','#14263f'],
  ['.award-card p','#ffffff'], ['.date-badge','#e5ebf3']
 ];
 const luminance = rgb => rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 for(const [selector,bg] of contrastPairs){
  const color = await page.locator(selector).first().evaluate(el=>getComputedStyle(el).color);
  const foreground = luminance(color.match(/[\d.]+/g).slice(0,3).map(Number));
  const background = luminance(bg.slice(1).match(/../g).map(v=>parseInt(v,16)));
  const ratio = (Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);
  assert.ok(ratio>=4.5, `${selector} contrast ${ratio}`);
 }
 await page.setViewportSize({width:1440,height:1000});
 assert.equal(await page.locator('.nav-links').evaluate(el=>getComputedStyle(el).fontWeight),'600');
 assert.equal(await page.locator('.nav-links').evaluate(el=>getComputedStyle(el).fontSize),'16px');
 await page.locator('.wordmark').click();
 await page.locator('spline-viewer').locator('canvas').waitFor({state:'attached',timeout:60000});
 assert.equal(await page.locator('.robot-visual').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.waitForTimeout(2000);
 await page.screenshot({path:'.test-output/robot-visible.png'});
 console.log('Passed: full-hero scene bounds on desktop/mobile, global events, pointer pass-through, project and GitHub links.');
} finally { await browser.close(); }
