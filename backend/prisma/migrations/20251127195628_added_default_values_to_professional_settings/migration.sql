/*
  Warnings:

  - You are about to drop the column `cancellation_policy_id` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the column `notification_settings_id` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_configuration_id` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cancellation_policy" ALTER COLUMN "min_hours_before_cancellation" SET DEFAULT 6,
ALTER COLUMN "min_days_before_next_appointment" SET DEFAULT 1,
ALTER COLUMN "cancellation_fee_percentage" SET DEFAULT 0.6,
ALTER COLUMN "allow_reschedule" SET DEFAULT false,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notification_settings" ALTER COLUMN "channels" SET DEFAULT ARRAY['EMAIL', 'WHATSAPP']::"NotificationChannel"[],
ALTER COLUMN "enabled_types" SET DEFAULT ARRAY['CONFIRMATION', 'CANCELLATION']::"NotificationType"[],
ALTER COLUMN "reminder_before_minutes" SET DEFAULT 10,
ALTER COLUMN "daily_summary_time" SET DEFAULT '12:00';

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "cancellation_policy_id",
DROP COLUMN "notification_settings_id",
DROP COLUMN "schedule_configuration_id";

-- AlterTable
ALTER TABLE "schedule_configuration" ALTER COLUMN "working_hours" DROP NOT NULL,
ALTER COLUMN "session_duration_minutes" SET DEFAULT 60,
ALTER COLUMN "buffer_interval_minutes" SET DEFAULT 10,
ALTER COLUMN "enable_google_meet" SET DEFAULT false;
