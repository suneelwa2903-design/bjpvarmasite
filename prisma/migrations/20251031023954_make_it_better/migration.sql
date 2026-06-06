-- CreateTable
CREATE TABLE "SlideshowSlide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NewsArticle_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MibUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "role" TEXT NOT NULL,
    "language" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MibTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNo" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "MibTicketAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MibTicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MibTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MibTicketEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MibTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MibTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MibTicketEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "MibUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MibTicketComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "bodyHtml" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MibTicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MibTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MibTicketComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "MibUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SlideshowSlide_order_idx" ON "SlideshowSlide"("order");

-- CreateIndex
CREATE INDEX "Initiative_type_idx" ON "Initiative"("type");

-- CreateIndex
CREATE INDEX "Initiative_date_idx" ON "Initiative"("date");

-- CreateIndex
CREATE INDEX "NewsArticle_initiativeId_idx" ON "NewsArticle"("initiativeId");

-- CreateIndex
CREATE INDEX "NewsArticle_order_idx" ON "NewsArticle"("order");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MibUser_email_key" ON "MibUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MibUser_mobile_key" ON "MibUser"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "MibTicket_ticketNo_key" ON "MibTicket"("ticketNo");

-- CreateIndex
CREATE INDEX "MibTicket_status_idx" ON "MibTicket"("status");

-- CreateIndex
CREATE INDEX "MibTicket_category_categoryType_idx" ON "MibTicket"("category", "categoryType");

-- CreateIndex
CREATE INDEX "MibTicket_district_idx" ON "MibTicket"("district");

-- CreateIndex
CREATE INDEX "MibTicketAttachment_ticketId_idx" ON "MibTicketAttachment"("ticketId");

-- CreateIndex
CREATE INDEX "MibTicketEvent_ticketId_idx" ON "MibTicketEvent"("ticketId");

-- CreateIndex
CREATE INDEX "MibTicketComment_ticketId_idx" ON "MibTicketComment"("ticketId");
