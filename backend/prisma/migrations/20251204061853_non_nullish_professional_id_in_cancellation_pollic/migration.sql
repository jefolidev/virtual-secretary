/*
  Warnings:

  - Made the column `professionalId` on table `cancellation_policy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cancellation_policy" ALTER COLUMN "professionalId" SET NOT NULL;
