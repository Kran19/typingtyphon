-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typing_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionType" TEXT NOT NULL DEFAULT 'speed_test',
    "durationSeconds" INTEGER NOT NULL,
    "netWpm" DOUBLE PRECISION NOT NULL,
    "grossWpm" DOUBLE PRECISION NOT NULL,
    "accuracyPct" DOUBLE PRECISION NOT NULL,
    "totalKeystrokes" INTEGER NOT NULL,
    "correctKeystrokes" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'words',
    "textSeed" TEXT,
    "dedupHash" TEXT,
    "timeSeriesSummary" JSONB,
    "isGuestMigrated" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "typing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "certifiedWpm" DOUBLE PRECISION NOT NULL,
    "certifiedAccuracy" DOUBLE PRECISION NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "typing_sessions_dedupHash_key" ON "typing_sessions"("dedupHash");

-- CreateIndex
CREATE INDEX "typing_sessions_userId_completedAt_idx" ON "typing_sessions"("userId", "completedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateCode_key" ON "certificates"("certificateCode");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_sessionId_key" ON "certificates"("sessionId");

-- CreateIndex
CREATE INDEX "certificates_certificateCode_idx" ON "certificates"("certificateCode");

-- AddForeignKey
ALTER TABLE "typing_sessions" ADD CONSTRAINT "typing_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "typing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
