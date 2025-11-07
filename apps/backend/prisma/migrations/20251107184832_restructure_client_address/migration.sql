/*
  Warnings:

  - You are about to drop the column `billingAddress` on the `clients` table. All the data in the column will be lost.
  - Added the required column `city` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street1` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "billingAddress",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'United States',
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "street1" TEXT NOT NULL,
ADD COLUMN     "street2" TEXT;
