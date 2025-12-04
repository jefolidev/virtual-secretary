/*
  Warnings:

  - Changed the column `working_days` on the `schedule_configuration` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
-- COMANDO CORRIGIDO (Adicionando a cláusula USING)

CREATE TYPE "WeekDay" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');
ALTER TABLE "schedule_configuration" 
  ALTER COLUMN "working_days" 
  TYPE "WeekDay"[] 
  USING ARRAY[working_days::text]::"WeekDay"[];