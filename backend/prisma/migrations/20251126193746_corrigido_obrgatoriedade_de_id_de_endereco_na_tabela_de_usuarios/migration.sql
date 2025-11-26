/*
  Warnings:

  - You are about to drop the column `addressId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_addressId_fkey";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "addressId";

-- CreateIndex
CREATE UNIQUE INDEX "addresses_user_id_key" ON "addresses"("user_id");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
