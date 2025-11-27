/*
  Warnings:

  - You are about to drop the column `professional_id` on the `cancellation_policy` table. All the data in the column will be lost.
  - You are about to drop the column `professional_id` on the `notification_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notification_settings_id]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cancellation_pollicy_id]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schedule_configuration_id]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cancellation_policy" DROP CONSTRAINT "cancellation_policy_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "notification_settings" DROP CONSTRAINT "notification_settings_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "schedule_configuration" DROP CONSTRAINT "schedule_configuration_professional_id_fkey";

-- DropIndex
DROP INDEX "cancellation_policy_professional_id_key";

-- DropIndex
DROP INDEX "notification_settings_professional_id_key";

-- AlterTable
ALTER TABLE "cancellation_policy" DROP COLUMN "professional_id";

-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "professional_id";

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "cancellation_pollicy_id" TEXT,
ADD COLUMN     "notification_settings_id" TEXT,
ADD COLUMN     "schedule_configuration_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "professionals_notification_settings_id_key" ON "professionals"("notification_settings_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_cancellation_pollicy_id_key" ON "professionals"("cancellation_pollicy_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_schedule_configuration_id_key" ON "professionals"("schedule_configuration_id");

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_notification_settings_id_fkey" FOREIGN KEY ("notification_settings_id") REFERENCES "notification_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_cancellation_pollicy_id_fkey" FOREIGN KEY ("cancellation_pollicy_id") REFERENCES "cancellation_policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_schedule_configuration_id_fkey" FOREIGN KEY ("schedule_configuration_id") REFERENCES "schedule_configuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
