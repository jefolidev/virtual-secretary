/*
  Warnings:

  - You are about to drop the column `commennt` on the `Evaluation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "commennt",
ADD COLUMN     "comment" TEXT;
