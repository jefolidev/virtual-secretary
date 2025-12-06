/*
  Warnings:

  - A unique constraint covering the columns `[professional_id]` on the table `cancellation_policy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[professional_id]` on the table `notification_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_cancellation_policy_id_fkey";

-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_notification_settings_id_fkey";

-- AlterTable
ALTER TABLE "cancellation_policy" ADD COLUMN     "professional_id" TEXT;

-- AlterTable
ALTER TABLE "notification_settings" ADD COLUMN     "professional_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_policy_professional_id_key" ON "cancellation_policy"("professional_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_professional_id_key" ON "notification_settings"("professional_id");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_policy" ADD CONSTRAINT "cancellation_policy_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
