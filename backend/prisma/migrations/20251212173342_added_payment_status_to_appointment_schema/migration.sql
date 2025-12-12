/*
  Warnings:

  - The values [PENDING_PAYMENT] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW', 'IN_PROGRESS', 'COMPLETED');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
