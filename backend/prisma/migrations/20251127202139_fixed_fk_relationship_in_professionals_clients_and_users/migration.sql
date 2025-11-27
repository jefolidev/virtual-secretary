/*
  Warnings:

  - You are about to drop the column `clientId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `professionalId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[professional_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_clientId_key";

-- DropIndex
DROP INDEX "users_professionalId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "clientId",
DROP COLUMN "professionalId",
ADD COLUMN     "client_id" TEXT,
ADD COLUMN     "professional_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_professional_id_key" ON "users"("professional_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_client_id_key" ON "users"("client_id");
