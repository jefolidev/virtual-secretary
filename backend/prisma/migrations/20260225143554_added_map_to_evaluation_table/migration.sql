/*
  Warnings:

  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_appointment_id_fkey";

-- DropTable
DROP TABLE "Evaluation";

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "appointment_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_appointment_id_key" ON "evaluations"("appointment_id");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
