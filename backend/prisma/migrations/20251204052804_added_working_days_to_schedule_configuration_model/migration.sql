/*
  Warnings:

  - Added the required column `working_days` to the `schedule_configuration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkingDays" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- AlterTable
ALTER TABLE "schedule_configuration" ADD COLUMN     "working_days" "WorkingDays" NOT NULL;
