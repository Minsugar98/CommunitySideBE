/*
  Warnings:

  - Made the column `Status` on table `ProjectApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProjectApplication" ALTER COLUMN "Status" SET NOT NULL;
