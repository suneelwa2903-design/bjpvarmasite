-- AlterTable
ALTER TABLE "MibTicket" ADD COLUMN "assignedToId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MibTicket_assignedToId_idx" ON "MibTicket"("assignedToId");

-- AddForeignKey
ALTER TABLE "MibTicket" ADD CONSTRAINT "MibTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "MibUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
