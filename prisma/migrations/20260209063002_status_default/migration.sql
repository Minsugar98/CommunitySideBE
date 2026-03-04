/*
  Warnings:

  - The `career` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "career",
ADD COLUMN     "career" INTEGER;
