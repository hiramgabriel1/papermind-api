/*
  Warnings:

  - The `permissions` column on the `Collaborators` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Collaborators" DROP COLUMN "permissions",
ADD COLUMN     "permissions" BOOLEAN NOT NULL DEFAULT false;
