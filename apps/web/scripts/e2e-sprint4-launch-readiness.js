import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\4e89b905-e448-4a87-b279-015523cc16c3';

async function runSprint4LaunchReadinessE2E() {
  console.log('--- STARTING PLAYWRIGHT SPRINT 4 LAUNCH READINESS E2E ---');
  console.log('Executable:', CHROME_PATH);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });

  const page = await context.newPage();
  const testResults = [];

  function record(name, status, details = '') {
    testResults.push({ name, status, details });
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
  }

  try {
    // 1. Verify Homepage & Navigation
    console.log('\n--- Step 1: Homepage & Footer Navigation ---');
    await page.goto('http://localhost:3000', { waitUntil: 'load' });
    await page.waitForSelector('footer a[href="/privacy"]', { timeout: 10000 });
    const homeTitle = await page.title();
    const footerPrivacyLink = await page.locator('footer a[href="/privacy"]').isVisible();
    const footerTermsLink = await page.locator('footer a[href="/terms"]').isVisible();
    const footerPracticeLink = await page.locator('footer a[href="/practice"]').isVisible();

    if (homeTitle.includes('Typing Typhon') && footerPrivacyLink && footerTermsLink && footerPracticeLink) {
      record('1. Homepage & Footer Links', 'PASSED', `Title: "${homeTitle}", all footer Next.js links present`);
    } else {
      record('1. Homepage & Footer Links', 'FAILED', `homeTitle="${homeTitle}", links present: ${footerPrivacyLink}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_01_homepage.png') });

    // 2. Verify /practice Landing Page & Live Typing Test
    console.log('\n--- Step 2: /practice Interactive Landing Page ---');
    await page.goto('http://localhost:3000/practice', { waitUntil: 'load' });
    await page.waitForSelector('.typing-canvas', { timeout: 10000 });
    const practiceTitle = await page.title();
    const practiceHeading = await page.locator('h1:has-text("Free Online Typing Speed Test")').isVisible();
    const practiceDuration15s = await page.locator('button:has-text("15s")').isVisible();

    if (practiceTitle.includes('Typing Speed Test') && practiceHeading && practiceDuration15s) {
      record('2. /practice Page Load & Structure', 'PASSED', `Title: "${practiceTitle}", H1 and duration pills rendered`);
    } else {
      record('2. /practice Page Load & Structure', 'FAILED', `practiceTitle="${practiceTitle}"`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_02_practice_landing.png') });

    // 3. Take a 15s live test on /practice
    console.log('\n--- Step 3: Execute Live Typing Test on /practice ---');
    await page.click('button:has-text("15s")');
    await page.waitForFunction(() => {
      const el = document.getElementById('hud-timer-value');
      return el && el.innerText.trim() === '15';
    }, { timeout: 5000 });
    console.log('15s timer HUD confirmed.');

    // Ensure hidden input is focused
    await page.locator('#canvas-hidden-input').focus();
    await page.waitForTimeout(200);

    // Get the first word
    const firstWordElem = page.locator('#typing-word-container [id^="word-"]').first();
    const firstWordText = await firstWordElem.innerText();
    console.log('First word to type:', JSON.stringify(firstWordText));

    // Type first character and assert it registered
    await page.keyboard.type(firstWordText[0]);
    await page.waitForFunction(() => {
      const el = document.getElementById('char-0-0');
      return el && el.className.includes('char-correct');
    }, { timeout: 5000 });
    console.log('First character successfully typed and registered.');

    // Type rest of first word and space
    for (let c = 1; c < firstWordText.length; c++) {
      await page.keyboard.type(firstWordText[c]);
      await page.waitForTimeout(30);
    }
    await page.keyboard.press('Space');

    // Type a second word to add more keystrokes
    const secondWordElem = page.locator('#typing-word-container [id^="word-"]').nth(1);
    const secondWordText = await secondWordElem.innerText();
    console.log('Second word to type:', JSON.stringify(secondWordText));
    for (let c = 0; c < secondWordText.length; c++) {
      await page.keyboard.type(secondWordText[c]);
      await page.waitForTimeout(30);
    }
    await page.keyboard.press('Space');

    // Wait for the 15s timer to expire and the result banner to appear
    console.log('Waiting for 15s test timer to expire...');
    await page.waitForSelector('text=Test Completed', { timeout: 22000 });

    const completionText = await page.locator('text=Test Completed').isVisible();
    const resultStatsText = await page.locator('text=Speed:').innerText();

    if (completionText) {
      record('3. Interactive Test Completion on /practice', 'PASSED', `Result banner: "${resultStatsText}"`);
    } else {
      record('3. Interactive Test Completion on /practice', 'FAILED', 'Completion banner not visible');
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_03_practice_completed.png') });

    // 4. Verify /lessons Curriculum Landing Page
    console.log('\n--- Step 4: /lessons Curriculum Page ---');
    await page.goto('http://localhost:3000/lessons', { waitUntil: 'networkidle' });
    const lessonsTitle = await page.title();
    const stage1Card = await page.locator('text=Home Row Mastery').isVisible();
    const fingerGuide = await page.locator('text=Standard QWERTY Finger Alignment').isVisible();

    if (lessonsTitle.includes('Touch Typing Lessons') && stage1Card && fingerGuide) {
      record('4. /lessons Curriculum Page', 'PASSED', `Title: "${lessonsTitle}", Stage 1 card & Finger Guide visible`);
    } else {
      record('4. /lessons Curriculum Page', 'FAILED', `lessonsTitle="${lessonsTitle}"`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_04_lessons_landing.png') });

    // 5. Verify /accuracy Landing Page
    console.log('\n--- Step 5: /accuracy Landing Page ---');
    await page.goto('http://localhost:3000/accuracy', { waitUntil: 'networkidle' });
    const accuracyTitle = await page.title();
    const triplePenaltyCard = await page.locator('text=The Triple Penalty of a Single Typo').isVisible();
    const goldenRuleCard = await page.locator('text=Why 98% is the Golden Rule').isVisible();

    if (accuracyTitle.includes('Typing Accuracy') && triplePenaltyCard && goldenRuleCard) {
      record('5. /accuracy Landing Page', 'PASSED', `Title: "${accuracyTitle}", penalty breakdown & 98% rule visible`);
    } else {
      record('5. /accuracy Landing Page', 'FAILED', `accuracyTitle="${accuracyTitle}"`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_05_accuracy_landing.png') });

    // 6. Verify /privacy Policy Page
    console.log('\n--- Step 6: /privacy Policy Page ---');
    await page.goto('http://localhost:3000/privacy', { waitUntil: 'networkidle' });
    const privacyTitle = await page.title();
    const noKeystrokeText = await page.locator('text=We do not record, transmit, or log the raw text you type').isVisible();
    const zeroWallText = await page.locator('text=zero mandatory registration').isVisible();

    if (privacyTitle.includes('Privacy Policy') && noKeystrokeText && zeroWallText) {
      record('6. /privacy Policy Disclosures', 'PASSED', 'Zero keystroke tracking & zero registration disclosures verified');
    } else {
      record('6. /privacy Policy Disclosures', 'FAILED', `privacyTitle="${privacyTitle}"`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_06_privacy_page.png') });

    // 7. Verify /terms of Service Page
    console.log('\n--- Step 7: /terms Page ---');
    await page.goto('http://localhost:3000/terms', { waitUntil: 'networkidle' });
    const termsTitle = await page.title();
    const termsHeading = await page.locator('h1:has-text("Terms of Service")').isVisible();

    if (termsTitle.includes('Terms of Service') && termsHeading) {
      record('7. /terms Terms of Service', 'PASSED', `Title: "${termsTitle}", H1 verified`);
    } else {
      record('7. /terms Terms of Service', 'FAILED', `termsTitle="${termsTitle}"`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_07_terms_page.png') });

    // 8. Verify Custom 404 Not Found Page
    console.log('\n--- Step 8: Custom 404 Page ---');
    const response = await page.goto('http://localhost:3000/this-page-does-not-exist-at-all', { waitUntil: 'networkidle' });
    const notFoundHeading = await page.locator('h1:has-text("Page Not Found")').isVisible();
    const notFound404 = await page.locator('main').getByText('404', { exact: true }).isVisible();
    const backHomeBtn = await page.locator('a:has-text("Instant 60s Typing Test")').isVisible();

    if (notFoundHeading && notFound404 && backHomeBtn) {
      record('8. Custom 404 Not Found Handling', 'PASSED', `Status: ${response.status()}, 404 card and return links rendered`);
    } else {
      record('8. Custom 404 Not Found Handling', 'FAILED', `Heading=${notFoundHeading}, 404=${notFound404}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_08_not_found_page.png') });

    // 9. Mobile Responsiveness Test (375px viewport on /practice)
    console.log('\n--- Step 9: Mobile Viewport 375px ---');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/practice', { waitUntil: 'networkidle' });

    // Check for horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (!hasHorizontalOverflow) {
      record('9. Mobile Viewport (375x667)', 'PASSED', 'Zero horizontal scroll overflow on 375px viewport');
    } else {
      record('9. Mobile Viewport (375x667)', 'FAILED', 'Horizontal overflow detected');
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint4_09_mobile_375px.png') });

  } catch (err) {
    console.error('Test execution error:', err);
    record('FATAL_ERROR', 'FAILED', err.message);
  } finally {
    await browser.close();
  }

  // Save JSON report
  const reportPath = path.join(ARTIFACT_DIR, 'sprint4_launch_readiness_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\nResults written to: ${reportPath}`);
}

runSprint4LaunchReadinessE2E();
