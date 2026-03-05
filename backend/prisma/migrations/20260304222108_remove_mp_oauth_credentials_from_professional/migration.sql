/*
  Warnings:

  - You are about to drop the column `mp_oauth_client_id` on the `professionals` table. All the data in the column will be lost.
  - You are about to drop the column `mp_oauth_client_secret` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "mp_oauth_client_id",
DROP COLUMN "mp_oauth_client_secret";
