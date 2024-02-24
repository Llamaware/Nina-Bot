/*
  Warnings:

  - The primary key for the `Guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Guild` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `guildId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_guildId_fkey";

-- AlterTable
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Guild_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "guildId",
ADD COLUMN     "guildId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
