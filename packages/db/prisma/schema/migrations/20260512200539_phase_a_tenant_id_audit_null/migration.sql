/*
  Warnings:

  - Added the required column `tenantId` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `LessonProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AuditLog_actorUserId_createdAt_idx";

-- DropIndex
DROP INDEX "Credential_workerId_deletedAt_idx";

-- DropIndex
DROP INDEX "Education_workerId_deletedAt_idx";

-- DropIndex
DROP INDEX "Experience_workerId_deletedAt_idx";

-- DropIndex
DROP INDEX "Lesson_courseId_deletedAt_idx";

-- DropIndex
DROP INDEX "LessonProgress_lessonId_idx";

-- DropIndex
DROP INDEX "Worker_deletedAt_idx";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Credential_tenantId_workerId_deletedAt_idx" ON "Credential"("tenantId", "workerId", "deletedAt");

-- CreateIndex
CREATE INDEX "Education_tenantId_workerId_deletedAt_idx" ON "Education"("tenantId", "workerId", "deletedAt");

-- CreateIndex
CREATE INDEX "Experience_tenantId_workerId_deletedAt_idx" ON "Experience"("tenantId", "workerId", "deletedAt");

-- CreateIndex
CREATE INDEX "Lesson_tenantId_courseId_deletedAt_idx" ON "Lesson"("tenantId", "courseId", "deletedAt");

-- CreateIndex
CREATE INDEX "LessonProgress_tenantId_lessonId_idx" ON "LessonProgress"("tenantId", "lessonId");

-- CreateIndex
CREATE INDEX "Worker_tenantId_deletedAt_idx" ON "Worker"("tenantId", "deletedAt");
