-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "meetingType" TEXT DEFAULT 'ONLINE',
ADD COLUMN     "recruitmentQuota" INTEGER NOT NULL DEFAULT 0;
