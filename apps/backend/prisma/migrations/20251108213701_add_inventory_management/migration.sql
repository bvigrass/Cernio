-- CreateEnum
CREATE TYPE "InventoryItemType" AS ENUM ('MATERIAL', 'TOOL', 'SALVAGE');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('PURCHASED', 'IN_STOCK', 'CONSUMED', 'AVAILABLE', 'ASSIGNED', 'IN_USE', 'MAINTENANCE', 'EXTRACTED', 'AVAILABLE_FOR_SALE', 'LISTED', 'SOLD', 'SHIPPED');

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT,
    "type" "InventoryItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL,
    "supplier" TEXT,
    "purchaseCost" DECIMAL(12,2),
    "purchaseDate" TIMESTAMP(3),
    "materialCategory" TEXT,
    "ownership" TEXT,
    "rentalRate" DECIMAL(10,2),
    "rentalPeriod" TEXT,
    "maintenanceDate" TIMESTAMP(3),
    "serialNumber" TEXT,
    "condition" TEXT,
    "estimatedValue" DECIMAL(12,2),
    "reservePrice" DECIMAL(12,2),
    "dimensions" TEXT,
    "storageLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_photos" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_companyId_idx" ON "inventory_items"("companyId");

-- CreateIndex
CREATE INDEX "inventory_items_projectId_idx" ON "inventory_items"("projectId");

-- CreateIndex
CREATE INDEX "inventory_items_type_idx" ON "inventory_items"("type");

-- CreateIndex
CREATE INDEX "inventory_items_status_idx" ON "inventory_items"("status");

-- CreateIndex
CREATE INDEX "inventory_photos_inventoryItemId_idx" ON "inventory_photos"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_photos" ADD CONSTRAINT "inventory_photos_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
