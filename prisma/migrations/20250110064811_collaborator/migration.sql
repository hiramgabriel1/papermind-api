/*
  Warnings:

  - You are about to drop the `ChatCollaborators` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatCollaborators" DROP CONSTRAINT "ChatCollaborators_chatId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePic" TEXT;

-- DropTable
DROP TABLE "ChatCollaborators";

-- CreateTable
CREATE TABLE "Collaborators" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Collaborators_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Collaborators" ADD CONSTRAINT "Collaborators_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborators" ADD CONSTRAINT "Collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
