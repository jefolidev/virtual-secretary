-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "total_elapsed_ms" BIGINT DEFAULT 0;
