# Typing Typhon — End-to-End User Flows

**Document Version:** 1.0.0  
**Status:** Approved Architectural Baseline  
**Date:** October 2026  

---

## 1. Primary User Journey Matrix

Typing Typhon is built around the **Guest-First Axiom**: every core feature must deliver immediate value prior to any authentication request.

```mermaid
journey
    title Typical User Progression in Typing Typhon
    section Discovery & Test
      Lands on Homepage: 5: Guest
      Instant typing test started: 5: Guest
      Completes 60s test: 5: Guest
      Inspects WPM & Weak Keys: 4: Guest
    section Structured Learning
      Navigates to /learn: 4: Guest
      Drills Home Row (F & J): 5: Guest
      Local progress stored: 5: Guest
    section Account Elevation
      Prompted to save streak: 4: Guest
      Signs up with Google OAuth: 5: User
      Historical guest data merged: 5: User
    section Mastery & Competition
      Enters Daily Challenge: 4: User
      Generates Certified PDF: 5: User
      Shares public verification link: 5: User
```

---

## 2. User Flow 1: First Visit & Instant Typing Test

*Objective: Zero friction between URL resolution and first keystroke.*

```mermaid
sequenceDiagram
    autonumber
    actor User as Visitor (Guest)
    participant Browser as Client (Next.js)
    participant Storage as IndexedDB (Client)

    User->>Browser: Navigates to typingtyphon.com
    Browser->>Browser: Mounts TypingCanvas with default 60s / Words mode
    Browser->>Browser: Focuses hidden keystroke input buffer
    Note over User,Browser: Caret blinks on first word. No modal popups.
    User->>Browser: Strikes first valid character
    Browser->>Browser: Starts high-resolution timer (performance.now())
    loop Every Keystroke
        User->>Browser: Keydown event
        Browser->>Browser: Calculate character correctness (<16ms)
        Browser->>Browser: Advance caret position, play audio blip
    end
    Browser->>Browser: Timer reaches 0.00s
    Browser->>Browser: Computes Gross WPM, Net WPM, Accuracy, Weak Keys
    Browser->>Storage: Writes completed session to IndexedDB (sessions table)
    Browser->>User: Renders Results & Analytics View instantly
```

---

## 3. User Flow 2: Alphabet-by-Alphabet Curriculum & Mastery

*Objective: Progressive motor skill acquisition with real-time finger placement guidance.*

```mermaid
flowchart TD
    Start["User navigates to /learn"] --> SelectStage["Selects Stage (e.g., Home Row: F & J)"]
    SelectStage --> RenderLesson["Renders Virtual Keyboard & Finger Guide"]
    RenderLesson --> Drill["User executes repetition drill (e.g., 'fjfj ff jj')"]
    Drill --> CheckCriteria{"Test Completed:<br/>Accuracy >= 96% and WPM >= Target?"}
    
    CheckCriteria -- Yes --> IncrementMastery["Increment Key Mastery Score (+1 Attempt)"]
    IncrementMastery --> CheckTier{"Mastery >= 3 consecutive passes?"}
    CheckTier -- Yes --> UnlockNext["Status: 'MASTERED'<br/>Unlock Next Key Pair (e.g., D & K)"]
    CheckTier -- No --> ContinueTier["Status: 'LEARNING'<br/>Proceed to Stage Consolidation"]
    
    CheckCriteria -- No --> Remedial["Status: 'NEEDS IMPROVEMENT'<br/>Launch Target Key Remedial Exercise"]
    Remedial --> Drill
    UnlockNext --> SaveLocal["Persist progress to Local Storage / IndexedDB"]
```

---

## 4. User Flow 3: Guest-to-Account Migration Pipeline

*Objective: Securely transfer local client history into cloud storage without data loss or score falsification.*

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest User
    participant UI as Next.js Client
    participant IDB as Local IndexedDB
    participant Auth as NestJS Auth Guard
    participant API as NestJS Progress Service
    participant DB as PostgreSQL DB

    Guest->>UI: Completes 5th session. Clicks "Create Free Account"
    UI->>Auth: Completes OAuth (Google/GitHub) or Email Sign-up
    Auth-->>UI: Sets HTTP-Only JWT Cookie & returns User Profile
    UI->>IDB: Queries un-migrated records (`is_migrated == false`)
    IDB-->>UI: Returns array of local session objects (max 50)
    
    alt Local records exist
        UI->>UI: Prompts: "Found 8 local sessions. Sync to your new profile?"
        Guest->>UI: Clicks "Import My History"
        UI->>API: POST /api/v1/progress/migrate (Payload: Local Sessions Array)
        Note over API: Server-side validation of each record
        API->>API: Plausibility checks: WPM <= 280, Acc <= 100%, Valid Duration
        API->>API: Deduplication check via SHA-256(timestamp + duration + textSeed)
        API->>DB: Bulk insert validated test records into `typing_sessions`
        DB-->>API: Insertion confirmed (e.g., 8 inserted, 0 duplicates)
        API-->>UI: 200 OK { migratedCount: 8, skippedCount: 0 }
        UI->>IDB: Update local records: set `is_migrated = true`
        UI->>Guest: Displays success toast: "8 sessions successfully synced!"
    else No local records
        UI->>Guest: Navigates straight to fresh Dashboard
    end
