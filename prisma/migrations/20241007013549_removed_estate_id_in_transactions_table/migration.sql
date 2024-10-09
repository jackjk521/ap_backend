/*
  Warnings:

  - You are about to drop the column `estatesId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_estatesId_fkey";

-- AlterTable
ALTER TABLE "feedbacks" ALTER COLUMN "solution_updates" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "estatesId",
ADD COLUMN     "estate_name" TEXT;
