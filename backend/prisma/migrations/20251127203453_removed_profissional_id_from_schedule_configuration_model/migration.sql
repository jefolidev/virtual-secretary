/*
  Warnings:

  - You are about to drop the column `professional_id` on the `schedule_configuration` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "schedule_configuration_professional_id_key";

-- AlterTable
ALTER TABLE "schedule_configuration" DROP COLUMN "professional_id";
