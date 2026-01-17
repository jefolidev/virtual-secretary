/*
  Warnings:

  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[whatsapp_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[thread_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `whatsapp_number` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phone",
ADD COLUMN     "thread_id" TEXT,
ADD COLUMN     "whatsapp_number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_number_key" ON "users"("whatsapp_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_thread_id_key" ON "users"("thread_id");
