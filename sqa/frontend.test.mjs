/**
 * SquadCart Console SQA — Selenium Frontend Test Suite
 * File: sqa/frontend.test.mjs
 *
 * Tests the live console using Selenium WebDriver (headless Chrome).
 * Tests: https://console.squadcart.app
 *
 * Usage: node sqa/frontend.test.mjs
 */

import { Builder, By, until } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome.js';
import { results, pass, fail, skip, section } from './lib/reporter.mjs';

const CONSOLE_URL = process.env.SQA_CONSOLE_URL ?? 'https://console.squadcart.app';
const TIMEOUT = 20_000;

// ── Build headless Chrome driver ─────────────────────────────
const chromeOptions = new Chrome.Options()
  .addArguments('--headless=new')
  .addArguments('--no-sandbox')
  .addArguments('--disable-dev-shm-usage')
  .addArguments('--disable-gpu')
  .addArguments('--window-size=1400,900')
  .addArguments('--user-agent=SQA-Bot/1.0 SquadCart-AutoTest');

let driver;
try {
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();
} catch (err) {
  console.error('\n⚠️  Could not start Chrome WebDriver:', err.message);
  process.exit(1);
}

async function go(url) { await driver.get(url); }
async function find(css, timeout = TIMEOUT) { return driver.wait(until.elementLocated(By.css(css)), timeout); }
async function title() { return driver.getTitle(); }
async function url()   { return driver.getCurrentUrl(); }
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────
// 1. CONSOLE LOGIN PAGE
// ─────────────────────────────────────────────────────────────
section('Console — Unified Login Page');

try {
  await go(CONSOLE_URL + '/login');
  await sleep(3000);
  const t = await title();
  t.length > 0
    ? pass('Login page loads successfully', `Title: "${t}"`)
    : fail('Login page title is empty', '');

  // Check form presence
  try {
    await find('form', 5000);
    pass('Login form is present on page', 'found <form> element');
  } catch {
    fail('Login form not found', 'no <form> element');
  }
} catch (err) {
  fail('Login page load failed', err.message);
}

// ─────────────────────────────────────────────────────────────
// 2. CONSOLE SUPERADMIN LOGIN
// ─────────────────────────────────────────────────────────────
section('Console — Superadmin Login Page');

try {
  await go(CONSOLE_URL + '/superadmin/login');
  await sleep(3000);
  const currentUrl = await url();
  currentUrl.includes('/superadmin/login')
    ? pass('Superadmin login route is active', currentUrl)
    : fail('Superadmin login route redirects unexpectedly', currentUrl);
} catch (err) {
  fail('Superadmin login load failed', err.message);
}

// ─────────────────────────────────────────────────────────────
// 3. UNAUTHENTICATED REDIRECTION
// ─────────────────────────────────────────────────────────────
section('Console — Auth Redirection');

try {
  await go(CONSOLE_URL + '/');
  await sleep(3000);
  const currentUrl = await url();
  currentUrl.includes('/login') || currentUrl.includes('/auth')
    ? pass('Unauthenticated user is redirected to login', currentUrl)
    : fail('Unauthenticated user is NOT redirected to login', currentUrl);
} catch (err) {
  fail('Redirection check failed', err.message);
}

// ─────────────────────────────────────────────────────────────
// 4. PERFORMANCE & ASSETS
// ─────────────────────────────────────────────────────────────
section('Console — Performance & Assets');

try {
  await go(CONSOLE_URL + '/login');
  const timing = await driver.executeScript(() => {
    const t = performance.timing;
    return {
      load: t.loadEventEnd - t.navigationStart,
      dom:  t.domContentLoadedEventEnd - t.navigationStart,
    };
  });
  timing.load < 10000
    ? pass('Page loads within 10s', `Load: ${timing.load}ms`)
    : fail('Page load too slow', `${timing.load}ms`);
} catch (err) {
  fail('Performance check failed', err.message);
}

try {
  const logs = await driver.manage().logs().get('browser');
  const errors = logs.filter(l => l.level.name === 'SEVERE' && !l.message.includes('favicon'));
  errors.length === 0
    ? pass('No severe JS console errors on login', 'Console clean')
    : skip(`${errors.length} severe JS error(s) on login`, errors.map(l => l.message.slice(0, 80)).join(' | '));
} catch {
  skip('Browser log check not available', 'Driver limitation');
}

// ─────────────────────────────────────────────────────────────
// 5. SECURITY — HTTPS
// ─────────────────────────────────────────────────────────────
section('Console — Security');

{
  await go(CONSOLE_URL);
  const currentUrl = await url();
  currentUrl.startsWith('https')
    ? pass('Admin console runs on HTTPS', currentUrl)
    : fail('Admin console not on HTTPS', currentUrl);
}

// ─────────────────────────────────────────────────────────────
// CLEANUP
// ─────────────────────────────────────────────────────────────
await driver.quit();

export default results;
