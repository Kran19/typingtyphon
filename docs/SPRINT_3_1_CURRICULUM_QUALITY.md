# Typing Typhon — Sprint 3.1: Curriculum Quality Audit & Progression Specification

**Sprint:** 3.1 (Curriculum Quality, Analytics Integrity & Product Readiness)  
**Date:** October 16, 2026  
**Auditor:** Antigravity Senior Product & Quality Architect  
**Status:** Verified & Remediated  

---

## 1. Executive Summary & Audit Scope

This document provides a comprehensive quality audit and pedagogical verification of all **25 lessons and 75 drills** in the Typing Typhon Touch Typing Academy (`packages/contracts/src/curriculumData.ts`). 

The objective was to verify:
1. Every drill strictly respects progressive taught-key constraints (no untaught keys introduced prematurely).
2. Finger placement mappings match the physical QWERTY ANSI standard.
3. Prerequisite dependency graph is strictly monotonic and non-circular.
4. Drill tokens advance from controlled finger training toward authentic, high-frequency words and realistic prose.
5. Pass thresholds (Accuracy % and Net WPM) remain consistent and achievable.
6. Locked lessons display prominent, user-friendly guidance and direct navigation to prerequisites.

---

## 2. Comprehensive 25-Lesson / 75-Drill Inventory & Audit

### Stage 1: Home Row Anchors (Lessons 1.1 – 1.5)
*Target Keys: F, J, D, K, S, L, A, ;*

| Lesson ID | Title | Target Keys | Fingers | Prerequisites | Pass Threshold | Pedagogical Rationale & Corrections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`lesson-1-1`** | Keys F and J (Tactile Anchors) | `f`, `j` | Left Index, Right Index | None (Initial access) | $\ge 96.0\%$ acc, $\ge 15.0$ WPM | Establishes index finger resting position on tactile bumps. Free guest access verified. |
| **`lesson-1-2`** | Keys D and K (Middle Fingers) | `d`, `k` | Left Middle, Right Middle | `lesson-1-1` | $\ge 96.0\%$ acc, $\ge 15.0$ WPM | Introduces middle finger bilateral coordination alongside anchors. |
| **`lesson-1-3`** | Keys S and L (Ring Fingers) | `s`, `l` | Left Ring, Right Ring | `lesson-1-2` | $\ge 96.0\%$ acc, $\ge 16.0$ WPM | Isolates ring fingers without allowing adjacent finger lifting. |
| **`lesson-1-4`** | Keys A and Semicolon (Pinkies) | `a`, `;` | Left Pinky, Right Pinky | `lesson-1-3` | $\ge 96.0\%$ acc, $\ge 16.0$ WPM | Completes home row 8-finger resting baseline. Introduces right pinky punctuation. |
| **`lesson-1-5`** | Home Row Fluency & Word Integration | `a`, `s`, `d`, `f`, `j`, `k`, `l`, `;` | All 8 fingers | `lesson-1-4` | $\ge 96.0\%$ acc, $\ge 18.0$ WPM | **Remediated**: Replaced premature token `'glad'` (containing untaught `g`) with `'lad'`. Verified 100% taught home-row dictionary (`ask`, `dad`, `fall`, `salad`, `flask`, `alas`, `all`, `lad`). |

### Stage 2: Home Row Lateral Reaches (Lessons 2.1 – 2.2)
*Target Keys: G, H*

| Lesson ID | Title | Target Keys | Fingers | Prerequisites | Pass Threshold | Pedagogical Rationale & Corrections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`lesson-2-1`** | Keys G and H (Inward Index Reach) | `g`, `h` | Left Index (`g`), Right Index (`h`) | `lesson-1-5` | $\ge 96.0\%$ acc, $\ge 18.0$ WPM | Trains inward horizontal reach with immediate neuromuscular snapback to F and J. |
| **`lesson-2-2`** | Full Home Row Mastery & Real Words | `a`, `s`, `d`, `f`, `g`, `h`, `j`, `k`, `l`, `;` | All fingers | `lesson-2-1` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | Real word synthesis across all 10 home row keys: `glad`, `half`, `flash`, `dash`, `glass`, `shall`. |

### Stage 3: Top Row Keys & Reaches (Lessons 3.1 – 3.5)
*Target Keys: E, I, R, U, T, Y, O, W, Q, P*

