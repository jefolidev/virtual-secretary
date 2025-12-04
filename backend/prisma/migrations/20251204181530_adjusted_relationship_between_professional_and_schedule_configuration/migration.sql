/*
  Warnings:

  - A unique constraint covering the columns `[professional_id]` on the table `schedule_configuration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `professional_id` to the `schedule_configuration` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_schedule_configuration_id_fkey";

-- AlterTable
ALTER TABLE "schedule_configuration" ADD COLUMN     "professional_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "schedule_configuration_professional_id_key" ON "schedule_configuration"("professional_id");

-- AddForeignKey
ALTER TABLE "schedule_configuration" ADD CONSTRAINT "schedule_configuration_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
