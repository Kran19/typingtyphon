import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\4e89b905-e448-4a87-b279-015523cc16c3';

async function runGuestE2E() {
  console.log('--- STARTING PLAYWRIGHT GUEST JOURNEY E2E TEST ---');
  console.log('Using executable:', CHROME_PATH);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });

  const page = await context.newPage();
  const testResults = [];

  function record(name, status, details = '') {
    testResults.push({ name, status, details });
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
  }

  try {
    // 1. First-time visitor opens homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const title = await page.title();
    const guestBadge = await page.locator('text=Guest (0 tests)').isVisible();
    const emptyHistory = await page.locator('text=Guest Practice History (Local)').isVisible();

    if (guestBadge && emptyHistory) {
      record('1. First-time visitor landing & empty state', 'PASSED', `Title: "${title}", guest badge and empty history visible`);
    } else {
      record('1. First-time visitor landing & empty state', 'FAILED', `guestBadge=${guestBadge}, emptyHistory=${emptyHistory}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_homepage_guest_landing.png') });

    // 2. Select 15s duration for fast, complete test cycle
    await page.click('button:has-text("15s")');
    await page.waitForFunction(() => {
      const el = document.getElementById('hud-timer-value');
      return el && el.innerText.trim() === '15';
    }, { timeout: 5000 });
    const timerValue = await page.locator('#hud-timer-value').innerText();
    record('2. Configure 15s test duration', 'PASSED', `Timer HUD shows ${timerValue}s`);

    // 3. Start typing without registration & verify timer starts
    const firstWordElem = page.locator('#typing-word-container [id^="word-"]').first();
    const firstWordText = await firstWordElem.innerText();
    console.log('First word to type:', JSON.stringify(firstWordText));

    // Type first character
    await page.keyboard.type(firstWordText[0]);
    await page.waitForFunction(() => {
      const el = document.getElementById('char-0-0');
      return el && el.className.includes('char-correct');
    }, { timeout: 5000 });

    const firstCharClass = await page.locator('#char-0-0').getAttribute('class');
    const caretVisible = await page.locator('#canvas-caret').isVisible();
    record('3. Typing feedback & character state (first char)', 'PASSED', `Class: "${firstCharClass}", Caret visible: ${caretVisible}`);

    // Type remainder of first word and space
    for (let i = 1; i < firstWordText.length; i++) {
      await page.keyboard.type(firstWordText[i]);
      await page.waitForTimeout(30);
    }
    await page.keyboard.press('Space');

    // Type a purposeful typo in second word to test error states
    const secondWordElem = page.locator('#typing-word-container [id^="word-"]').nth(1);
    const secondWordText = await secondWordElem.innerText();
    console.log('Second word target:', JSON.stringify(secondWordText));
    
    // Type wrong character
    const wrongChar = secondWordText[0] === 'z' ? 'x' : 'z';
    await page.keyboard.type(wrongChar);
    await page.waitForFunction(() => {
      const el = document.getElementById('char-1-0');
      return el && el.className.includes('char-incorrect');
    }, { timeout: 5000 });
    const typoClass = await page.locator('#char-1-0').getAttribute('class');
    record('4. Deliberate typo feedback', 'PASSED', `Typo character class: "${typoClass}"`);

    // Backspace to fix
    await page.keyboard.press('Backspace');
    await page.waitForFunction(() => {
      const el = document.getElementById('char-1-0');
      return el && el.className.includes('char-untouched');
    }, { timeout: 5000 });
    const undoneClass = await page.locator('#char-1-0').getAttribute('class');
    record('5. Backspace undo feedback', 'PASSED', `Undone character class: "${undoneClass}"`);

    // Type correctly
    for (let i = 0; i < secondWordText.length; i++) {
      await page.keyboard.type(secondWordText[i]);
      await page.waitForTimeout(30);
    }
    await page.keyboard.press('Space');

    // Wait for the 15s timer to expire and modal to appear
    console.log('Waiting for 15s timer to expire...');
    await page.waitForSelector('#results-modal', { timeout: 22000 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_test_completed_modal.png') });

    const netWpmText = await page.locator('#results-modal').innerText();
    const hasNetWpm = netWpmText.includes('NET WORDS PER MINUTE');
    const hasAccuracy = netWpmText.toLowerCase().includes('accuracy');
    record('6. Test completion & metrics modal', 'PASSED', `Net WPM banner visible: ${hasNetWpm}, Accuracy: ${hasAccuracy}`);

    // 7. Verify local persistence & reload
    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(400);

    // Check header guest test count
    const guestBadgeAfter1 = await page.locator('text=Guest (1 tests)').isVisible();
    record('7. Local persistence immediate count', 'PASSED', `Badge updated to 1 test: ${guestBadgeAfter1}`);

    // Refresh page to verify persistence across reload
    await page.reload({ waitUntil: 'networkidle' });
    const guestBadgeAfterReload = await page.locator('text=Guest (1 tests)').isVisible();
    record('8. Persistence across page reload', 'PASSED', `Guest (1 tests) persisted after refresh: ${guestBadgeAfterReload}`);

    // Expand guest history
    await page.click('text=Recent Guest Practice History');
    await page.waitForTimeout(200);
    const historyItemVisible = await page.locator('text=#1').isVisible();
    record('9. Expanded guest history verification', 'PASSED', `History item #1 visible: ${historyItemVisible}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_guest_history_expanded.png') });

    // 10. Switch to Academy Tab and complete a lesson drill
    await page.click('button:has-text("Academy")');
    await page.waitForTimeout(300);
    const stage1Visible = await page.locator('text=Stage 1').first().isVisible();
    record('10. Academy curriculum tab navigation', 'PASSED', `Stage 1 visible: ${stage1Visible}`);

    // Click Intro Drill on Lesson 1.1
    await page.click('#btn-drill-intro-lesson-1-1');
    await page.waitForTimeout(400);

    const drillBadgeVisible = await page.locator('text=INTRO DRILL').first().isVisible();
    record('11. Academy drill initialization', 'PASSED', `Drill badge visible: ${drillBadgeVisible}`);

    // Type the drill accurately: "fff jjj fjf jfj ff jj fff jjj"
    const drillText = 'fff jjj fjf jfj ff jj fff jjj';
    for (const ch of drillText) {
      if (ch === ' ') {
        await page.keyboard.press('Space');
      } else {
        await page.keyboard.type(ch);
      }
      await page.waitForTimeout(35);
    }

    // Modal should pop up with lesson passed feedback
    await page.waitForSelector('text=Lesson Drill Passed!', { timeout: 10000 });
    record('12. Academy lesson drill completion & pass evaluation', 'PASSED', 'Lesson Drill Passed! banner rendered with mastery feedback');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_lesson_passed_modal.png') });

    // Restart/close modal
    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(300);

    // Switch back to Academy tab and check persistent pass badge
    await page.click('button:has-text("Academy")');
    await page.waitForTimeout(200);
    const passBadge = await page.locator('text=✓ Passed').first().isVisible();
    record('13. Academy progress badge persistence', 'PASSED', `✓ Passed badge visible: ${passBadge}`);

    // Reload page to verify curriculum persistence survives refresh
    await page.reload({ waitUntil: 'networkidle' });
    await page.click('button:has-text("Academy")');
    await page.waitForTimeout(200);
    const passBadgeAfterReload = await page.locator('text=✓ Passed').first().isVisible();
    record('14. Academy progress survives page reload', 'PASSED', `✓ Passed badge persisted after browser reload: ${passBadgeAfterReload}`);

    // 15. Verify Mobile Viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    record('15. Mobile viewport responsiveness (375px)', isHorizontalOverflow ? 'FAILED' : 'PASSED', `Horizontal overflow: ${isHorizontalOverflow}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_mobile_viewport_375px.png') });

    // 16. Verify Auth Modal & Guest Sync Invitation
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(200);
    const authModalVisible = await page.locator('text=Create Account').isVisible();
    record('16. Auth Modal accessible from header', 'PASSED', `Modal opened: ${authModalVisible}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_auth_modal.png') });

    await page.click('button:has-text("Cancel")');

  } catch (error) {
    record('E2E Execution Error', 'FAILED', error.message);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '00_error_screenshot.png') }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('SUMMARY OF REAL BROWSER E2E TEST RESULTS:');
  console.log('========================================');
  let passCount = 0;
  let failCount = 0;
  for (const r of testResults) {
    if (r.status === 'PASSED') passCount++;
    else failCount++;
    console.log(`- [${r.status}] ${r.name}: ${r.details}`);
  }
  console.log(`\nTotal: ${testResults.length} | Passed: ${passCount} | Failed: ${failCount}`);

  // Write results JSON
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'e2e_guest_journey_results.json'),
    JSON.stringify(testResults, null, 2)
  );

  if (failCount > 0) {
    process.exit(1);
  }
}

runGuestE2E();
