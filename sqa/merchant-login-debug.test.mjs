import { Builder, By, until } from "selenium-webdriver";
import Chrome from "selenium-webdriver/chrome.js";

const CONSOLE_URL =
  process.env.SQA_CONSOLE_URL ??
  "https://squadcart-console-production.up.railway.app";
const TIMEOUT = 20000;

const chromeOptions = new Chrome.Options()
  .addArguments("--headless=new")
  .addArguments("--no-sandbox")
  .addArguments("--disable-dev-shm-usage")
  .addArguments("--disable-gpu")
  .addArguments("--window-size=1440,960")
  .setLoggingPrefs({ browser: "ALL" });

let driver;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

try {
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();

  await driver.get(`${CONSOLE_URL}/login`);

  await driver.executeScript(() => {
    window.__debugFetchLogs = [];

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const entry = {
        kind: "fetch",
        url:
          typeof resource === "string"
            ? resource
            : resource?.url || String(resource),
        method: config?.method || "GET",
        body: config?.body || null,
      };

      try {
        const response = await originalFetch(...args);
        const clone = response.clone();
        let responseBody = "";

        try {
          responseBody = await clone.text();
        } catch (error) {
          responseBody = `[[unreadable: ${error?.message || "unknown"}]]`;
        }

        window.__debugFetchLogs.push({
          ...entry,
          status: response.status,
          ok: response.ok,
          responseBody: responseBody.slice(0, 500),
        });

        return response;
      } catch (error) {
        window.__debugFetchLogs.push({
          ...entry,
          error: error?.message || String(error),
        });
        throw error;
      }
    };
  });

  const emailInput = await driver.wait(
    until.elementLocated(By.css('input[type="email"]')),
    TIMEOUT
  );
  const passwordInput = await driver.wait(
    until.elementLocated(By.css('input[type="password"]')),
    TIMEOUT
  );
  const submitButton = await driver.wait(
    until.elementLocated(By.css('button[type="submit"]')),
    TIMEOUT
  );

  await emailInput.clear();
  await emailInput.sendKeys("merchant@squadcart.app");
  await passwordInput.clear();
  await passwordInput.sendKeys("123456");
  await submitButton.click();

  await sleep(5000);

  const currentUrl = await driver.getCurrentUrl();
  const pageText = await driver.findElement(By.css("body")).getText();
  const fetchLogs = await driver.executeScript(() => window.__debugFetchLogs);
  const storage = await driver.executeScript(() => ({
    localStorage: { ...window.localStorage },
    sessionStorage: { ...window.sessionStorage },
  }));
  const browserLogs = await driver.manage().logs().get("browser");

  console.log(
    JSON.stringify(
      {
        currentUrl,
        pageText: pageText.slice(0, 1000),
        fetchLogs,
        storage: {
          localKeys: Object.keys(storage.localStorage || {}),
          sessionKeys: Object.keys(storage.sessionStorage || {}),
        },
        browserLogs: browserLogs.map((log) => ({
          level: log.level.name,
          message: log.message,
        })),
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (driver) {
    await driver.quit();
  }
}
