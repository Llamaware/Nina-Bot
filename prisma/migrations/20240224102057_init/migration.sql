/*
  Warnings:

  - The primary key for the `Guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

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
ALTER TABLE "Ban" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Guild_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "guildId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Warning" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
