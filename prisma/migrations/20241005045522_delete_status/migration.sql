/*
  Warnings:

  - You are about to drop the column `defaultStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `idleTimeout` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "defaultStatus",
DROP COLUMN "idleTimeout",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "Status";
