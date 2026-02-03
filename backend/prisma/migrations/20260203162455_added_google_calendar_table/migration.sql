-- CreateTable
CREATE TABLE "google_calendar_tokens" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL DEFAULT 'Bearer',
    "expiry_date" BIGINT,
    "scope" TEXT,
    "google_account_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "google_calendar_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_tokens_professional_id_key" ON "google_calendar_tokens"("professional_id");

-- AddForeignKey
ALTER TABLE "google_calendar_tokens" ADD CONSTRAINT "google_calendar_tokens_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
