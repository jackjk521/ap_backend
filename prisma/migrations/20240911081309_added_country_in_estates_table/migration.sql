/*
  Warnings:

  - Added the required column `country_origin` to the `estates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estates" ADD COLUMN     "country_origin" VARCHAR(100) NOT NULL;
