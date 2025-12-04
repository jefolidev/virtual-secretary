/*
  Warnings:

  - You are about to drop the column `working_hours` on the `schedule_configuration` table. All the data in the column will be lost.
  - Added the required column `work_end_hour` to the `schedule_configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_start_hour` to the `schedule_configuration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule_configuration" DROP COLUMN "working_hours",
ADD COLUMN     "work_end_hour" TEXT NOT NULL,
ADD COLUMN     "work_start_hour" TEXT NOT NULL;
