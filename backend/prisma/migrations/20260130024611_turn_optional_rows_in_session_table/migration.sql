-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "current_flow" DROP NOT NULL,
ALTER COLUMN "current_step" DROP NOT NULL,
ALTER COLUMN "context_data" DROP NOT NULL,
ALTER COLUMN "started_at" DROP NOT NULL,
ALTER COLUMN "ended_at" DROP NOT NULL,
ALTER COLUMN "last_interaction_at" DROP NOT NULL;
