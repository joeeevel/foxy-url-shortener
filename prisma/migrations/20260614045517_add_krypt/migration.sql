-- CreateTable
CREATE TABLE "KryptLink" (
    "id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KryptLink_pkey" PRIMARY KEY ("id")
);
