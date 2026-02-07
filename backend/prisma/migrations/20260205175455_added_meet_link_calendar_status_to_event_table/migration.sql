-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "sync_with_google_calendar" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "calendar_events" ADD COLUMN     "google_meet_link" TEXT;
