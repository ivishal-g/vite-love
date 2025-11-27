/*
  Warnings:

  - You are about to drop the column `explore` on the `Usage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usage" DROP COLUMN "explore",
ADD COLUMN     "expire" TIMESTAMP(3);
