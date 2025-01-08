/*
  Warnings:

  - Added the required column `userId` to the `Directory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Directory" ADD COLUMN     "files" TEXT[],
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_DirectoryToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DirectoryToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DirectoryToUser_B_index" ON "_DirectoryToUser"("B");

-- AddForeignKey
ALTER TABLE "_DirectoryToUser" ADD CONSTRAINT "_DirectoryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Directory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DirectoryToUser" ADD CONSTRAINT "_DirectoryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
