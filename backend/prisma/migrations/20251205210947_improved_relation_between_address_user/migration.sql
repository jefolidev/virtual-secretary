/*
  Warnings:

  - You are about to drop the column `user_id` on the `addresses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_user_id_fkey";

-- DropIndex
DROP INDEX "addresses_user_id_key";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "user_id";

-- CreateIndex
CREATE UNIQUE INDEX "users_address_id_key" ON "users"("address_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