```

---

## 5. User Flow 4: Weak-Key Diagnostics & Remedial Practice

*Objective: Close the loop between diagnostic performance measurement and targeted practice.*

```mermaid
flowchart LR
    A[Completed Test Analysis] --> B[Aggregate Per-Key Error & Latency]
    B --> C{Weak Keys Found?<br/>Accuracy < 90% or Latency > 2.5x Mean}
    C -- Yes --> D[Flag Top 3-5 Problem Keys e.g., 'B', 'P', 'X']
    D --> E[Display Interactive Heatmap on Results Page]
    E --> F[User clicks 'Practice Weak Keys']
    F --> G[Generate Dynamic Drill targeting identified keys & bigrams]
    G --> H[User completes Weak Key Drill]
    H --> I[Update Local/Cloud Key Diagnostics]
    C -- No --> J[Highlight 'Balanced Profile' & suggest higher WPM target]
```

---

## 6. User Flow 5: Daily Challenge & Competitive Anti-Cheat Validation

*Objective: Provide a fair, verifiable competitive test for global leaderboards.*

```mermaid
sequenceDiagram
    autonumber
    actor Typist as Competitive Typist
    participant UI as Client (Next.js)
    participant API as NestJS Contest Engine
    participant Redis as Redis Cache
    participant DB as PostgreSQL

    Typist->>UI: Navigates to /contests/daily-challenge
    UI->>API: POST /api/v1/contests/daily-challenge/start
    API->>Redis: Check rate limit & user eligibility
    API->>API: Generate cryptographically signed Challenge Token (JWT)
    API-->>UI: Returns { token, seedText, duration: 60, expiresAt }
    
    Note over Typist,UI: User types the daily challenge text
    UI->>UI: Captures per-keystroke timestamps [t0, t1, t2, ..., tn]
    
    Typist->>UI: Test completes
    UI->>API: POST /api/v1/contests/daily-challenge/submit
    Note over UI,API: Payload: { token, keystrokeTimingArray, finalWpm, accuracy }
    
    API->>API: Verify token signature and timestamp window
    API->>API: Validate Timing Telemetry:
    Note over API: Check: Standard deviation of IKI >= 5ms (no bot injection)<br/>Check: Duration within [60000ms, 63000ms]<br/>Check: WPM matches computed keystrokes
    
    alt Telemetry Valid
        API->>DB: Insert contest attempt & update leaderboard cache
        API-->>UI: 201 Created { rank: 14, percentile: 98.2% }
        UI->>Typist: Displays rank badge & share card
    else Plausibility Failed (Suspected Bot)
        API->>DB: Log suspicious attempt in `audit_moderation`
        API-->>UI: 422 Unprocessable Entity { error: "Validation anomaly detected." }
        UI->>Typist: Explains failure without revealing detection thresholds
    end
```

---

## 7. User Flow 6: Verifiable Certificate Generation & Public Lookup

*Objective: Provide authentic, professional typing speed certificates.*

```mermaid
sequenceDiagram
    autonumber
    actor User as Qualified Typist (WPM >= 40, Acc >= 95%)
    participant UI as Client (Next.js)
    participant API as NestJS Certificate Service
    participant DB as PostgreSQL
    actor Employer as Public / Employer / Verifier

    User->>UI: Completes qualifying 60s+ test. Clicks "Claim Certificate"
    UI->>API: POST /api/v1/certificates/issue
    API->>API: Verify session legitimacy from database record
    API->>API: Generate unique UUID v4 (e.g., `cert-8f3a-4b12...`)
    API->>DB: Store certificate record { id, userId, wpm, accuracy, date, testSessionId }
    API-->>UI: Returns { certificateId, verificationUrl, qrPayload }
    UI->>UI: Generates Vector PDF (via @react-pdf/renderer or client canvas)
    User->>User: Downloads printable PDF or copies public verification URL
    
    Note over Employer,API: Later: Employer verifies certificate
    Employer->>UI: Visits typingtyphon.com/verify/cert-8f3a-4b12
    UI->>API: GET /api/v1/certificates/verify/cert-8f3a-4b12
    API->>DB: Fetch certificate record
    DB-->>API: Record found & active
    API-->>UI: Returns verified metadata { candidateName, wpm, accuracy, issueDate }
    UI->>Employer: Displays Verified Badge with tamper-proof certificate details
```
