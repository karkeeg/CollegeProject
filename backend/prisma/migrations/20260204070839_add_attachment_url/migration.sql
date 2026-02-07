-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "attachment_url" TEXT;

-- AlterTable
ALTER TABLE "notices" ADD COLUMN     "attachment_url" TEXT;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "attachment_url" TEXT;
