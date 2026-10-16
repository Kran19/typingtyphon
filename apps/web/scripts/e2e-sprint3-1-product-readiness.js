import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\4e89b905-e448-4a87-b279-015523cc16c3';

async function runSprint31ProductReadiness() {
  console.log('=== STARTING SPRINT 3.1 PRODUCT READINESS & CURRICULUM E2E TEST ===');
  console.log('Using executable:', CHROME_PATH);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE UNCAUGHT EXCEPTION:', err.message));

  const testResults = [];
  function record(name, status, details = '') {
    testResults.push({ name, status, details });
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
  }

  // Helper to type active words in the canvas container
  async function typeCurrentCanvasWords() {
    await page.click('#typing-word-container');
    await page.waitForTimeout(200);

    const renderedWords = await page.locator('#typing-word-container [id^="word-"]').allInnerTexts();
    for (let w = 0; w < renderedWords.length; w++) {
      const cleanWord = renderedWords[w].replace(/\s+/g, '');
      for (const ch of cleanWord) {
        await page.keyboard.type(ch);
        await page.waitForTimeout(20);
      }
      if (w < renderedWords.length - 1) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(20);
      }
    }
  }

  try {
    // 1. First-time visitor opens homepage without registering
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const wordContainer = page.locator('#typing-word-container');
    const isWordContainerVisible = await wordContainer.isVisible();
    record('1. Guest Landing Page & Instant Canvas', isWordContainerVisible ? 'PASSED' : 'FAILED', 'Typing canvas accessible immediately with zero registration');

    // 2. Open Academy and inspect Stage navigation
    const academyBtn = page.locator('button:has-text("Academy (Stages 1–6)")');
    await academyBtn.click();
    await page.waitForTimeout(400);

    const curriculumView = page.locator('#curriculum-view');
    const isCurriculumVisible = await curriculumView.isVisible();
    record('2. Academy Curriculum Loaded', isCurriculumVisible ? 'PASSED' : 'FAILED', 'Mounted 6-stage curriculum academy view');

    // 3. Verify Stage 1 Lesson 1.1 is unlocked for new guests
    const lesson1_1Card = page.locator('#card-lesson-lesson-1-1');
    const isLesson1_1Unlocked = !(await lesson1_1Card.locator('#badge-locked-lesson-1-1').isVisible());
    record('3. Lesson 1.1 Unlocked for Guest', isLesson1_1Unlocked ? 'PASSED' : 'FAILED', 'Tactile Anchor Lesson 1.1 is ready to start');

    // 4. Test locked lesson guidance on Stage 2 (Prerequisites unfulfilled)
    const stage2Btn = page.locator('#btn-stage-tab-2');
    await stage2Btn.scrollIntoViewIfNeeded();
    await stage2Btn.click();
    await page.locator('#card-lesson-lesson-2-1').waitFor({ state: 'visible', timeout: 5000 });

    const lesson2_1Card = page.locator('#card-lesson-lesson-2-1');
    const isLesson2_1Locked = await lesson2_1Card.locator('#badge-locked-lesson-2-1').isVisible();
    const hasLockedGuidance = await lesson2_1Card.locator('#locked-guidance-lesson-2-1').isVisible();

    // Click locked drill button to trigger active guidance alert
    await page.click('#btn-drill-intro-lesson-2-1');
    await page.waitForTimeout(300);
    const hasLockedAlert = await lesson2_1Card.locator('#locked-alert-lesson-2-1').isVisible();

    record(
      '4. Locked Lesson Guidance & Protection',
      (isLesson2_1Locked && hasLockedGuidance && hasLockedAlert) ? 'PASSED' : 'FAILED',
      'Locked badge displayed, guidance banner provided, and attempt triggered explanation'
    );
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint3_1_01_locked_lesson_guidance.png') });

    // 5. Test "Go to Prerequisite" button navigation
    await page.click('#btn-goto-prereq-lesson-2-1');
    await page.waitForTimeout(500);
    await page.locator('h3:has-text("Stage 1: Home Row Anchors")').waitFor({ state: 'visible', timeout: 5000 });
    const isBackInStage1 = await page.locator('h3:has-text("Stage 1: Home Row Anchors")').isVisible();
    record('5. Prerequisite Jump Navigation', isBackInStage1 ? 'PASSED' : 'FAILED', '1-click button navigated back to Stage 1 prerequisite');

    // 6. Complete Stage 1 Lesson 1.1 Intro Drill
    await page.click('#btn-drill-intro-lesson-1-1');
    await page.waitForTimeout(400);

    await typeCurrentCanvasWords();

    const resultsModal = page.locator('#results-modal');
    await resultsModal.waitFor({ state: 'visible', timeout: 8000 });
    const modalContent = await resultsModal.innerText();
    const isPassed = modalContent.includes('Lesson Passed!') || modalContent.includes('Passed');
    record('6. Lesson 1.1 Drill Completion', isPassed ? 'PASSED' : 'FAILED', 'Completed intro drill and passed threshold');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint3_1_02_lesson1_1_passed.png') });

    // Close modal and return to curriculum
    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Academy (Stages 1–6)")');
    await page.waitForTimeout(400);

    // 7. Verify Lesson 1.1 completion state and Lesson 1.2 unlocking
    const lesson1_1Passed = await page.locator('#badge-passed-lesson-1-1').isVisible();
    const lesson1_2Unlocked = !(await page.locator('#badge-locked-lesson-1-2').isVisible());
    record(
      '7. Dynamic Prerequisite Progression Unlocking',
      (lesson1_1Passed && lesson1_2Unlocked) ? 'PASSED' : 'FAILED',
      'Lesson 1.1 retained Passed state and Lesson 1.2 dynamically unlocked'
    );

    // 8. Representative Top-Row Flow (Stage 3, Lesson 3.1: Keys E and I)
    const stage3Tab = page.locator('#btn-stage-tab-3');
    await stage3Tab.scrollIntoViewIfNeeded();
    await stage3Tab.click();
    await page.locator('#card-lesson-lesson-3-1').waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#btn-override-unlock-lesson-3-1'); // Preview drill practice
    await page.waitForTimeout(400);

    const stage3Banner = await page.locator('div:has-text("Keys E and I")').first().isVisible();
    await typeCurrentCanvasWords();
    await page.locator('#results-modal').waitFor({ state: 'visible', timeout: 8000 });
    record('8. Representative Top-Row Flow (Stage 3)', stage3Banner ? 'PASSED' : 'FAILED', 'Completed Stage 3 top-row drill with live results');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint3_1_03_top_row_practice.png') });

    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(300);

    // 9. Representative Bottom-Row Flow (Stage 4, Lesson 4.1: Keys V and M)
    await page.click('button:has-text("Academy (Stages 1–6)")');
    await page.waitForTimeout(300);
    const stage4Tab = page.locator('#btn-stage-tab-4');
    await stage4Tab.scrollIntoViewIfNeeded();
    await stage4Tab.click();
    await page.locator('#card-lesson-lesson-4-1').waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#btn-override-unlock-lesson-4-1');
    await page.waitForTimeout(400);

    const stage4Banner = await page.locator('div:has-text("Keys V and M")').first().isVisible();
    await typeCurrentCanvasWords();
    await page.locator('#results-modal').waitFor({ state: 'visible', timeout: 8000 });
    record('9. Representative Bottom-Row Flow (Stage 4)', stage4Banner ? 'PASSED' : 'FAILED', 'Completed Stage 4 bottom-row drill with live results');

    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(300);

    // 10. Representative Number-Row Flow (Stage 5, Lesson 5.1: Left Hand Numbers)
    await page.click('button:has-text("Academy (Stages 1–6)")');
    await page.waitForTimeout(300);
    const stage5Tab = page.locator('#btn-stage-tab-5');
    await stage5Tab.scrollIntoViewIfNeeded();
    await stage5Tab.click();
    await page.locator('#card-lesson-lesson-5-1').waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#btn-override-unlock-lesson-5-1');
    await page.waitForTimeout(400);

    const stage5Banner = await page.locator('div:has-text("Left-Hand Numbers")').first().isVisible();
    await typeCurrentCanvasWords();
    await page.locator('#results-modal').waitFor({ state: 'visible', timeout: 8000 });
    record('10. Representative Number-Row Flow (Stage 5)', stage5Banner ? 'PASSED' : 'FAILED', 'Completed Stage 5 numeric drill with live results');

    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(300);

    // 11. Representative Symbol Flow (Stage 6, Lesson 6.1: Opposite-Hand Shift Coordination)
    await page.click('button:has-text("Academy (Stages 1–6)")');
    await page.waitForTimeout(300);
    const stage6Tab = page.locator('#btn-stage-tab-6');
    await stage6Tab.scrollIntoViewIfNeeded();
    await stage6Tab.click();
    await page.locator('#card-lesson-lesson-6-1').waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#btn-override-unlock-lesson-6-1');
    await page.waitForTimeout(400);

    const stage6Banner = await page.locator('div:has-text("Opposite-Hand Shift Coordination")').first().isVisible();
    await typeCurrentCanvasWords();
    await page.locator('#results-modal').waitFor({ state: 'visible', timeout: 8000 });
    record('11. Representative Symbol Flow (Stage 6)', stage6Banner ? 'PASSED' : 'FAILED', 'Completed Stage 6 capitalization & symbol drill with live results');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint3_1_04_number_symbol_drill.png') });

    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(300);

    // 12. History & Refresh Persistence Verification
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Open Academy and verify Lesson 1.1 passed state remains intact after page refresh
    await page.click('button:has-text("Academy (Stages 1–6)")');
    await page.waitForTimeout(400);
    const persistedPassed = await page.locator('#badge-passed-lesson-1-1').isVisible();
    record('12. Refresh Persistence (Curriculum & LocalStorage)', persistedPassed ? 'PASSED' : 'FAILED', 'Completed lesson status retained after browser reload');

    // 13. Mobile Viewport Responsive Test (375px width)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(400);

    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    const isCurriculumVisibleMobile = await page.locator('#curriculum-view').isVisible();
    record(
      '13. Mobile Responsive Layout (375px)',
      (isCurriculumVisibleMobile && !isHorizontalOverflow) ? 'PASSED' : 'FAILED',
      `Mobile viewport verified with zero horizontal overflow (Overflow detected: ${isHorizontalOverflow})`
    );
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sprint3_1_05_mobile_viewport_375px.png') });

  } catch (err) {
    console.error('Test execution error:', err);
    record('Sprint 3.1 E2E Test Suite', 'FAILED', err.message);
  } finally {
    await browser.close();
  }

  // Save report JSON
  const summary = {
    timestamp: new Date().toISOString(),
    totalChecks: testResults.length,
    passedCount: testResults.filter((r) => r.status === 'PASSED').length,
    failedCount: testResults.filter((r) => r.status === 'FAILED').length,
    results: testResults,
  };

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'sprint3_1_e2e_results.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  );

  console.log('\n=== SPRINT 3.1 E2E SUMMARY ===');
  console.log(`Passed: ${summary.passedCount} / ${summary.totalChecks}`);
  console.log('Results saved to artifact directory.');
}

runSprint31ProductReadiness();
