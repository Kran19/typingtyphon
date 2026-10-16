# Typing Typhon — Sprint 3.1: Per-Key Analytics & Recommendation Validation

**Sprint:** 3.1 (Curriculum Quality, Analytics Integrity & Product Readiness)  
**Date:** October 16, 2026  
**Auditor:** Antigravity Senior Product & Quality Architect  
**Status:** Verified & Remediated  

---

## 1. Executive Summary & Defect Remediation

A rigorous forensic audit of the telemetry pipeline (`TypingEngine.ts`, `storage.ts`, `analytics.ts`, and `recommendations.ts`) identified and resolved critical telemetry integrity defects. All metrics calculations were verified using deterministic test sessions with known expected outcomes.

### Confirmed Defects & Remediation Matrix

| Defect ID | Component | Severity | Description & Evidence | Remediation Applied | Automated Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-31-01** | `storage.ts` & `page.tsx` | **High** | **Per-Key Telemetry Double-Counting on Lesson Drills**: `saveGuestLessonAttempt` and `saveGuestSession` both invoked `recordKeyStats(result)`. When a learner completed any academy drill, `page.tsx` called both functions, doubling total attempts, error counts, and correct keystroke stats in local storage. | Removed `recordKeyStats` invocation from `saveGuestLessonAttempt`. Implemented session deduplication hash check (`typingtyphon_recorded_key_sessions_v1`) and in-memory object guard `_keyStatsRecorded` in `recordKeyStats`. | `storage.test.ts`: `should never double-count per-key metrics when saveGuestLessonAttempt and saveGuestSession are called together` |
| **DEF-31-02** | `TypingEngine.ts` | **Medium** | **Pause & Distraction Latency Skew**: Inter-keystroke intervals up to $5000\text{ ms}$ were included in per-key average latency calculations. Learners pausing between words or reading prompt text distorted key hesitation metrics. | Tightened valid key latency filtering to $20\text{ ms} \le \Delta t \le 2000\text{ ms}$. Intervals $> 2000\text{ ms}$ are classified as pause/distraction intervals and excluded from key transit averages. | `TypingEngine.test.ts`: `rejects pause outliers (> 2000ms) from skewing key latency averages` |
| **DEF-31-03** | `TypingEngine.ts` & `TypingCanvas.tsx` | **Medium** | **Focus Loss Clock Skew**: Switching browser tabs or blurring window left `lastKeystrokeTime` stale. Regaining focus caused the next keypress to compute an erroneous multi-second transit interval. | Added public method `engine.resetKeystrokeTimer()` and registered a `window.addEventListener('blur')` listener in `TypingCanvas.tsx` to clear timing deltas upon tab blur. | `TypingEngine.test.ts`: `handles focus loss and timer reset via resetKeystrokeTimer() without corrupting delta` |

---

## 2. Telemetry Invariant Verification

### A. Repeated Characters
* **Rule**: When typing consecutive identical characters (e.g. `ee` in `tree` or `ff` in `flask`), each keystroke must be independently attributed to the target key.
* **Verification**: In `TypingEngine.ts`, character evaluation indexes into `currentWord.chars[this.activeCharIndex]`. Each character strike advances `activeCharIndex++` and invokes `recordKeyAttempt(targetChar.char, isMatch, delta)`. Verified in `TypingEngine.test.ts` (35 consecutive `f` strikes yielded exactly 35 attempts on `f`).

### B. Spacebar & Word Submission
* **Rule**: Spacebar acts as the word delimiter and must record key statistics for `' '`.
* **Verification**: `this.recordKeyAttempt(' ', isSpaceCorrect, delta)` is recorded on spacebar strike. If space is struck with untyped characters remaining in the word, those remaining characters are marked as `'missed'` and recorded as uncorrected errors.

### C. Backspace & Error Correction Accounting
* **Rule**: Striking Backspace must NOT increment `totalKeystrokes` on character keys, nor count as a key attempt. It must increment `corrected` counter on the corrected character.
* **Verification**: In `handleBackspace`, `this.recordKeyCorrection(currentChar.char)` is called. The character state reverts to `'untouched'`. When subsequently retyped, `attempts` and `correct` are recorded. Corrected errors do not appear in final `uncorrectedErrors`.

