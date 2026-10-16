# Typing Typhon — Environment & Domain Configuration Guide

## Architectural Principle: Strict Domain Independence

The public launch domain for Typing Typhon remains **UNDECIDED**. Under no circumstances should production domains (such as `typingtyphon.com` or any third-party vanity URL) be hardcoded into the application codebase. 

All public metadata, canonical URLs, Open Graph headers, social cards, sitemaps, and crawler directives resolve dynamically through centralized environment variables.

---

## Environment Variable Schema

### 1. Web Application (`apps/web/.env`)

| Variable Name | Required | Default / Fallback | Description & Security Policy |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | **Yes (Prod)** | `http://localhost:3000` | The fully qualified public origin of the frontend (e.g. `https://typingtyphon.example.org`). Strips trailing slashes automatically. Never commit production values. |
| `NEXT_PUBLIC_API_URL` | **Yes (Prod)** | `http://localhost:4001` | The public endpoint of the backend NestJS API. |
| `NEXT_PUBLIC_BLOCK_SEARCH_INDEXING` | No | `false` | When set to `true`, forces `robots.txt` to emit `Disallow: /` and sets `X-Robots-Tag: noindex, nofollow` on all metadata to prevent staging leaks. |
| `VERCEL_URL` | Auto | *None* | Automatically provided by Vercel on preview deployments; automatically treated as non-indexable preview staging. |
| `VERCEL_ENV` | Auto | *None* | In `preview` or `development`, search engine indexing is automatically blocked. |

### 2. API Backend (`apps/api/.env`)

| Variable Name | Required | Safe Development Value | Production Requirement |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://typhon_user:...@localhost:5433/typingtyphon_dev?schema=public` | Managed PostgreSQL connection string. Must use TLS/SSL (`sslmode=require`) in production. |
| `PORT` | No | `4001` | Port on which NestJS listens. |
| `CORS_ORIGIN` | **Yes** | `http://localhost:3000` | Explicit allowed origin for CORS. In production, must match the configured `NEXT_PUBLIC_SITE_URL`. Wildcards (`*`) are strictly prohibited. |
| `JWT_ACCESS_SECRET` | **Yes** | Placeholder dev secret | High-entropy cryptographic secret (minimum 32 characters, 256 bits). Rotated independently of refresh secret. |
| `JWT_REFRESH_SECRET` | **Yes** | Placeholder dev secret | High-entropy cryptographic secret for refresh token rotation and revocation. |

---

## Safe `.env.example` Templates

### `apps/web/.env.example`
```bash
# Public Site Base URL (Canonical URLs, Sitemap, Open Graph)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend NestJS API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:4001

# Crawler Indexing Blocker (Set to 'true' in staging/QA)
NEXT_PUBLIC_BLOCK_SEARCH_INDEXING=false
```

### `apps/api/.env.example`
```bash
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://typhon_user:dev_pass@localhost:5433/typingtyphon_dev?schema=public"

# Networking
PORT=4001
CORS_ORIGIN="http://localhost:3000"

# Cryptographic Tokens (Must be overridden in production)
JWT_ACCESS_SECRET="replace_with_min_32_char_cryptographic_secret_for_access"
JWT_REFRESH_SECRET="replace_with_min_32_char_cryptographic_secret_for_refresh"
```

---

## Deployment Environment Matrix

| Environment | Base URL Strategy | Search Engine Indexing | CORS Setting |
| :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:3000` | **Blocked** (`Disallow: /`) | `http://localhost:3000` |
| **Preview / Staging** | Automated preview URL (e.g. `*.vercel.app`) | **Blocked** (`Disallow: /`, `noindex, nofollow`) | Matching preview origin |
| **Production Launch** | Chosen final domain (`NEXT_PUBLIC_SITE_URL`) | **Allowed** (`Allow: /`, Sitemap active) | Strict single production origin |

---

## Domain Switching Procedure

When the final domain is chosen by project leadership:
1. Set `NEXT_PUBLIC_SITE_URL=https://<final-chosen-domain>` in the production environment provider (Vercel, AWS Amplify, Docker, etc.).
2. Set `CORS_ORIGIN=https://<final-chosen-domain>` in the API deployment provider.
3. Verify that `robots.txt` outputs `Allow: /` and links to `https://<final-chosen-domain>/sitemap.xml`.
4. **Zero application code edits are required.**
