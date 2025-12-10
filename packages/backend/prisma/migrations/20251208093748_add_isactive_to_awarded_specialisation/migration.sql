-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "specialisationId" TEXT;

-- CreateTable
CREATE TABLE "Awarded" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseCategoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Awarded_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "awardedId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT,
    "supportingText" TEXT,
    "threeLineText" TEXT,
    "buttonType" TEXT,
    "buttonLink" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "courseCategory" TEXT,
    "gender" TEXT,
    "age" TEXT,
    "userGroup" TEXT,
    "dailyBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "estimatedUsers" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "advertiserStartDay" TIMESTAMP(3),
    "advertiserEndDay" TIMESTAMP(3),
    "dailyAllocation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "slotAllocation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hourlyAllocations" JSONB,
    "advertiserState" TEXT,
    "advertiserDistrict" TEXT,
    "advertiserLocation" TEXT,
    "advertiserSubject" TEXT,
    "advertiserGender" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Awarded_courseCategoryId_idx" ON "Awarded"("courseCategoryId");

-- CreateIndex
CREATE INDEX "Specialisation_awardedId_idx" ON "Specialisation"("awardedId");

-- CreateIndex
CREATE INDEX "AdCampaign_status_idx" ON "AdCampaign"("status");

-- CreateIndex
CREATE INDEX "AdCampaign_createdAt_idx" ON "AdCampaign"("createdAt");

-- CreateIndex
CREATE INDEX "Course_specialisationId_idx" ON "Course"("specialisationId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_specialisationId_fkey" FOREIGN KEY ("specialisationId") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Awarded" ADD CONSTRAINT "Awarded_courseCategoryId_fkey" FOREIGN KEY ("courseCategoryId") REFERENCES "CourseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialisation" ADD CONSTRAINT "Specialisation_awardedId_fkey" FOREIGN KEY ("awardedId") REFERENCES "Awarded"("id") ON DELETE CASCADE ON UPDATE CASCADE;
