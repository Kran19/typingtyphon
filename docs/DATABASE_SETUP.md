# Typing Typhon — Database Setup, Migrations & Disaster Recovery Guide

**Document Version:** 1.0.0  
**Engine:** PostgreSQL 16 (Alpine) + Prisma ORM  
**Date:** October 2026  

---

## 1. Local Development Database Architecture

Typing Typhon uses a local containerized PostgreSQL 16 instance configured via `docker-compose.yml`.

### Port Mapping & Isolation
To prevent port collisions with other local databases or system services running on default port `5432`, Typing Typhon maps:
* **Host Port:** `5433`
* **Container Port:** `5432`
* **Isolated Volume:** `typingtyphon_postgres_data`

### Database Credentials
```ini
POSTGRES_USER=typhon_user
POSTGRES_PASSWORD=typhon_password_local_dev
POSTGRES_DB=typingtyphon_dev
```

### Connection URL
```ini
DATABASE_URL="postgresql://typhon_user:typhon_password_local_dev@localhost:5433/typingtyphon_dev?schema=public"
```

---

## 2. Setup & Migration Commands

### Step 1: Start PostgreSQL Container
```bash
docker compose up -d
```

### Step 2: Check Container Health
```bash
docker compose ps
# Verify status shows 'Up' and port mapped to 0.0.0.0:5433->5432/tcp
```

### Step 3: Run Database Migrations
```bash
npm run prisma:migrate --workspace=@typingtyphon/api
```

### Step 4: Generate Prisma Client
```bash
npm run prisma:generate --workspace=@typingtyphon/api
```

### Step 5: Verify Tables & Constraints
```bash
docker exec typingtyphon-postgres psql -U typhon_user -d typingtyphon_dev -c "\dt"
```

---

## 3. Disaster Recovery & Snapshot Verification

### Point-in-Time Dump (Backup)
```bash
docker exec typingtyphon-postgres pg_dump -U typhon_user -d typingtyphon_dev -F c -b -v -f /tmp/backup.dump
docker cp typingtyphon-postgres:/tmp/backup.dump ./backup.dump
```

### Database Restoration
```bash
docker cp ./backup.dump typingtyphon-postgres:/tmp/backup.dump
docker exec typingtyphon-postgres pg_restore -U typhon_user -d typingtyphon_dev -v -c /tmp/backup.dump
```

### Clean Database Reset (Development Only)
```bash
cd apps/api
npx prisma migrate reset --force
```
