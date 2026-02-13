/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `whatsapp_contacts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `whatsapp_contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "whatsapp_contacts" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_contacts_phone_key" ON "whatsapp_contacts"("phone");
