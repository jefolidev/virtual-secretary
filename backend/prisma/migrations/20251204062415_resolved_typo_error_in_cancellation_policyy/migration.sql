/*
  Warnings:

  - You are about to drop the column `cancellation_pollicy_id` on the `professionals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cancellation_policy_id]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_cancellation_pollicy_id_fkey";

-- DropIndex
DROP INDEX "professionals_cancellation_pollicy_id_key";

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "cancellation_pollicy_id",
ADD COLUMN     "cancellation_policy_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "professionals_cancellation_policy_id_key" ON "professionals"("cancellation_policy_id");

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_cancellation_policy_id_fkey" FOREIGN KEY ("cancellation_policy_id") REFERENCES "cancellation_policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