### D. Keyboard Layout & Virtual Keyboard Assumptions
* **Documented Assumptions**: 
  - Desktop: Standard 104/105-key physical QWERTY ANSI keyboard with hardware keydown timing.
  - Mobile Virtual Keyboards: Virtual keyboard software keyboards generate synthetic composition events and burst keystroke intervals. Intervals $< 20\text{ ms}$ are filtered to avoid synthetic timing artifacts.
  - Normalization: Alphabet keys are normalized to lowercase (`A`-`Z` $\to$ `a`-`z`) so shift capitalization does not splinter telemetry across upper and lower case buckets. Numbers and symbols (`1`, `!`, `@`, `.`) retain their distinct characters.

---

## 3. Recommendation Decision Tree Verification

The deterministic recommendation engine (`generatePracticeRecommendation`) executes an unbending 5-tier evaluation waterfall with zero external AI/LLM non-determinism:

```
[Start]
   │
   ├─► 1. Insufficient Data (Total tracked keys < 3 OR any key N < 5)
   │        └─► Output: 'general_practice' (Confidence: 'insufficient_data')
   │
   ├─► 2. Accuracy Deficit (Accuracy < 90.0% AND Errors >= 2 AND N >= 5)
   │        └─► Output: 'accuracy_remedial' (Remedial drill for weakest key)
   │
   ├─► 3. Latency Hesitation (Accuracy >= 90.0% AND Latency > 1.6x Mean AND Latency > 250ms)
   │        └─► Output: 'speed_drill' (Word drill for slow key)
   │
   ├─► 4. Curriculum Progression (Any unpassed lesson with prerequisites met)
   │        └─► Output: 'next_curriculum' (Next logical lesson)
   │
   └─► 5. Full Curriculum Mastery (All 25 lessons across 6 stages passed)
            └─► Output: 'maintenance' (Timed speed maintenance drill)
```

### Deterministic Test Matrix Results (`recommendations.test.ts`)

| Test Scenario | Input Telemetry Condition | Expected Recommendation | Actual Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Cold Start** | Empty telemetry `{}` | `general_practice` on `lesson-1-1` | `general_practice` | **PASSED** |
| **2. Insufficient Sample** | Key `e` has 2 errors but only 3 attempts ($N < 5$) | `general_practice` (No weak key claim) | `general_practice` | **PASSED** |
| **3. Recurring Accuracy Errors** | Key `e` has $66.7\%$ acc, 4 errors, 12 attempts | `accuracy_remedial` for `lesson-3-1` | `accuracy_remedial` | **PASSED** |
| **4. High Accuracy, Slow Typing** | Key `p` has $96.0\%$ acc, but $420\text{ ms}$ latency vs $155\text{ ms}$ mean | `speed_drill` for `lesson-3-4` | `speed_drill` | **PASSED** |
| **5. Unpassed Curriculum Lesson** | Stable telemetry, `lesson-1-1` passed | `next_curriculum` for `lesson-1-2` | `next_curriculum` | **PASSED** |
| **6. Full Curriculum Completed** | All 25 lessons passed across 6 stages | `maintenance` | `maintenance` | **PASSED** |
| **7. Conflicting Metrics** | Key `e` has accuracy deficit ($73.3\%$), key `p` has latency hesitation ($400\text{ ms}$) | `accuracy_remedial` (Accuracy strictly prioritized over speed) | `accuracy_remedial` | **PASSED** |
| **8. Multi-Session Improvement** | Recent practice elevated `j` accuracy to $93.3\%$ ($N=30$) | `next_curriculum` (Advances to next lesson, no trapped remedial) | `next_curriculum` | **PASSED** |

---

## 4. Test Suite Metrics
- Total Unit Tests for Engine & Storage: **36 tests** (`TypingEngine.test.ts` [28], `storage.test.ts` [8])
- Total Recommendation Decision Tests: **8 tests** (`recommendations.test.ts` [8])
- Regressions Detected: **0**
