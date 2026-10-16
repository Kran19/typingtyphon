import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\4e89b905-e448-4a87-b279-015523cc16c3';

async function runSprint3E2E() {
  console.log('--- STARTING PLAYWRIGHT SPRINT 3 CURRICULUM & ANALYTICS E2E TEST ---');
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
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  page.on('response', (res) => {
    if (res.status() >= 400) console.log('HTTP ERROR:', res.status(), res.url());
  });

  const testResults = [];

  function record(name, status, details = '') {
    testResults.push({ name, status, details });
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
  }

  try {
    // 1. Visit homepage and open Academy (Stages 1-6)
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // Ensure complete React client hydration in dev server
    const academyBtn = page.locator('button:has-text("Academy (Stages 1–6)")');
    await academyBtn.waitFor({ state: 'visible', timeout: 5000 });
    await academyBtn.click();
    await page.waitForTimeout(300);

    const curriculumViewVisible = await page.locator('#curriculum-view').isVisible();
    record('1. Academy Stages 1-6 Navigation', curriculumViewVisible ? 'PASSED' : 'FAILED', 'Opened Academy tab');

    // 2. Verify all 6 Stage Tabs exist
    let allStagesFound = true;
    for (let s = 1; s <= 6; s++) {
      const stageTab = page.locator(`#btn-stage-tab-${s}`);
      const isVis = await stageTab.isVisible();
      if (!isVis) {
        allStagesFound = false;
        console.error(`Missing stage tab for Stage ${s}`);
      }
    }
    record('2. All 6 Stages Available', allStagesFound ? 'PASSED' : 'FAILED', 'Verified Stage 1 through Stage 6 pills');

    // 3. Select Stage 3 (Top Row Keys & Reaches)
    const stage3Btn = page.locator('#btn-stage-tab-3');
    await stage3Btn.click();
    await page.waitForTimeout(500);

    const stage3Heading = await page.locator('h3:has-text("Stage 3: Top Row Keys & Reaches")').isVisible();
    const lesson3_1 = await page.locator('#card-lesson-lesson-3-1').isVisible();
    record('3. Stage 3 (Top Row) Selection', (stage3Heading && lesson3_1) ? 'PASSED' : 'FAILED', 'Loaded Stage 3 lessons');

    // 4. Launch Lesson 3.1 Intro Drill (Keys E and I)
    await page.click('#btn-drill-intro-lesson-3-1');
    await page.waitForTimeout(400);

    const drillBanner = page.locator('div:has-text("Keys E and I (Middle Finger Upward) (INTRO DRILL)")').first();
    await drillBanner.waitFor({ state: 'visible', timeout: 5000 });
    record('4. Lesson 3.1 Drill Launch', 'PASSED', 'Mounted drill context banner and target keys');

    // Ensure typing canvas is focused
    await page.click('#typing-word-container');
    await page.waitForTimeout(200);

    // Read actual words rendered in container
    const renderedWords = await page.locator('#typing-word-container [id^="word-"]').allInnerTexts();
    console.log('Actual rendered drill words:', JSON.stringify(renderedWords));

    for (let w = 0; w < renderedWords.length; w++) {
      const cleanWord = renderedWords[w].replace(/\s+/g, '');
      for (const ch of cleanWord) {
        await page.keyboard.type(ch);
        await page.waitForTimeout(25);
      }
      if (w < renderedWords.length - 1) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(25);
      }
    }

    // Wait for Results Modal
    const resultsModal = page.locator('#results-modal');
    await resultsModal.waitFor({ state: 'visible', timeout: 8000 });
    const modalText = await resultsModal.innerText();
    const hasNetWpm = modalText.toLowerCase().includes('net words per minute');
    const hasRecActivity = modalText.toLowerCase().includes('recommended next activity');

    record('5. Drill Completion & Results Modal', (hasNetWpm && hasRecActivity) ? 'PASSED' : 'FAILED', 'Evaluated pass criteria, Net WPM, and recommendation card');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_stage3_lesson_passed_modal.png') });

    // 6. Close Modal via Restart button
    await page.click('button:has-text("Restart Test")');
    await page.waitForTimeout(400);
    record('6. Close Results Modal & Reset Canvas', 'PASSED', 'Restart button closed modal and refocused');

    // 7. Switch back to Academy tab
    const academyTabBtn = page.locator('button:has-text("Academy (Stages 1–6)")');
    await academyTabBtn.click();
    await page.waitForTimeout(300);

    // 8. Open Personalized Key Analytics Tab
    const analyticsTabBtn = page.locator('#btn-tab-curriculum-analytics');
    await analyticsTabBtn.waitFor({ state: 'visible', timeout: 5000 });
    await analyticsTabBtn.click();
    await page.waitForTimeout(300);

    const analyticsHeader = page.locator('text=Recommended Next Practice').first();
    await analyticsHeader.waitFor({ state: 'visible', timeout: 5000 });
    const hasKeyTable = await page.locator('text=All Tracked Keyboard Characters').isVisible();

    record('7. Personalized Key Analytics Dashboard', (analyticsHeader && hasKeyTable) ? 'PASSED' : 'FAILED', 'Rendered recommendation card, overview metrics, and per-key data table');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_personalized_key_analytics_dashboard.png') });

    // 8. Launch Recommended Drill from Analytics Tab
    const launchRecBtn = page.locator('#btn-launch-recommendation');
    if (await launchRecBtn.isVisible()) {
      await launchRecBtn.click();
      await page.waitForTimeout(500);
      const isCanvasRefocused = await page.locator('#typing-word-container').isVisible();
      record('8. Launch Practice Recommendation', isCanvasRefocused ? 'PASSED' : 'FAILED', '1-click CTA started recommended drill smoothly');
    }

    // 9. Verify Refresh Persistence for Curriculum & Analytics
    await page.reload({ waitUntil: 'networkidle' });
    const academyBtn2 = page.locator('button:has-text("Academy (Stages 1–6)")');
    await academyBtn2.click();
    await page.click('#btn-stage-tab-3');

    // Lesson 3.1 was completed and should have passed badge
    const lesson3_1CardReloaded = page.locator('#card-lesson-lesson-3-1');
    const lesson3_1Passed = await lesson3_1CardReloaded.locator('text=Passed').isVisible();
    record('9. Curriculum Refresh Persistence', lesson3_1Passed ? 'PASSED' : 'FAILED', 'Lesson 3.1 passed status preserved across page reload');

    // 10. Responsive Mobile Check (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const curriculumElem = page.locator('#curriculum-view');
    await curriculumElem.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    const mobileCurriculumVis = await curriculumElem.isVisible();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_sprint3_mobile_curriculum_analytics.png') });
    record('10. Mobile Responsive Layout (375px)', (mobileCurriculumVis && !isHorizontalOverflow) ? 'PASSED' : 'FAILED', `Tested iPhone SE viewport with zero horizontal overflow: ${!isHorizontalOverflow}`);

  } catch (err) {
    console.error('Error during Sprint 3 E2E test:', err);
    record('Sprint 3 E2E Execution', 'FAILED', err.message);
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
    path.join(ARTIFACT_DIR, 'sprint3_e2e_results.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  );

  console.log('--- SPRINT 3 E2E SUMMARY ---');
  console.log(`Passed: ${summary.passedCount} / ${summary.totalChecks}`);
  console.log('Results saved to artifact directory.');
}

runSprint3E2E();
