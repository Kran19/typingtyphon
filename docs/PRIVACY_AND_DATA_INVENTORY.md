# Typing Typhon — Privacy & Data Inventory

## 1. Executive Privacy Architecture

Typing Typhon adheres to a strict **Guest-First, Privacy-Preserving** product design:
1. **Zero Keystroke Content Ingestion:** The typing engine computes all accuracy, words per minute (WPM), and character comparisons entirely client-side. The text you type is never transmitted to, logged by, or stored on remote servers.
2. **Zero Mandatory Registration:** Guests enjoy full, unhindered access to instant speed tests, 6-stage touch-typing lessons, and local analytics without providing an email, name, or payment credential.
3. **Local-First Persistence:** Test sessions and curriculum attempts for guests are stored solely on the client machine using standard web APIs (`IndexedDB` and `localStorage`).
4. **Transparent Cloud Synchronization:** Only users who explicitly elect to create an optional account synchronize aggregate performance metrics to the cloud.

---

## 2. Comprehensive Data Flow Inventory

| Data Flow / Category | Storage Mechanism | Data Elements Stored | Personal Identifiers | Transmission Scope | Retention & Erasure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Guest Practice Sessions** | Browser `IndexedDB` (`typingtyphon_db` / `guest_sessions`) | `id`, `sessionType`, `durationSeconds`, `netWpm`, `grossWpm`, `accuracyPct`, `totalKeystrokes`, `correctKeystrokes`, `errorCount`, `mode`, `clientTimestamp`, `timeSeries` (rolling WPM), `perKeyStats` (error counts) | None | Stays 100% on client device. Never transmitted. | User can clear instantly via "Clear Local History" button or browser storage settings. |
| **Guest Curriculum Progress** | Browser `localStorage` (`typingtyphon_curriculum_progress`) | Lesson IDs, completion status (`passed: true/false`), highest accuracy percentage, highest net WPM, attempts count | None | Stays 100% on client device. Never transmitted. | User can clear instantly via browser storage settings. |
| **Account Credentials (Optional)** | PostgreSQL Database (`User` table) | `email`, `passwordHash` (Argon2id salted hash), `role` (`USER`/`ADMIN`), `createdAt`, `updatedAt` | Email address | Transmitted via HTTPS POST `/auth/register` or `/auth/login`. | Retained until user requests account deletion. Plain-text passwords never stored. |
| **Session Authentication** | HTTP Cookies | Refresh token stored in `refreshToken` cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/api/v1/auth`). Short-lived access token in memory/cookie. | User ID reference | Transmitted over TLS only on authentication requests. | Revoked on logout or session rotation. |
| **Synchronized Cloud Sessions** | PostgreSQL Database (`PracticeSession` table) | `userId`, `sessionType`, `durationSeconds`, `netWpm`, `grossWpm`, `accuracyPct`, `totalKeystrokes`, `correctKeystrokes`, `errorCount`, `mode`, `clientTimestamp` | Linked to User ID | Transmitted via HTTPS POST `/progress/session` or `/progress/migrate-guest`. | Deleted upon account deletion request. |
| **Synchronized Lesson Progress** | PostgreSQL Database (`CurriculumProgress` table) | `userId`, `lessonId`, `stageId`, `status`, `bestAccuracy`, `bestWpm`, `attempts` | Linked to User ID | Transmitted via HTTPS POST `/progress/lesson`. | Deleted upon account deletion request. |
| **Telemetry & Analytics** | None currently installed | *None* | None | *No third-party analytics scripts currently active.* | N/A |
| **Advertising** | Active Canvas Protection | *Zero third-party advertising scripts active in current build.* | None | N/A | Advertising will never appear inside `.typing-protected-zone`. |

---

## 3. Cookie & Web Storage Policy Disclosure

| Cookie / Storage Key | Purpose | Type | Expiration | Security Flags |
| :--- | :--- | :--- | :--- | :--- |
| `refreshToken` | Refresh JWT for optional logged-in users | Essential / Authentication | 7 Days | `HttpOnly`, `Secure` (production), `SameSite=Lax` |
| `typingtyphon_db` | IndexedDB storing guest practice logs and weak-key aggregates | Essential / Functional | Persistent (Client-controlled) | Sandboxed to origin |
| `typingtyphon_curriculum_progress` | Local progress across 6 curriculum stages | Essential / Functional | Persistent (Client-controlled) | Sandboxed to origin |

---

## 4. User Rights & Data Deletion Capabilities

- **Guest Users:** All data is resident on the client machine. Self-service deletion is instant by clicking **"Clear Local History"** on the homepage or resetting browser site data.
- **Registered Users:** May request full cloud record deletion, including account record, authentication credentials, and all synchronized typing sessions.

---

## 5. Outstanding Legal & Jurisdiction Decisions Needed

1. **Official Legal Entity & Contact Information:**
   - *Status:* **NEEDS APPROVAL / DECISION NEEDED**
   - *Requirement:* The Privacy Policy and Terms of Use currently use placeholders (`privacy@typingtyphon.internal`). Once a legal entity is incorporated or designated, official contact details must be inserted.
2. **GDPR / CCPA / International Compliance Scope:**
   - *Status:* **VERIFIED COMPLIANT WITH MINIMAL DATA SCOPE**
   - *Note:* Because no tracking cookies, raw text, or third-party behavioral trackers are used, compliance overhead is minimal. Consent banners are not required for functional storage under ePrivacy Directive guidelines, but must be reviewed if third-party analytics or AdSense are introduced in future sprints.
