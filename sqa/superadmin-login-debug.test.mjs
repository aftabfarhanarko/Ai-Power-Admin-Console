/**
 * SquadCart Console SQA — Superadmin Login Debug Test (Enhanced V2)
 * File: sqa/superadmin-login-debug.test.mjs
 */

import { Builder, By, until } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome.js';
import { results, pass, fail, section } from './lib/reporter.mjs';
import http from 'http';

const CONSOLE_URL = process.env.SQA_CONSOLE_URL ?? 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000/api';
const TIMEOUT = 20_000;

async function waitForBackend() {
  console.log(`Checking backend at ${BACKEND_URL}/health...`);
  for (let i = 0; i < 10; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`${BACKEND_URL}/health`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.end();
      });
      console.log('Backend is UP');
      return true;
    } catch (e) {
      console.log(`Backend not ready (attempt ${i+1}): ${e.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return false;
}

// BUILD DRIVER
const chromeOptions = new Chrome.Options()
  .addArguments('--headless=new')
  .addArguments('--no-sandbox')
  .addArguments('--disable-dev-shm-usage')
  .addArguments('--disable-gpu')
  .addArguments('--window-size=1400,900')
  .setLoggingPrefs({ browser: 'ALL' });

let driver;

section('Superadmin Login Debug — Enhanced V2');

try {
  if (!(await waitForBackend())) {
    throw new Error('Backend did not become ready in time');
  }

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  async function go(url) { await driver.get(url); }
  async function find(css, timeout = TIMEOUT) { return driver.wait(until.elementLocated(By.css(css)), timeout); }
  async function url()   { return driver.getCurrentUrl(); }
  async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  await go(CONSOLE_URL + '/login');
  await sleep(4000);
  
  const emailInput = await find('input[type="email"]');
  const passwordInput = await find('input[type="password"]');
  const submitBtn = await find('button[type="submit"]');

  await emailInput.sendKeys('admin@squadcart.app');
  await passwordInput.sendKeys('123456');
  
  console.log('Clicking login...');
  await submitBtn.click();
  
  // Wait for potential navigation or toast
  await sleep(10000);
  
  const currentUrl = await url();
  console.log('Current URL after login attempt:', currentUrl);

  // Check storage
  const storage = await driver.executeScript(() => {
    return {
      session: { ...sessionStorage },
      local: { ...localStorage },
      html: document.body.innerText.substring(0, 500)
    };
  });
  
  console.log('--- Storage Analytics ---');
  console.log('Superadmin Access Token in Session:', storage.session.superadmin_accessToken ? 'FOUND (Length: ' + storage.session.superadmin_accessToken.length + ')' : 'MISSING');
  console.log('Merchant Access Token in Local:', storage.local.accessToken ? 'FOUND (Length: ' + storage.local.accessToken.length + ')' : 'MISSING');
  console.log('-------------------------');

  // Check for any toast messages
  try {
    const toasts = await driver.findElements(By.css('[role="status"], .hot-toast, div[class*="toast"]'));
    console.log(`Found ${toasts.length} potential toast elements`);
    for (const toast of toasts) {
       const text = await toast.getText();
       console.log('Toast Text:', text);
    }
  } catch (e) {
    console.log('Error checking toasts:', e.message);
  }

  if (currentUrl.includes('/superadmin')) {
    pass('Successfully logged in and reached superadmin panel', currentUrl);
  } else {
    fail('Login failed to reach superadmin panel', currentUrl);
    console.log('Page body snippet:', storage.html);
  }

  // Capture ALL console logs
  const logs = await driver.manage().logs().get('browser');
  console.log('--- Detailed Browser Console Logs ---');
  logs.forEach(log => {
    console.log(`[${log.level.name}] ${log.message}`);
  });
  console.log('------------------------------------');

} catch (err) {
  fail('Debug test encountered an error', err.message);
} finally {
  if (driver) await driver.quit();
}

export default results;
