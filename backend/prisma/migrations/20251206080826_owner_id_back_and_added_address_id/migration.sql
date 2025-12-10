/*
  Warnings:

  - Added the required column `addressId` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Made the column `ownerId` on table `organizations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "addressId" TEXT NOT NULL,
ALTER COLUMN "ownerId" SET NOT NULL;
