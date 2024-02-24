-- AlterTable
ALTER TABLE "User" ADD COLUMN     "guildId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
