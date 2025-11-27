/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cnpj` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "cnpj" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_cnpj_key" ON "organizations"("cnpj");
