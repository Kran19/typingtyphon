# Typing Typhon — Beta Testing & Browser QA Plan

## Objective

Validate product stability, guest practice reliability, edge-case resilience, cross-browser compatibility, and accessibility before opening the site to unrestricted global public traffic.

---

## 1. Test Audience & Cohorts

| Cohort | Size | User Persona | Key Journey Under Test |
| :--- | :---: | :--- | :--- |
| **Cohort A: Casual Typists** | 10–15 | Non-technical visitors testing WPM | Instant 60s test, results review, local history survival across browser tabs. |
| **Cohort B: Touch-Typing Students** | 8–10 | Beginners learning without looking at keys | Curriculum stages 1–3, lesson pass thresholds, remedial drill feedback. |
| **Cohort C: Power Typists / Coders** | 5–8 | High-speed typists (80+ WPM) | High burst speeds, symbol/number rows, no keystroke dropping under rapid input. |
| **Cohort D: Mobile & Tablet Users** | 5–8 | iPad/Tablet with hardware keyboard | Viewport layout, screen rotation, no horizontal overflow on narrow viewports. |

---

## 2. Core User Journeys Matrix

| Test Scenario | Steps | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :---: |
| **1. Cold Guest Test** | Open `/practice`, click 15s/60s, type words until timer expires. | Test completes, net WPM and accuracy display, history recorded in IndexedDB. | **VERIFIED (Playwright)** |
| **2. Local History Persistence** | Complete 2 tests, refresh browser, open guest history accordion. | Both sessions persist with accurate timestamps, WPM, and error counts. | **VERIFIED (Playwright)** |
| **3. Curriculum Progression** | Open Academy, start Stage 1 Lesson 1, complete drill with $\ge 90\%$ accuracy. | Lesson passes, mastery badge displays, Lesson 2 unlocks. | **VERIFIED (Playwright)** |
| **4. Offline / API Resilience** | Disconnect backend API server; continue guest typing practice. | Guest practice continues seamlessly without error dialogs or data loss. | **VERIFIED** |
| **5. Storage Cleared Resilience** | Clear browser cookies and localStorage while typing. | Gracefully handles storage unavailability without application crash. | **VERIFIED** |
| **6. Keyboard Focus Recovery** | Click outside canvas during test, then click back into canvas. | Hidden input refocuses instantly; keystroke capture resumes without latency. | **VERIFIED** |
| **7. 404 Route Recovery** | Navigate to `/non-existent-page`. | Displays custom 404 page with functional return links to Speed Test and Lessons. | **VERIFIED (Playwright)** |
| **8. Mobile Viewport (375px)** | Open `/practice` on iPhone-width viewport (375x667). | Zero horizontal scrolling; duration pills wrap cleanly; all HUD metrics visible. | **VERIFIED (Playwright)** |

---

## 3. Supported Browser & Operating System Matrix

| Browser | Desktop Windows | Desktop macOS | Desktop Linux | Mobile iOS (Safari) | Mobile Android (Chrome) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Google Chrome (v120+)** | Primary (Tested) | Supported | Supported | Supported | Supported |
| **Mozilla Firefox (v120+)** | Supported | Supported | Supported | N/A | Supported |
| **Apple Safari (v17+)** | N/A | Supported | N/A | Supported | N/A |
| **Microsoft Edge (v120+)** | Supported | Supported | N/A | N/A | Supported |

---

## 4. Defect Reporting & Triage Criteria

- **P0 (Blocker):** Data loss, keystroke dropping, broken typing engine, page crash, or security vulnerability. Must be resolved before any public launch.
- **P1 (High):** Major layout overflow, broken navigation link, or timer desync.
- **P2 (Medium):** Minor cosmetic misalignment, copy typos, or minor styling discrepancies.
- **P3 (Low):** Minor enhancement requests or non-critical feature suggestions.
