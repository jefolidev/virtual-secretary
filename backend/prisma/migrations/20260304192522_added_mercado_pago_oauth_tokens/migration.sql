-- CreateEnum
CREATE TYPE "MercadoPagoConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "mercado_pago_connection_status" "MercadoPagoConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED';

-- CreateTable
CREATE TABLE "mercado_pago_tokens" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "public_key" TEXT,
    "mp_user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "mercado_pago_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mercado_pago_tokens_professional_id_key" ON "mercado_pago_tokens"("professional_id");

-- AddForeignKey
ALTER TABLE "mercado_pago_tokens" ADD CONSTRAINT "mercado_pago_tokens_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
