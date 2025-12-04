/*
  Warnings:

  - You are about to drop the column `professionalId` on the `cancellation_policy` table. All the data in the column will be lost.
  - You are about to drop the column `professionalId` on the `schedule_configuration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cancellation_policy" DROP COLUMN "professionalId";

-- AlterTable
ALTER TABLE "schedule_configuration" DROP COLUMN "professionalId";
