/*
  Warnings:

  - The `working_days` column on the `schedule_configuration` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "schedule_configuration" DROP COLUMN "working_days",
ADD COLUMN     "working_days" INTEGER[];
