/*
  Warnings:

  - Added the required column `author` to the `Ban` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Ban` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `author` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Note` required. This step will fail if there are existing NULL values in that column.
  - Made the column `guildId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `author` to the `Warning` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Warning` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Ban" DROP CONSTRAINT "Ban_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_guildId_fkey";

-- DropForeignKey
ALTER TABLE "Warning" DROP CONSTRAINT "Warning_userId_fkey";

-- AlterTable
ALTER TABLE "Ban" ADD COLUMN     "author" TEXT NOT NULL,
ALTER COLUMN "reason" DROP NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "author" TEXT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "guildId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Warning" ADD COLUMN     "author" TEXT NOT NULL,
ALTER COLUMN "reason" DROP NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
