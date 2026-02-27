-- CreateEnum
CREATE TYPE "GoogleConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "googleConnectionStatus" "GoogleConnectionStatus" NOT NULL DEFAULT 'CONNECTED';
