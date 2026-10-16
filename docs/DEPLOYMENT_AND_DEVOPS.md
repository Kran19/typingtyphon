# Typing Typhon — DevOps, CI/CD & Deployment Architecture

**Document Version:** 1.0.0  
**Status:** Approved Infrastructure Baseline  
**Container Engine:** Docker / OCI Compliant  
**CI/CD Engine:** GitHub Actions  
**Edge / CDN:** Cloudflare  
**Date:** October 2026  

---

## 1. Environment Topology & Infrastructure Architecture

Typing Typhon maintains three isolated lifecycle environments to guarantee release stability:

```mermaid
graph TD
    Dev["1. Local Development (Docker Compose: Postgres 16 + Redis 7)"]
    Staging["2. Staging / Preview (Ephemeral Pull Request Environments)"]
    Prod["3. Production (Multi-AZ Managed Cloud Infrastructure)"]

    Dev -->|Git Push| Staging
    Staging -->|Merge to main & QA Signoff| Prod
```

| Component | Production Tier | Staging Tier | Local Development Tier |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15+ (Edge CDN + Node Server) | Vercel Preview / Container | `localhost:3000` |
| **Backend API** | NestJS 11+ Container (Multi-instance) | Single Container Replica | `localhost:4000` |
| **Relational Database** | Managed PostgreSQL 16 (Multi-AZ) | Managed Single-Node Postgres | Local Docker Container (`5432`) |
| **Cache & Ephemeral** | Managed Redis 7 (In-Memory Cluster) | Small Redis Instance | Local Docker Container (`6379`) |
| **Object Storage** | Cloudflare R2 / S3 (Certificates & Media)| S3 Bucket (Staging) | Local Mock Storage / MinIO |
| **Edge & CDN** | Cloudflare Enterprise / Pro (WAF, SSL) | Cloudflare Free / Direct | None |

---

## 2. Environment Variables & Secret Management

Secrets must never be checked into version control. Production secrets are injected via cloud key vaults (e.g., Doppler, AWS Secrets Manager, or GitHub Actions Environment Secrets).

### 2.1 Backend Environment Configuration (`.env.backend`)
```ini
# Runtime & Server
NODE_ENV=production
PORT=4000
API_PREFIX=/api/v1
CORS_ORIGIN=https://typingtyphon.com

# PostgreSQL Connection
DATABASE_URL=postgresql://app_user:StrongPassword@postgres-host:5432/typingtyphon_db?sslmode=require
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=25

# Redis
REDIS_URL=rediss://default:StrongRedisSecret@redis-host:6379

# Cryptography & JWT (Rotated periodically)
JWT_ACCESS_SECRET=super_secret_access_key_min_64_chars
JWT_REFRESH_SECRET=super_secret_refresh_key_min_64_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3

# Object Storage (PDFs & Certificate Assets)
R2_ACCOUNT_ID=cf_account_id
R2_ACCESS_KEY_ID=cf_access_key
R2_SECRET_ACCESS_KEY=cf_secret_key
R2_BUCKET_NAME=typingtyphon-certificates
R2_PUBLIC_URL=https://assets.typingtyphon.com

# Sentry Observability
SENTRY_DSN=https://xxxxxxxx@sentry.io/yyyyyy
```

### 2.2 Frontend Environment Configuration (`.env.frontend`)
```ini
NEXT_PUBLIC_APP_URL=https://typingtyphon.com
NEXT_PUBLIC_API_URL=https://api.typingtyphon.com/api/v1
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

---

## 3. Continuous Integration & Deployment (CI/CD)

```mermaid
flowchart TD
    Push[Code Push / Pull Request] --> Lint[Linting & TypeScript Checks]
    Lint --> UnitTests[Vitest Unit Test Suite]
    UnitTests --> IntTests[Supertest API Contract Tests]
    IntTests --> Build[Next.js & NestJS Docker Builds]
    Build --> E2ETests[Playwright End-to-End Suite]
    E2ETests --> Lighthouse[Lighthouse Core Web Vitals Gate]
    Lighthouse --> DeployPreview[Deploy Ephemeral Preview Environment]
    DeployPreview --> Merge[Merge to Main]
    Merge --> DeployProd[Rolling Zero-Downtime Production Deployment]
```

### 3.1 GitHub Actions Workflow Pipeline
1. **Lint & Typecheck:** Runs `eslint` and `tsc --noEmit` across both frontend and backend workspaces.
2. **Unit & Integration Testing:** Executes all tests in parallel with an ephemeral PostgreSQL/Redis service container.
3. **Container Build & Security Scan:** Builds multi-stage Docker images; runs Trivy vulnerability scanning.
4. **E2E Validation:** Boots services and runs headless Playwright tests.
5. **Production Promotion:** Deploys backend containers via rolling update (zero downtime) and updates frontend edge deployments.

---

## 4. Zero-Downtime Database Migration Protocol

All database schema evolutions must be **strictly backwards-compatible**:
1. **Expand-and-Contract Pattern:**
   * Step 1: Add new column or table (nullable or with default value).
   * Step 2: Deploy backend code that reads from both old and new schemas, writing to both.
   * Step 3: Run data backfill script.
   * Step 4: Deploy code that relies exclusively on the new schema.
   * Step 5: Drop obsolete column/table in subsequent release.
2. **Pre-Migration Safety Lock:** Migrations execute during the deploy pipeline using `prisma migrate deploy` or TypeORM CLI with transactional advisory locks to prevent concurrent execution.

---

## 5. Backup, Disaster Recovery & Observability

### 5.1 Disaster Recovery Standards
* **Recovery Point Objective (RPO):** $< 15\text{ minutes}$ (Automated continuous WAL archiving on PostgreSQL).
* **Recovery Time Objective (RTO):** $< 60\text{ minutes}$ (Automated redeployment via Docker images stored in container registry).
* **Daily Backups:** Encrypted full database dumps stored in cross-region S3 buckets with 30-day retention policies.

### 5.2 Observability & Uptime Monitoring
* **Error Tracking:** Sentry SDK initialized on both Next.js (client and SSR) and NestJS (backend exception filter).
* **Synthetic Health Monitoring:** Uptime monitoring pinging `/health/ready` every 60 seconds from multiple global regions with automated Slack/Discord escalation alerts.
