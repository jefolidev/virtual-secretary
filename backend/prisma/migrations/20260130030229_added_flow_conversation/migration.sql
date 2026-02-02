-- CreateEnum
CREATE TYPE "FlowStatus" AS ENUM ('ACTIVE', 'FINISHED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "flow_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "current_flow" TEXT,
    "current_step" TEXT,
    "context" TEXT NOT NULL,
    "status" "FlowStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "flow_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flow_sessions" ADD CONSTRAINT "flow_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_sessions" ADD CONSTRAINT "flow_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
