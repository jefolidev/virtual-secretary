/*
  Warnings:

  - You are about to drop the column `fromMe` on the `messages` table. All the data in the column will be lost.
  - Added the required column `sender` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SenderEnum" AS ENUM ('USER', 'BOT');

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "fromMe",
ADD COLUMN     "intent_detected" TEXT,
ADD COLUMN     "sender" "SenderEnum" NOT NULL;
