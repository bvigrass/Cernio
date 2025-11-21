-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "marketplace_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_sessions" (
    "id" TEXT NOT NULL,
    "marketplaceUserId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "marketplaceUserId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_users_email_key" ON "marketplace_users"("email");

-- CreateIndex
CREATE INDEX "marketplace_users_email_idx" ON "marketplace_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_sessions_refreshToken_key" ON "marketplace_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "marketplace_sessions_marketplaceUserId_idx" ON "marketplace_sessions"("marketplaceUserId");

-- CreateIndex
CREATE INDEX "marketplace_sessions_refreshToken_idx" ON "marketplace_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "orders_marketplaceUserId_idx" ON "orders"("marketplaceUserId");

-- CreateIndex
CREATE INDEX "orders_inventoryItemId_idx" ON "orders"("inventoryItemId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "marketplace_sessions" ADD CONSTRAINT "marketplace_sessions_marketplaceUserId_fkey" FOREIGN KEY ("marketplaceUserId") REFERENCES "marketplace_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_marketplaceUserId_fkey" FOREIGN KEY ("marketplaceUserId") REFERENCES "marketplace_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
