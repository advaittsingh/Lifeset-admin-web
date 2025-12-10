-- CreateTable
CREATE TABLE "PersonalityQuiz" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalityQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personalityType" TEXT NOT NULL,
    "description" TEXT,
    "traits" JSONB,
    "recommendations" JSONB,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalityResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalityResult_userId_idx" ON "PersonalityResult"("userId");

-- CreateIndex
CREATE INDEX "PersonalityResult_createdAt_idx" ON "PersonalityResult"("createdAt");
