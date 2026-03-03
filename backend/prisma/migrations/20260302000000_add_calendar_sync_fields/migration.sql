-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CALENDAR_SYNC_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'CALENDAR_SYNC_CANCELLED';

-- AlterTable
ALTER TABLE "google_calendar_tokens"
  ADD COLUMN "sync_token" TEXT,
  ADD COLUMN "watch_channel_id" TEXT,
  ADD COLUMN "watch_expiration" TIMESTAMP(3),
  ADD COLUMN "watch_resource_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_tokens_watch_channel_id_key" ON "google_calendar_tokens"("watch_channel_id");
