-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_organization_id_fkey";

-- AlterTable
ALTER TABLE "professionals" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
