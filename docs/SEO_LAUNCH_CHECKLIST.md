# Typing Typhon — Technical SEO Launch Checklist

## Status: Pre-Launch Readiness Assessment

This checklist provides a systematic audit of technical SEO foundations, search indexation safety, metadata hierarchy, and launch prerequisites.

---

## 1. Technical Foundations Audit

| Item | Target | Verification Method | Status | Evidence / Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Domain-Independent Base URL** | Configurable via single environment variable | Inspected `apps/web/src/lib/siteConfig.ts` | **VERIFIED** | `getSiteBaseUrl()` resolves `NEXT_PUBLIC_SITE_URL` with zero hard-coded domains. |
| **Staging / Preview Indexation Gate** | Staging must not be indexed by search crawlers | Verified `isIndexingRestricted()` in `siteConfig.ts` & `robots.ts` | **VERIFIED** | Non-production or preview environments return `User-Agent: * Disallow: /` and `robots: { index: false, follow: false }`. |
| **Canonical URL Integrity** | Absolute canonical URLs matching configured base origin | Inspected HTML `<link rel="canonical">` across `/`, `/practice`, `/lessons`, `/accuracy`, `/privacy`, `/terms` | **VERIFIED** | All routes specify canonical URLs derived from `baseUrl`. |
| **Sitemap XML Generation** | Dynamic `sitemap.xml` containing valid, indexable public routes | Fetched `http://localhost:3000/sitemap.xml` | **VERIFIED** | Correct XML outputting `/`, `/practice`, `/lessons`, `/accuracy`, `/privacy`, `/terms` with updated ISO timestamps and change frequencies. |
| **No Private Route Indexation** | Private API or auth endpoints must never appear in sitemap | Verified routes in `sitemap.ts` and `robots.ts` | **VERIFIED** | `/api/` is blocked in `robots.txt`; zero private routes exist in `sitemap.ts`. |
| **Custom 404 Page** | Returns 404 status, clear messaging, return pathways | Tested via Playwright on `/non-existent-route` | **VERIFIED** | Renders 404 card with direct links to Speed Test, Curriculum, and Accuracy Guide. |
| **Mobile Responsiveness** | No horizontal scrolling or clipped interaction elements on 375px viewports | Verified via Playwright on mobile viewport (375x667) | **VERIFIED** | All controls, duration pills, HUD stats, and canvas elements wrap cleanly with zero overflow. |

---

## 2. Structured Data (JSON-LD) Inventory

| Page Route | Schema Type | Entities Defined | Validation Status |
| :--- | :--- | :--- | :---: |
| `/practice` | `FAQPage` | 4 detailed FAQ entries covering WPM formulas, Net vs Gross WPM, speed benchmarks, and free guest access | **VERIFIED** |
| `/lessons` | `Course` | Touch Typing Academy curriculum, 6 stages, 15m workload, organization provider | **VERIFIED** |
| `/accuracy` | `Article` | Detailed editorial on typing accuracy mechanics, error penalties, and muscle memory | **VERIFIED** |

---

## 3. High-Quality Landing Page Set

| Route | Primary Keyword Focus | Search Intent | Interactive Element | Value Proposition |
| :--- | :--- | :--- | :--- | :--- |
| **`/`** | Online typing test, touch typing lessons | Mixed (Navigational / Transactional) | Full typing canvas, duration controls, guest history | Instant practice without registration. |
| **`/practice`** | Typing speed practice, free WPM test | Transactional | Standalone `<PracticeWidget>` with 15s/30s/60s/120s options and live result banner | Instant benchmarking with formula breakdown. |
| **`/lessons`** | Touch typing lessons, QWERTY finger placement | Educational / Informational | Direct launcher to Academy Stage 1 Lesson 1 | Systematic 6-stage curriculum breakdown with finger zone maps. |
| **`/accuracy`** | Typing accuracy, eliminate typos | Educational / Informational | Interactive remedial guidance & test triggers | Explains triple error penalty and 98% accuracy rule. |
| **`/privacy`** | Privacy policy | Trust / Informational | Clear local storage disclosures | Full transparency on zero keystroke tracking. |
| **`/terms`** | Terms of service | Trust / Informational | Educational benchmark disclaimers | Transparent fair use expectations. |

---

## 4. Post-Domain-Selection Launch Steps (Blocked until Domain Choice)

Once the production domain is officially registered and approved by project leadership:

- [ ] **Step 1:** Configure `NEXT_PUBLIC_SITE_URL=https://<chosen-domain>` in hosting environment variables.
- [ ] **Step 2:** Configure `CORS_ORIGIN=https://<chosen-domain>` in backend API environment variables.
- [ ] **Step 3:** Deploy production build and inspect live `https://<chosen-domain>/robots.txt` and `https://<chosen-domain>/sitemap.xml`.
- [ ] **Step 4:** Verify ownership in **Google Search Console** using DNS TXT record (recommended) or HTML tag.
- [ ] **Step 5:** Submit `https://<chosen-domain>/sitemap.xml` directly in Search Console.
- [ ] **Step 6:** Verify Core Web Vitals lab baseline using PageSpeed Insights (target: LCP < 2.0s, CLS < 0.05, INP < 100ms).
