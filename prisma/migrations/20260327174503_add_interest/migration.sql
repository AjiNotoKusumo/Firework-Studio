-- AlterTable
ALTER TABLE "user" ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
