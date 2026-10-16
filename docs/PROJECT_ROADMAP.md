# Typing Typhon — Master Project Roadmap & Milestone Exit Criteria

**Document Version:** 1.0.0  
**Status:** Approved Strategic Baseline  
**Target Release Schedule:** 14-Week Guided Rollout to Monetization  
**Date:** October 2026  

---

## 1. Master Phase Roadmap

```mermaid
gantt
    title Typing Typhon Product Development Lifecycle
    dateFormat  YYYY-MM-DD
    section Phase 0: Foundations
    Architecture & Specs Documentation :done, des1, 2026-10-16, 2026-10-23
    Design System & Tokens Baseline    :active, des2, 2026-10-20, 2026-10-27
    section Phase 1: MVP Core
    Typing Engine & Headless State     :p1_1, 2026-10-27, 2026-11-10
    Next.js UI & Virtual Keyboard      :p1_2, 2026-11-03, 2026-11-17
    IndexedDB Guest Storage            :p1_3, 2026-11-10, 2026-11-20
    Initial 10 Curriculum Stages       :p1_4, 2026-11-15, 2026-11-28
    section Phase 2: Accounts & Sync
    NestJS API & Postgres Schema       :p2_1, 2026-11-24, 2026-12-08
    Optional Auth & OAuth2             :p2_2, 2026-12-01, 2026-12-15
    Guest-to-Cloud Migration Pipeline  :p2_3, 2026-12-08, 2026-12-22
    Verifiable Certificates Engine     :p2_4, 2026-12-15, 2026-12-29
    section Phase 3: Content & SEO
    25+ Pillar Educational Guides      :p3_1, 2026-12-15, 2027-01-12
    Daily Contests & Anti-Cheat        :p3_2, 2027-01-05, 2027-01-19
    Admin Panel Modules                :p3_3, 2027-01-12, 2027-01-26
    section Phase 4: Monetization
    CMP Consent & ads.txt Setup        :p4_1, 2027-01-19, 2027-01-26
    Google AdSense Application         :p4_2, 2027-01-26, 2027-02-09
    Live Ad Placements & RPM Polish    :p4_3, 2027-02-09, 2027-02-23
```

---

## 2. Phase-by-Phase Deliverables & Exit Criteria

### Phase 0: Architecture, Documentation & Engineering Foundations (Weeks 1–2)
* **Deliverables:** Complete 20-document architecture suite, project context, database schemas, API specs, and UI design tokens.
* **Exit Criteria (Definition of Done):**
  * Founder and lead architects approve documentation suite.
  * Shared TypeScript DTO contracts defined.
  * Empty workspace prepared for Next.js & NestJS monorepo or dual-repo initialization.

---

### Phase 1: MVP Core Build & Guest Experience (Weeks 3–6)
* **Deliverables:**
  * Headless Typing Engine state machine (100% test coverage).
  * Next.js App Router shell with protected canvas, sub-16ms keystroke feedback.
  * IndexedDB local persistence storing up to 50 sessions for guests.
  * Speed test durations (15s, 30s, 60s, 120s) across Words and Sentences.
  * Post-test results screen with interactive WPM time-series graph.
  * First 10 curriculum stages (Home row, top row, basic capitalizations) with virtual keyboard and finger guidance.
  * Technical SEO: SSR metadata, canonicals, sitemap, robots.txt, and basic legal pages.
* **Exit Criteria (Definition of Done):**
  * Guest can land on `/`, type a 60-second test, view results, and review local history without an account.
  * Lighthouse Performance $\ge 95$, LCP $< 1.8\text{s}$, CLS $\le 0.01$.

---

### Phase 2: User Accounts, Migration & Verifiable Credentials (Weeks 7–9)
* **Deliverables:**
  * NestJS backend API connected to PostgreSQL 16.
  * Optional user authentication (Email/Password with Argon2id + Google/GitHub OAuth).
  * Secure HTTP-only JWT cookie architecture with token refresh rotation.
  * Guest-to-account history migration pipeline with server-side plausibility checks.
  * Cloud user dashboard with cumulative stats, streak tracking, and weak-key heatmap.
  * Digital typing certificate generation (PDF export + public verification URL `/verify/[code]`).
  * Admin Panel baseline (User directory, curriculum editor).
* **Exit Criteria (Definition of Done):**
  * A guest with 5 local sessions registers and successfully migrates records to the database.
  * Public verification of a certificate UUID renders accurate candidate metadata.

---

### Phase 3: Content Expansion, Daily Contests & SEO Authority (Weeks 10–12)
* **Deliverables:**
  * 25+ comprehensive educational articles, keyboard switch comparisons, and touch typing tutorials published to `/blog`.
  * Daily and Weekly Contest engine with IKI telemetry anti-cheat validation.
  * Mini-game canvas (Word Sprint).
  * Comprehensive Admin Panel (Contest moderation, content CMS, audit logs).
* **Exit Criteria (Definition of Done):**
  * 100% of public routes submitted to Google Search Console.
  * Anti-cheat test suite reliably catches automated macro injections.

---

### Phase 4: Monetization Launch, Growth & AdSense Integration (Weeks 13–14+)
* **Deliverables:**
  * Google AdSense application submitted following approval checklist.
  * Google-certified Consent Management Platform (CMP) deployed.
  * `ads.txt` verified at root domain.
  * Non-intrusive ad containers populated on results and blog pages.
  * Ongoing performance and RPM monitoring.
* **Exit Criteria (Definition of Done):**
  * AdSense account formally approved.
  * Ads rendering strictly in designated containers with zero input latency impact.

---

## 3. Post-MVP Growth Horizons (Future Roadmap)

```mermaid
graph LR
    H1["Horizon 1 (Launch)"] --> H2["Horizon 2 (Post-Launch Expansion)"]
    H2 --> H3["Horizon 3 (Institutional Scale)"]

    H1["AdSense Free Platform<br/>Guest First<br/>10 Curriculum Stages"]
    H2["Multi-language i18n (ES, DE, FR)<br/>Real-Time Multiplayer Races<br/>Advanced Syntax Drills (Rust, C++)"]
    H3["B2B School & Enterprise Typing Assessments<br/>Proctored Civil Service Testing<br/>Hardware / Custom Keyboard Partnerships"]
```
