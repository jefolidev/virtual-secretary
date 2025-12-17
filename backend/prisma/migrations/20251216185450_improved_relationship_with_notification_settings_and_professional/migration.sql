/*
  Warnings:

  - You are about to drop the column `professional_id` on the `notification_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notification_settings_id]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "notification_settings" DROP CONSTRAINT "notification_settings_professional_id_fkey";

-- DropIndex
DROP INDEX "notification_settings_professional_id_key";

-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "professional_id";

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "notification_settings_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "professionals_notification_settings_id_key" ON "professionals"("notification_settings_id");

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_notification_settings_id_fkey" FOREIGN KEY ("notification_settings_id") REFERENCES "notification_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
