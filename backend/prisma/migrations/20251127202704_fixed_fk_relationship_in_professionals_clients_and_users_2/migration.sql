/*
  Warnings:

  - You are about to drop the column `user_id` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `professionals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_user_id_fkey";

-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_user_id_fkey";

-- DropIndex
DROP INDEX "clients_user_id_key";

-- DropIndex
DROP INDEX "professionals_user_id_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "user_id";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
