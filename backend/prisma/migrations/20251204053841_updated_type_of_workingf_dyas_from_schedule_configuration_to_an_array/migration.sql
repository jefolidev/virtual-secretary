/*
  Warnings:

  - The `working_days` column on the `schedule_configuration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `professionalId` to the `schedule_configuration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WeekDays" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterTable
ALTER TABLE "schedule_configuration" ADD COLUMN     "professionalId" TEXT NOT NULL,
DROP COLUMN "working_days",
ADD COLUMN     "working_days" "WeekDays"[];

-- DropEnum
DROP TYPE "WeekDay";

-- DropEnum
DROP TYPE "WorkingDays";
