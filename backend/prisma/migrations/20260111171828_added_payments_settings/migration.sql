/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_itent_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[mercado_pago_account_id]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_reference` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "paymentStatus",
ADD COLUMN     "current_transaction_id" TIMESTAMP(3),
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "mercado_pago_account_id" TEXT;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "stripe_payment_itent_id",
ADD COLUMN     "external_reference" TEXT NOT NULL,
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "pix_copy_paste" TEXT,
ADD COLUMN     "pix_qr_code_url" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "professionals_mercado_pago_account_id_key" ON "professionals"("mercado_pago_account_id");
