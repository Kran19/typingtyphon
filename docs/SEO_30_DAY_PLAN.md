# Typing Typhon — 30-Day Post-Launch SEO Execution Plan

## Strategic Objective

Achieve steady, compounding organic search visibility across international English-speaking audiences for core touch-typing queries ("typing test", "typing speed test", "touch typing lessons", "improve typing accuracy") while maintaining high user trust and zero paywall barriers.

---

## Timeline & Milestones

### Week 1: Technical Setup & Search Console Indexation

| Day | Task | Owner | Acceptance Criteria |
| :---: | :--- | :--- | :--- |
| **Day 1** | **Domain Configuration & Environment Deployment** | DevOps / Full Stack | `NEXT_PUBLIC_SITE_URL` set to production domain; SSL active with HSTS enabled. |
| **Day 2** | **Google Search Console & Bing Webmaster Verification** | Technical SEO | Domain verified via DNS TXT record; production sitemap (`/sitemap.xml`) submitted. |
| **Day 3** | **Indexation Verification & Crawl Budget Inspection** | Technical SEO | URL Inspection tool executed on `/`, `/practice`, `/lessons`, `/accuracy`. Ensure no robots blocks. |
| **Day 4** | **Core Web Vitals Baseline Benchmark** | Performance Eng | Run Google PageSpeed Insights & WebPageTest. Confirm mobile LCP < 2.0s, CLS < 0.05, INP < 100ms. |
| **Day 5** | **Structured Data Rich Results Test** | Technical SEO | Validate JSON-LD schemas using Google Rich Results Test (Course, FAQPage, Article). |

---

### Week 2: Internal Linking Architecture & User Engagement

| Day | Task | Owner | Acceptance Criteria |
| :---: | :--- | :--- | :--- |
| **Day 8** | **Contextual Internal Linking Review** | Frontend / Content | Cross-link `/practice` and `/accuracy` within lesson summaries and test completion modal. |
| **Day 10** | **Search Intent Query Mapping** | Technical SEO | Review Search Console query impressions for early ranking keywords; adjust title tags if needed. |
| **Day 12** | **Social Metadata Validation** | Frontend | Test Open Graph cards using Facebook Sharing Debugger, Twitter/X Card Validator, and LinkedIn Inspector. |
| **Day 14** | **Guest Engagement & Retention Audit** | Analytics Review | Check guest practice completion rates and local storage persistence longevity across returning sessions. |

---

### Week 3: Targeted Educational Guide Expansion

*Note: Maintain high educational quality and avoid thin or mass-generated doorway pages.*

| Day | Task | Owner | Acceptance Criteria |
| :---: | :--- | :--- | :--- |
| **Day 16** | **Author "Home Row Essentials" Deep-Dive** | Curriculum / Content | Guide covering ASDF JKL; positioning, tactile bump mechanics, and common beginner pitfalls. |
| **Day 18** | **Author "Ergonomic Typing & Repetitive Strain Prevention"** | Health / Ergonomics | Original guide on wrist posture, keyboard tilt, chair height, and tendon recovery breaks. |
| **Day 20** | **Author "Number & Symbol Typing Strategies for Coders"** | Developer Advocate | Specific focus on reach discipline for `{`, `}`, `(`, `)`, `;`, `=>`, and top-row numbers. |
| **Day 22** | **Technical Review of Educational Content** | Lead Engineer | Fact-check all pedagogical claims and ensure zero keyword stuffing or unsubstantiated guarantees. |

---

### Week 4: Performance Review, KPI Analysis & AdSense Readiness

| Day | Task | Owner | Acceptance Criteria |
| :---: | :--- | :--- | :--- |
| **Day 24** | **Google Search Console 3-Week Crawl Report** | Technical SEO | Review indexed URL count, average ranking position, click-through rate (CTR), and crawl errors. |
| **Day 26** | **Search Console Core Web Vitals Field Data Check** | Performance Eng | Check whether initial CrUX field data is beginning to accumulate for the domain. |
| **Day 28** | **AdSense Eligibility Pre-Flight Audit** | Product / Compliance | Confirm site has sufficient organic traffic, original content depth, clean navigation, and clear privacy disclosures. |
| **Day 30** | **Month 1 SEO Review & Month 2 Backlog Creation** | Product Owner | Present Month 1 organic impressions, test completion volume, and backlog for next sprint. |

---

## Organic Growth KPIs

| Metric | Target (Day 30) | Tracking Tool |
| :--- | :---: | :--- |
| **Indexed Public Pages** | 100% of sitemap routes (6/6) | Google Search Console Index Coverage |
| **First-Test Completion Rate** | $\ge 70\%$ of visitors who initiate a test | Client-side privacy-conscious event logging |
| **Repeat Practice Rate (Local)** | $\ge 25\%$ returning within 7 days | LocalStorage `lastVisit` / IndexedDB history |
| **Core Web Vitals Pass Rate** | $100\%$ Good ratings (Green) | PageSpeed Insights / Search Console CWV Report |
| **Search Console Crawl Errors** | 0 5xx errors, 0 4xx soft-404s | Google Search Console Coverage Report |
