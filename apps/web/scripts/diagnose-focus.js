import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', res => { if (!res.ok()) console.log('NON-OK RES:', res.url(), res.status()); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  console.log('1. Page loaded');
  let active = await page.evaluate(() => document.activeElement ? document.activeElement.outerHTML : 'none');
  console.log('Active element on load:', active.substring(0, 100));

  console.log('2. Clicking #typing-word-container');
  await page.click('#typing-word-container');
  await page.waitForTimeout(100);

  active = await page.evaluate(() => document.activeElement ? document.activeElement.outerHTML : 'none');
  console.log('Active element after container click:', active.substring(0, 100));

  console.log('3. Typing "t" via page.keyboard.type');
  await page.keyboard.type('t');
  await page.waitForTimeout(300);

  const char00 = await page.evaluate(() => {
    const el = document.getElementById('char-0-0');
    return el ? { class: el.className, text: el.innerText, html: el.outerHTML } : null;
  });
  console.log('char-0-0 state after typing:', char00);

  const status = await page.evaluate(() => {
    const timer = document.getElementById('hud-timer-value');
    return timer ? timer.innerText : 'null';
  });
  console.log('Timer value:', status);

  await browser.close();
}

diagnose();
