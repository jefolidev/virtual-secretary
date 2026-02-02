/*
  Warnings:

  - The `status` column on the `sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ConversationSessionStatus" AS ENUM ('ACTIVE', 'FINISHED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "status",
ADD COLUMN     "status" "ConversationSessionStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "user_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "SessionStatus";

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
