/*
  Warnings:

  - Added the required column `fee_amount` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_payment_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_status` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_status_detail` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentTypeEvent" AS ENUM ('PAYMENT_CREATED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'PAYMENT_CANCELLED', 'PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK', 'PAYMENT_IN_MEDIATION');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "card_brand" TEXT,
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "fee_amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "last_four_digits" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "pix_expires_at" TIMESTAMP(3),
ADD COLUMN     "provider_payment_id" TEXT NOT NULL,
ADD COLUMN     "provider_status" TEXT NOT NULL,
ADD COLUMN     "provider_status_detail" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "external_refund_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "type" "PaymentTypeEvent" NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_event_id" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refunds_transaction_id_key" ON "refunds"("transaction_id");

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
