-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "emailVerifiedAt" DATETIME,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MibUser" ("active", "createdAt", "email", "id", "language", "mobile", "name", "passwordHash", "role", "twoFactorEnabled", "twoFactorSecret", "updatedAt") SELECT "active", "createdAt", "email", "id", "language", "mobile", "name", "passwordHash", "role", "twoFactorEnabled", "twoFactorSecret", "updatedAt" FROM "MibUser";
DROP TABLE "MibUser";
ALTER TABLE "new_MibUser" RENAME TO "MibUser";
CREATE UNIQUE INDEX "MibUser_email_key" ON "MibUser"("email");
CREATE UNIQUE INDEX "MibUser_mobile_key" ON "MibUser"("mobile");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
