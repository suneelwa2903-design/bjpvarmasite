-- CreateTable
CREATE TABLE "MibOtp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MibOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MibUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MibTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNo" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'PUBLIC',
    "applicantName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "language" TEXT,
    "category" TEXT NOT NULL,
    "categoryType" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "mandal" TEXT,
    "ward" TEXT,
    "pincode" TEXT,
    "subject" TEXT NOT NULL,
    "descriptionHtml" TEXT NOT NULL,
    "descriptionPlain" TEXT,
    "hasReference" BOOLEAN NOT NULL DEFAULT false,
    "refName" TEXT,
    "refPhone" TEXT,
    "refLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "slaDueAt" DATETIME,
    "closedAt" DATETIME,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MibTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "MibUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MibTicket" ("applicantName", "category", "categoryType", "closedAt", "createdAt", "createdById", "descriptionHtml", "descriptionPlain", "district", "email", "hasReference", "id", "language", "mandal", "mobile", "pincode", "priority", "refLocation", "refName", "refPhone", "slaDueAt", "state", "status", "subject", "ticketNo", "updatedAt", "ward") SELECT "applicantName", "category", "categoryType", "closedAt", "createdAt", "createdById", "descriptionHtml", "descriptionPlain", "district", "email", "hasReference", "id", "language", "mandal", "mobile", "pincode", "priority", "refLocation", "refName", "refPhone", "slaDueAt", "state", "status", "subject", "ticketNo", "updatedAt", "ward" FROM "MibTicket";
DROP TABLE "MibTicket";
ALTER TABLE "new_MibTicket" RENAME TO "MibTicket";
CREATE UNIQUE INDEX "MibTicket_ticketNo_key" ON "MibTicket"("ticketNo");
CREATE INDEX "MibTicket_status_idx" ON "MibTicket"("status");
CREATE INDEX "MibTicket_source_idx" ON "MibTicket"("source");
CREATE INDEX "MibTicket_category_categoryType_idx" ON "MibTicket"("category", "categoryType");
CREATE INDEX "MibTicket_district_idx" ON "MibTicket"("district");
CREATE TABLE "new_MibUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "role" TEXT NOT NULL,
    "language" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MibUser" ("active", "createdAt", "email", "id", "language", "mobile", "name", "role", "updatedAt") SELECT "active", "createdAt", "email", "id", "language", "mobile", "name", "role", "updatedAt" FROM "MibUser";
DROP TABLE "MibUser";
ALTER TABLE "new_MibUser" RENAME TO "MibUser";
CREATE UNIQUE INDEX "MibUser_email_key" ON "MibUser"("email");
CREATE UNIQUE INDEX "MibUser_mobile_key" ON "MibUser"("mobile");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MibOtp_userId_idx" ON "MibOtp"("userId");

-- CreateIndex
CREATE INDEX "MibOtp_purpose_idx" ON "MibOtp"("purpose");

-- CreateIndex
CREATE INDEX "MibOtp_expiresAt_idx" ON "MibOtp"("expiresAt");
