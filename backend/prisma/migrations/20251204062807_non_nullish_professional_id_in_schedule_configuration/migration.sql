/*
  Warnings:

  - Made the column `professionalId` on table `schedule_configuration` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "schedule_configuration" ALTER COLUMN "professionalId" SET NOT NULL;