| Lesson ID | Title | Target Keys | Fingers | Prerequisites | Pass Threshold | Pedagogical Rationale & Corrections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`lesson-3-1`** | Keys E and I (Middle Finger Upward) | `e`, `i` | Left Middle (`e`), Right Middle (`i`) | `lesson-2-2` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | High-frequency vowels E and I expand English word generation exponentially. |
| **`lesson-3-2`** | Keys R and U (Index Finger Upward) | `r`, `u` | Left Index (`r`), Right Index (`u`) | `lesson-3-1` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Replaced premature tokens `'run'`, `'cure'`, `'pure'` with `'read'`, `'fair'`, `'gear'`. |
| **`lesson-3-3`** | Keys T and Y (Index Lateral Upward) | `t`, `y` | Left Index (`t`), Right Index (`y`) | `lesson-3-2` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Replaced `'city'` (untaught `c`) with `'tree'`. |
| **`lesson-3-4`** | Keys O and W (Ring Finger Upward) | `o`, `w` | Left Ring (`w`), Right Ring (`o`) | `lesson-3-3` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | Ring finger diagonal reach upward to O and W. |
| **`lesson-3-5`** | Keys Q and P (Pinky Diagonal Upward) | `q`, `p` | Left Pinky (`q`), Right Pinky (`p`) | `lesson-3-4` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Replaced `'fox'` (untaught `x`) with `'pot'`. |

### Stage 4: Bottom Row Keys & Downward Reach (Lessons 4.1 – 4.6)
*Target Keys: V, M, C, comma, X, period, Z, slash, B, N*

| Lesson ID | Title | Target Keys | Fingers | Prerequisites | Pass Threshold | Pedagogical Rationale & Corrections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`lesson-4-1`** | Keys V and M (Index Downward Reach) | `v`, `m` | Left Index (`v`), Right Index (`m`) | `lesson-3-5` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Replaced `'many'` (untaught `n`) with `'farm'`. |
| **`lesson-4-2`** | Keys C and Comma (Middle Downward) | `c`, `,` | Left Middle (`c`), Right Middle (`,`) | `lesson-4-1` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Replaced `'nice'` (untaught `n`) with `'mice'`. |
| **`lesson-4-3`** | Keys X and Period (Ring Downward) | `x`, `.` | Left Ring (`x`), Right Ring (`.`) | `lesson-4-2` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Replaced `'next.'`, `'index.'`, `'box.'` with `'six.'`, `'taxi.'`, `'tax.'`. |
| **`lesson-4-4`** | Keys Z and Slash (Pinky Downward) | `z`, `/` | Left Pinky (`z`), Right Pinky (`/`) | `lesson-4-3` | $\ge 96.0\%$ acc, $\ge 18.0$ WPM | Furthest bottom-row pinky reach. |
| **`lesson-4-5`** | Keys B and N (Inward Bottom Reach) | `b`, `n` | Left Index (`b`), Right Index (`n`) | `lesson-4-4` | $\ge 96.0\%$ acc, $\ge 20.0$ WPM | Downward inward index stretch completing alphabet. |
| **`lesson-4-6`** | 26-Letter Alphabet Synthesis | `a`–`z`, `.`, `,` | All fingers | `lesson-4-5` | $\ge 96.0\%$ acc, $\ge 22.0$ WPM | Complete authentic pangrams and sentence integration. |

### Stage 5: Number Row Mastery (Lessons 5.1 – 5.3)
*Target Keys: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0*

| Lesson ID | Title | Target Keys | Fingers | Prerequisites | Pass Threshold | Pedagogical Rationale & Corrections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`lesson-5-1`** | Left-Hand Numbers (1, 2, 3, 4, 5) | `1`, `2`, `3`, `4`, `5` | Left Pinky to Index | `lesson-4-6` | $\ge 95.0\%$ acc, $\ge 18.0$ WPM | **Remediated**: Replaced right-hand numerals (`2024`, `1985`, `1492`) with left-hand combinations (`142`, `253`, `543`, `54321`, `12345`). |
| **`lesson-5-2`** | Right-Hand Numbers (6, 7, 8, 9, 0) | `6`, `7`, `8`, `9`, `0` | Right Index to Pinky | `lesson-5-1` | $\ge 95.0\%$ acc, $\ge 18.0$ WPM | Right hand numeral reaches. |
| **`lesson-5-3`** | Number Sequences & Patterns | `0`–`9` | Both hands | `lesson-5-2` | $\ge 95.0\%$ acc, $\ge 20.0$ WPM | Realistic dates, numbers, years (`year 2026`, `page 385`, `route 66`). |

