-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultStatus" "Status" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "idleTimeout" INTEGER NOT NULL DEFAULT 300000;
