
-- CreateTable
CREATE TABLE "SlideshowSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlideshowSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Initiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "role" TEXT NOT NULL,
    "language" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MibUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibTicket" (
    "id" TEXT NOT NULL,
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
    "slaDueAt" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MibTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MibOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MibSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibTicketAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MibTicketAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibTicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MibTicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MibTicketComment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "bodyHtml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MibTicketComment_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "MibTicket_source_idx" ON "MibTicket"("source");

-- CreateIndex
CREATE INDEX "MibTicket_category_categoryType_idx" ON "MibTicket"("category", "categoryType");

-- CreateIndex
CREATE INDEX "MibTicket_district_idx" ON "MibTicket"("district");

-- CreateIndex
CREATE INDEX "MibTicket_assignedToId_idx" ON "MibTicket"("assignedToId");

-- CreateIndex
CREATE INDEX "MibOtp_userId_idx" ON "MibOtp"("userId");

-- CreateIndex
CREATE INDEX "MibOtp_purpose_idx" ON "MibOtp"("purpose");

-- CreateIndex
CREATE INDEX "MibOtp_expiresAt_idx" ON "MibOtp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MibSetting_key_key" ON "MibSetting"("key");

-- CreateIndex
CREATE INDEX "MibTicketAttachment_ticketId_idx" ON "MibTicketAttachment"("ticketId");

-- CreateIndex
CREATE INDEX "MibTicketEvent_ticketId_idx" ON "MibTicketEvent"("ticketId");

-- CreateIndex
CREATE INDEX "MibTicketComment_ticketId_idx" ON "MibTicketComment"("ticketId");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicket" ADD CONSTRAINT "MibTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "MibUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicket" ADD CONSTRAINT "MibTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "MibUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibOtp" ADD CONSTRAINT "MibOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MibUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicketAttachment" ADD CONSTRAINT "MibTicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MibTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicketEvent" ADD CONSTRAINT "MibTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MibTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicketEvent" ADD CONSTRAINT "MibTicketEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "MibUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicketComment" ADD CONSTRAINT "MibTicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MibTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MibTicketComment" ADD CONSTRAINT "MibTicketComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "MibUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
┌─────────────────────────────────────────────────────────┐
│  Update available 6.18.0 -> 7.8.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

