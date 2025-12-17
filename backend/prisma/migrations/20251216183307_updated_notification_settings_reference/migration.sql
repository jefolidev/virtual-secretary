/*
  Warnings:

  - You are about to drop the column `notification_settings_id` on the `professionals` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "professionals_notification_settings_id_key";

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "notification_settings_id";