### Stage 6: Shift Coordination & Symbols (Lessons 6.1 – 6.4)
*Target Keys: Shifted Letters, !, ?, ", ', -, $, %, &, :, ;*

| Lesson ID | Title | Target Keys | Fingers | Prerequisites | Pass Threshold | Pedagogical Rationale & Corrections |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`lesson-6-1`** | Opposite-Hand Shift Coordination | `T`, `P`, `L`, `A`, `M` | Left & Right Shift with opposite pinky | `lesson-5-3` | $\ge 95.0\%$ acc, $\ge 20.0$ WPM | **Remediated**: Target keys normalized to individual characters. Teaches proper noun capitalization (`Paris`, `Tokyo`, `London`). |
| **`lesson-6-2`** | Punctuation: Exclamation & Question | `!`, `?` | Left Pinky (`!`), Right Pinky (`?`) | `lesson-6-1` | $\ge 95.0\%$ acc, $\ge 20.0$ WPM | Expressive sentence punctuation. |
| **`lesson-6-3`** | Commercial Symbols (&, $, %) | `&`, `$`, `%` | Left/Right Fingers | `lesson-6-2` | $\ge 95.0\%$ acc, $\ge 20.0$ WPM | Practical business symbols. |
| **`lesson-6-4`** | Full Real-World Prose Mastery | `.`, `,`, `!`, `?`, `"`, `'`, `:`, `;`, `-`, `$` | All fingers | `lesson-6-3` | $\ge 96.0\%$ acc, $\ge 25.0$ WPM | Comprehensive touch-typing synthesis with authentic punctuation and capitalization. |

---

## 3. Progression Boundary & Locked Lesson Guidance UX

1. **Guest Access**:
   * Stage 1 Lesson 1.1 has `prerequisiteLessonIds: []` and is accessible immediately on page load without registration.
2. **Deterministic Prerequisite Unlocking**:
   * Evaluated via pure function `isLessonUnlocked(lesson, progressMap)`.
   * Monotonic: failed attempts update attempt counters and best metrics but never revoke previously unlocked lessons.
3. **Locked Lesson Guidance Banner**:
   * When a learner navigates to a stage where prerequisites are unfulfilled, the card displays a prominent guidance box:
     > 🔒 **Prerequisite Lesson Required**  
     > Complete **Keys F and J (Tactile Anchors)** (Stage 1: Home Row Anchors) with $\ge 96.0\%$ accuracy to unlock.  
     > `[Go to Prerequisite →]`
   * Clicking `Go to Prerequisite` automatically switches active stage tab and smooth-scrolls to the prerequisite card.
4. **Drill Action Guard**:
   * Clicking a drill button on a locked lesson triggers an informative alert banner: `⚠️ This lesson is locked! Complete earlier prerequisites first to build proper finger technique.`
   * A discrete `[Preview Drill Anyway]` override button permits advanced learners or educators to practice without barrier.

---

## 4. Automated Test Verification

All curriculum invariants are enforced by automated test suites in `apps/web/src/lib/__tests__/curriculum.test.ts`:
- `should contain all 6 stages in sequential order`: Verified.
- `should assign unique, stable IDs to every lesson across all stages`: Verified (25 lessons total).
- `should specify explicit learning objectives and pass thresholds for every lesson`: Verified.
- `should have valid non-empty intro, word, and remedial drills for each lesson`: Verified (75 drills total).
- `should enforce strict, non-circular prerequisite ordering`: Verified.
- `should map target keys to valid anatomical finger assignments`: Verified.
- `should only use taught characters in drills across Stages 1–4`: Verified (0 untaught characters).
- `should unlock only initial lessons for new guests and require prerequisites for subsequent lessons`: Verified.
- `should unlock subsequent lessons when prerequisite lessons are passed`: Verified.
- `should verify all 75 drills contain well-formed, non-empty, trimmed exercise strings`: Verified.
