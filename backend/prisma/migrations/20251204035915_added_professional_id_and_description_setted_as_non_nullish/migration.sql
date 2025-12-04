/*
  Warnings:

  - Added the required column `professionalId` to the `cancellation_policy` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `cancellation_policy` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_cancellation_pollicy_id_fkey";

-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_notification_settings_id_fkey";

-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_schedule_configuration_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_client_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_professional_id_fkey";

-- AlterTable
ALTER TABLE "cancellation_policy" ADD COLUMN     "professionalId" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_notification_settings_id_fkey" FOREIGN KEY ("notification_settings_id") REFERENCES "notification_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_cancellation_pollicy_id_fkey" FOREIGN KEY ("cancellation_pollicy_id") REFERENCES "cancellation_policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_schedule_configuration_id_fkey" FOREIGN KEY ("schedule_configuration_id") REFERENCES "schedule_configuration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
