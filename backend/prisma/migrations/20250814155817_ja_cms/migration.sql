/*
  Warnings:

  - The values [AUTHOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ipAddress` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `referrer` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `newValues` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `oldValues` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `notifications` table. All the data in the column will be lost.
  - The `type` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `description` on the `settings` table. All the data in the column will be lost.
  - The `type` column on the `settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[path,date]` on the table `analytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,key]` on the table `user_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `target` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `location` on the `menus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Made the column `color` on table `tags` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `key` to the `user_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `user_settings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DashboardLayout" AS ENUM ('DEFAULT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('STATS_CARD', 'CHART', 'LIST', 'QUICK_ACTIONS', 'NOTIFICATIONS', 'ACTIVITY_FEED', 'SYSTEM_HEALTH', 'SECURITY_STATUS', 'REAL_TIME_VISITORS', 'TRAFFIC_SOURCES', 'DEVICE_BREAKDOWN', 'GEOGRAPHIC_DATA', 'CONTENT_PERFORMANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WidgetCategory" AS ENUM ('OVERVIEW', 'ANALYTICS', 'CONTENT', 'USERS', 'SYSTEM', 'SECURITY', 'CUSTOM');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_parentId_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_authorId_fkey";

-- DropIndex
DROP INDEX "menus_slug_key";

-- DropIndex
DROP INDEX "tags_name_key";

-- DropIndex
DROP INDEX "themes_name_key";

-- DropIndex
DROP INDEX "user_settings_userId_key";

-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "ipAddress",
DROP COLUMN "page",
DROP COLUMN "referrer",
DROP COLUMN "sessionId",
DROP COLUMN "timestamp",
DROP COLUMN "userAgent",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "entityId",
DROP COLUMN "entityType",
DROP COLUMN "newValues",
DROP COLUMN "oldValues",
ADD COLUMN     "changes" JSONB,
ADD COLUMN     "resource" TEXT NOT NULL,
ADD COLUMN     "resourceId" TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "image",
DROP COLUMN "order",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#6b7280',
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "isApproved",
DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "path";

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "cssClass" TEXT,
ALTER COLUMN "target" SET NOT NULL;

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "slug",
DROP COLUMN "location",
ADD COLUMN     "location" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "data",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'info';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "description",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'string';

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT '#6b7280';

-- AlterTable
ALTER TABLE "themes" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'dashboard';

-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "createdAt",
DROP COLUMN "emailNotifications",
DROP COLUMN "language",
DROP COLUMN "pushNotifications",
DROP COLUMN "theme",
DROP COLUMN "timezone",
DROP COLUMN "updatedAt",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- DropEnum
DROP TYPE "MenuLocation";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "SettingType";

-- CreateTable
CREATE TABLE "site_analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSessionTime" INTEGER NOT NULL DEFAULT 0,
    "newVisitors" INTEGER NOT NULL DEFAULT 0,
    "returningVisitors" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "sessionId" TEXT,
    "userId" TEXT,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "referrer" TEXT,
    "landingPage" TEXT,
    "exitPage" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_analytics" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "avgTimeOnPage" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "actionsCount" INTEGER NOT NULL DEFAULT 0,
    "postsCreated" INTEGER NOT NULL DEFAULT 0,
    "postsUpdated" INTEGER NOT NULL DEFAULT 0,
    "commentsPosted" INTEGER NOT NULL DEFAULT 0,
    "likesGiven" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "label" TEXT,
    "value" INTEGER,
    "userId" TEXT,
    "sessionId" TEXT,
    "path" TEXT,
    "properties" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "schedule" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "result" JSONB,
    "error" TEXT,
    "executedBy" TEXT,

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_rule_executions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "executionResult" JSONB NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_rule_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_gap_analyses" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "keyword" TEXT NOT NULL,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "opportunity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "competition" INTEGER NOT NULL DEFAULT 0,
    "existingContent" INTEGER NOT NULL DEFAULT 0,
    "recommendedType" TEXT NOT NULL DEFAULT 'article',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedTraffic" INTEGER NOT NULL DEFAULT 0,
    "estimatedRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_gap_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_gap_recommendations" (
    "id" TEXT NOT NULL,
    "gapAnalysisId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "targetKeywords" JSONB NOT NULL,
    "estimatedWordCount" INTEGER NOT NULL DEFAULT 1000,
    "estimatedTime" INTEGER NOT NULL DEFAULT 60,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_gap_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "categoryId" TEXT,
    "pageType" TEXT NOT NULL DEFAULT 'post',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT NOT NULL DEFAULT 'article',
    "twitterCard" TEXT NOT NULL DEFAULT 'summary',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "structuredData" JSONB,
    "metaRobots" TEXT NOT NULL DEFAULT 'index,follow',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_audits" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "categoryId" TEXT,
    "auditType" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "issues" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitemap_entries" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "changeFreq" TEXT NOT NULL DEFAULT 'weekly',
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitemap_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "endpoint" TEXT,
    "method" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_entries" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "ttl" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_logs" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userAgent" TEXT,
    "userId" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_threads" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "depth" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_votes" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "assignedTo" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedTo" TEXT,
    "comments" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "metadata" JSONB,
    "changes" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_locks" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "lockedBy" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "template" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_schedules" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_sessions" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionData" JSONB,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autosaved_content" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentData" JSONB NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autosaved_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_comments" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "positionData" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commentText" TEXT NOT NULL,

    CONSTRAINT "editor_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_usage_analytics" (
    "id" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "userId" TEXT,
    "contentId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_usage_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_analysis_cache" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "analysisResult" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_analysis_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "alt" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "folderId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "path" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_processing_jobs" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "parameters" JSONB NOT NULL,
    "inputPath" TEXT NOT NULL,
    "outputPath" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_cdn_cache" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "cdnUrl" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "lastHit" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_cdn_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_analytics" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "bandwidth" BIGINT NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "referrers" JSONB,
    "countries" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_upload_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalFiles" INTEGER NOT NULL,
    "uploadedFiles" INTEGER NOT NULL DEFAULT 0,
    "totalSize" BIGINT NOT NULL,
    "uploadedSize" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "folderId" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_upload_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_search_index" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "searchText" TEXT NOT NULL,
    "keywords" TEXT[],
    "lastIndexed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_search_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "metadata" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firewall_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHit" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firewall_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_lists" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHit" TIMESTAMP(3),
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "category" TEXT NOT NULL,
    "affectedSystems" JSONB,
    "timeline" JSONB,
    "assignedTo" TEXT,
    "reportedBy" TEXT,
    "resolvedBy" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_responses" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "executedBy" TEXT,
    "executedAt" TIMESTAMP(3),
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "location" TEXT,
    "device" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_configs" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "successItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "mapping" JSONB,
    "filePath" TEXT,
    "results" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "filters" JSONB,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "downloadUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_logs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "itemIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_logs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "itemIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "size" BIGINT,
    "location" TEXT,
    "storageType" TEXT NOT NULL,
    "compression" TEXT NOT NULL DEFAULT 'gzip',
    "encryption" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "checksum" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restore_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "backupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "selections" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restore_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "test" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "metrics" JSONB,
    "suggestions" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedBy" TEXT,

    CONSTRAINT "diagnostic_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "schedule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "config" JSONB,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "avgDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_executions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "output" TEXT,
    "error" TEXT,
    "triggeredBy" TEXT,

    CONSTRAINT "maintenance_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT NOT NULL,
    "authorEmail" TEXT,
    "website" TEXT,
    "repository" TEXT,
    "license" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "type" TEXT NOT NULL DEFAULT 'plugin',
    "category" TEXT,
    "config" JSONB,
    "manifest" JSONB NOT NULL,
    "dependencies" JSONB,
    "permissions" JSONB,
    "hooks" JSONB,
    "installPath" TEXT NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "installedBy" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_settings" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_hooks" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "hookName" TEXT NOT NULL,
    "callback" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_hooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_plugins" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorId" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalDownloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "screenshots" JSONB,
    "changelog" JSONB,
    "requirements" JSONB,
    "compatibility" JSONB,
    "downloadUrl" TEXT,
    "demoUrl" TEXT,
    "supportUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_reviews" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isHelpful" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_purchases" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "licenseKey" TEXT,
    "expiresAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plugin_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_hooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "parameters" JSONB,
    "returnType" TEXT,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_hooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hook_executions" (
    "id" TEXT NOT NULL,
    "hookName" TEXT NOT NULL,
    "pluginId" TEXT,
    "executionTime" DOUBLE PRECISION NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "parameters" JSONB,
    "result" JSONB,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hook_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_development" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "developerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'development',
    "version" TEXT NOT NULL DEFAULT '0.1.0',
    "repository" TEXT,
    "testResults" JSONB,
    "buildLogs" JSONB,
    "lastBuild" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_development_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "targets" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "results" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_issues" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "affectedComponents" JSONB,
    "recommendations" JSONB,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_profiles" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "metrics" JSONB NOT NULL,
    "traces" JSONB,
    "bottlenecks" JSONB,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_tracking" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB NOT NULL,
    "context" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "troubleshooting_solutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "applicableIssues" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "automatable" BOOLEAN NOT NULL DEFAULT false,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "requirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "troubleshooting_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_troubleshooting_history" (
    "id" TEXT NOT NULL,
    "issueId" TEXT,
    "solutionId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "appliedSolutions" JSONB,
    "results" JSONB,
    "duration" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_troubleshooting_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallScore" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "activeIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "criticalIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "performanceScore" INTEGER NOT NULL DEFAULT 100,
    "securityScore" INTEGER NOT NULL DEFAULT 100,
    "stabilityScore" INTEGER NOT NULL DEFAULT 100,
    "metrics" JSONB NOT NULL,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_alerts" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metric" TEXT,
    "threshold" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "conditions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_optimization_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targets" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "results" JSONB,
    "performance" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "database_optimization_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_metrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performanceMetrics" JSONB NOT NULL,
    "storageMetrics" JSONB NOT NULL,
    "connectionMetrics" JSONB NOT NULL,
    "replicationMetrics" JSONB,
    "lockMetrics" JSONB,
    "cacheMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "database_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slow_queries" (
    "id" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "sqlText" TEXT NOT NULL,
    "executionTime" DOUBLE PRECISION NOT NULL,
    "lockTime" DOUBLE PRECISION NOT NULL,
    "rowsExamined" INTEGER,
    "rowsSent" INTEGER,
    "database" TEXT,
    "userId" TEXT,
    "hostInfo" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slow_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_alerts" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "database_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_cleanup_history" (
    "id" TEXT NOT NULL,
    "cleanupType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "itemsCleaned" INTEGER NOT NULL DEFAULT 0,
    "spaceSaved" BIGINT NOT NULL DEFAULT 0,
    "details" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "executedBy" TEXT,

    CONSTRAINT "database_cleanup_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_analysis_cache" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL DEFAULT 'public',
    "analysisData" JSONB NOT NULL,
    "rowCount" BIGINT,
    "tableSize" BIGINT,
    "indexSize" BIGINT,
    "lastAnalyzed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_analysis_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection_pool_stats" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeConnections" INTEGER NOT NULL DEFAULT 0,
    "idleConnections" INTEGER NOT NULL DEFAULT 0,
    "totalConnections" INTEGER NOT NULL DEFAULT 0,
    "maxConnections" INTEGER NOT NULL DEFAULT 0,
    "connectionWaits" INTEGER NOT NULL DEFAULT 0,
    "averageWaitTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "poolUtilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_pool_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_performance_history" (
    "id" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionTime" DOUBLE PRECISION NOT NULL,
    "planHash" TEXT,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "indexesUsed" JSONB,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_performance_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev_projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "templateId" TEXT,
    "manifest" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" TEXT NOT NULL DEFAULT '0.1.0',
    "description" TEXT,
    "repository" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dev_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "suiteName" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "error" TEXT,
    "output" TEXT,
    "coverage" JSONB,
    "assertions" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_history" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "artifacts" JSONB,
    "duration" INTEGER,
    "size" BIGINT,
    "logs" TEXT,
    "error" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "build_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev_logs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" JSONB,
    "component" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dev_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hook_callbacks" (
    "id" TEXT NOT NULL,
    "hookName" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "callbackId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hook_callbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_api_endpoints" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "handlerName" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB,
    "responses" JSONB,
    "middleware" JSONB,
    "rateLimit" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_api_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hook_metrics" (
    "id" TEXT NOT NULL,
    "hookName" TEXT NOT NULL,
    "executionTime" DOUBLE PRECISION NOT NULL,
    "callbackCount" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "pluginId" TEXT,
    "context" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hook_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_request_logs" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT,
    "pluginId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_listeners" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "callbackId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "conditions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_listeners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_transactions" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "fees" DECIMAL(10,2),
    "netAmount" DECIMAL(10,2),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_licenses" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseKey" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "maxInstalls" INTEGER NOT NULL DEFAULT 1,
    "currentInstalls" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_downloads" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "userId" TEXT,
    "licenseId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plugin_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_stats" (
    "pluginId" TEXT NOT NULL,
    "downloadsTotal" INTEGER NOT NULL DEFAULT 0,
    "downloadsMonthly" INTEGER NOT NULL DEFAULT 0,
    "activeInstalls" INTEGER NOT NULL DEFAULT 0,
    "ratingAverage" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plugin_stats_pkey" PRIMARY KEY ("pluginId")
);

-- CreateTable
CREATE TABLE "review_votes" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDashboardPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layout" "DashboardLayout" NOT NULL DEFAULT 'DEFAULT',
    "theme" TEXT NOT NULL DEFAULT 'default',
    "widgets" JSONB NOT NULL,
    "layoutConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDashboardPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "WidgetType" NOT NULL,
    "category" "WidgetCategory" NOT NULL,
    "icon" TEXT,
    "component" TEXT NOT NULL,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWidget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "position" JSONB NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickAction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "href" TEXT,
    "action" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartDataCache" (
    "id" TEXT NOT NULL,
    "chartType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "filters" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChartDataCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSystemHealthMetric" (
    "id" TEXT NOT NULL,
    "storageUsed" BIGINT NOT NULL,
    "storageTotal" BIGINT NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "cpuUsage" DOUBLE PRECISION NOT NULL,
    "uptimeSeconds" BIGINT NOT NULL,
    "activeConnections" INTEGER NOT NULL,
    "databaseSize" BIGINT NOT NULL,
    "cacheHitRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardSystemHealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "layoutMode" TEXT NOT NULL DEFAULT 'default',
    "theme" TEXT NOT NULL DEFAULT 'neutral',
    "widgets" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "appearance" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "gridLayout" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaFileToMediaTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "site_analytics_date_key" ON "site_analytics"("date");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_timestamp_idx" ON "page_views"("timestamp");

-- CreateIndex
CREATE INDEX "page_views_userId_idx" ON "page_views"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_sessions_sessionId_key" ON "analytics_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_sessions_sessionId_idx" ON "analytics_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_sessions_userId_idx" ON "analytics_sessions"("userId");

-- CreateIndex
CREATE INDEX "analytics_sessions_startTime_idx" ON "analytics_sessions"("startTime");

-- CreateIndex
CREATE INDEX "content_analytics_contentType_idx" ON "content_analytics"("contentType");

-- CreateIndex
CREATE INDEX "content_analytics_date_idx" ON "content_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "content_analytics_contentId_contentType_date_key" ON "content_analytics"("contentId", "contentType", "date");

-- CreateIndex
CREATE INDEX "user_analytics_date_idx" ON "user_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "user_analytics_userId_date_key" ON "user_analytics"("userId", "date");

-- CreateIndex
CREATE INDEX "analytics_events_eventName_idx" ON "analytics_events"("eventName");

-- CreateIndex
CREATE INDEX "analytics_events_category_idx" ON "analytics_events"("category");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE INDEX "reports_createdBy_idx" ON "reports"("createdBy");

-- CreateIndex
CREATE INDEX "report_executions_reportId_idx" ON "report_executions"("reportId");

-- CreateIndex
CREATE INDEX "report_executions_status_idx" ON "report_executions"("status");

-- CreateIndex
CREATE INDEX "report_executions_startTime_idx" ON "report_executions"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "category_templates_slug_key" ON "category_templates"("slug");

-- CreateIndex
CREATE INDEX "category_rules_categoryId_idx" ON "category_rules"("categoryId");

-- CreateIndex
CREATE INDEX "category_rules_isActive_idx" ON "category_rules"("isActive");

-- CreateIndex
CREATE INDEX "category_rules_priority_idx" ON "category_rules"("priority");

-- CreateIndex
CREATE INDEX "category_rule_executions_ruleId_idx" ON "category_rule_executions"("ruleId");

-- CreateIndex
CREATE INDEX "category_rule_executions_postId_idx" ON "category_rule_executions"("postId");

-- CreateIndex
CREATE INDEX "category_rule_executions_executedAt_idx" ON "category_rule_executions"("executedAt");

-- CreateIndex
CREATE INDEX "content_gap_analyses_categoryId_idx" ON "content_gap_analyses"("categoryId");

-- CreateIndex
CREATE INDEX "content_gap_analyses_keyword_idx" ON "content_gap_analyses"("keyword");

-- CreateIndex
CREATE INDEX "content_gap_analyses_priority_idx" ON "content_gap_analyses"("priority");

-- CreateIndex
CREATE INDEX "content_gap_analyses_analysisDate_idx" ON "content_gap_analyses"("analysisDate");

-- CreateIndex
CREATE INDEX "content_gap_recommendations_gapAnalysisId_idx" ON "content_gap_recommendations"("gapAnalysisId");

-- CreateIndex
CREATE INDEX "content_gap_recommendations_status_idx" ON "content_gap_recommendations"("status");

-- CreateIndex
CREATE INDEX "content_gap_recommendations_priority_idx" ON "content_gap_recommendations"("priority");

-- CreateIndex
CREATE INDEX "seo_metadata_postId_idx" ON "seo_metadata"("postId");

-- CreateIndex
CREATE INDEX "seo_metadata_categoryId_idx" ON "seo_metadata"("categoryId");

-- CreateIndex
CREATE INDEX "seo_metadata_pageType_idx" ON "seo_metadata"("pageType");

-- CreateIndex
CREATE INDEX "seo_audits_postId_idx" ON "seo_audits"("postId");

-- CreateIndex
CREATE INDEX "seo_audits_categoryId_idx" ON "seo_audits"("categoryId");

-- CreateIndex
CREATE INDEX "seo_audits_auditType_idx" ON "seo_audits"("auditType");

-- CreateIndex
CREATE INDEX "seo_audits_auditDate_idx" ON "seo_audits"("auditDate");

-- CreateIndex
CREATE INDEX "sitemap_entries_url_idx" ON "sitemap_entries"("url");

-- CreateIndex
CREATE INDEX "sitemap_entries_pageType_idx" ON "sitemap_entries"("pageType");

-- CreateIndex
CREATE INDEX "sitemap_entries_isActive_idx" ON "sitemap_entries"("isActive");

-- CreateIndex
CREATE INDEX "performance_metrics_metricType_idx" ON "performance_metrics"("metricType");

-- CreateIndex
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "performance_metrics_endpoint_idx" ON "performance_metrics"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "cache_entries_key_key" ON "cache_entries"("key");

-- CreateIndex
CREATE INDEX "cache_entries_key_idx" ON "cache_entries"("key");

-- CreateIndex
CREATE INDEX "cache_entries_expiresAt_idx" ON "cache_entries"("expiresAt");

-- CreateIndex
CREATE INDEX "rate_limit_logs_ipAddress_idx" ON "rate_limit_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "rate_limit_logs_timestamp_idx" ON "rate_limit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "rate_limit_logs_endpoint_idx" ON "rate_limit_logs"("endpoint");

-- CreateIndex
CREATE INDEX "comment_threads_postId_idx" ON "comment_threads"("postId");

-- CreateIndex
CREATE INDEX "comment_threads_parentId_idx" ON "comment_threads"("parentId");

-- CreateIndex
CREATE INDEX "comment_threads_path_idx" ON "comment_threads"("path");

-- CreateIndex
CREATE INDEX "comment_threads_status_idx" ON "comment_threads"("status");

-- CreateIndex
CREATE UNIQUE INDEX "comment_votes_commentId_userId_key" ON "comment_votes"("commentId", "userId");

-- CreateIndex
CREATE INDEX "workflow_instances_workflowId_idx" ON "workflow_instances"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_instances_contentId_contentType_idx" ON "workflow_instances"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_steps_status_idx" ON "workflow_steps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_steps_instanceId_stepNumber_key" ON "workflow_steps"("instanceId", "stepNumber");

-- CreateIndex
CREATE INDEX "content_revisions_contentId_contentType_idx" ON "content_revisions"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "content_revisions_createdAt_idx" ON "content_revisions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_revisions_contentId_contentType_version_key" ON "content_revisions"("contentId", "contentType", "version");

-- CreateIndex
CREATE INDEX "content_locks_expiresAt_idx" ON "content_locks"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_locks_contentId_contentType_key" ON "content_locks"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "content_templates_type_idx" ON "content_templates"("type");

-- CreateIndex
CREATE INDEX "content_templates_isActive_idx" ON "content_templates"("isActive");

-- CreateIndex
CREATE INDEX "content_schedules_scheduledAt_idx" ON "content_schedules"("scheduledAt");

-- CreateIndex
CREATE INDEX "content_schedules_status_idx" ON "content_schedules"("status");

-- CreateIndex
CREATE UNIQUE INDEX "content_schedules_contentId_contentType_action_key" ON "content_schedules"("contentId", "contentType", "action");

-- CreateIndex
CREATE INDEX "content_authorId_idx" ON "content"("authorId");

-- CreateIndex
CREATE INDEX "content_type_idx" ON "content"("type");

-- CreateIndex
CREATE INDEX "content_status_idx" ON "content"("status");

-- CreateIndex
CREATE INDEX "content_createdAt_idx" ON "content"("createdAt");

-- CreateIndex
CREATE INDEX "editor_sessions_contentId_idx" ON "editor_sessions"("contentId");

-- CreateIndex
CREATE INDEX "editor_sessions_userId_idx" ON "editor_sessions"("userId");

-- CreateIndex
CREATE INDEX "editor_sessions_lastActivity_idx" ON "editor_sessions"("lastActivity");

-- CreateIndex
CREATE INDEX "autosaved_content_contentId_idx" ON "autosaved_content"("contentId");

-- CreateIndex
CREATE INDEX "autosaved_content_userId_idx" ON "autosaved_content"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "autosaved_content_contentId_userId_key" ON "autosaved_content"("contentId", "userId");

-- CreateIndex
CREATE INDEX "editor_comments_contentId_idx" ON "editor_comments"("contentId");

-- CreateIndex
CREATE INDEX "editor_comments_userId_idx" ON "editor_comments"("userId");

-- CreateIndex
CREATE INDEX "editor_comments_resolved_idx" ON "editor_comments"("resolved");

-- CreateIndex
CREATE INDEX "block_usage_analytics_blockType_idx" ON "block_usage_analytics"("blockType");

-- CreateIndex
CREATE INDEX "block_usage_analytics_date_idx" ON "block_usage_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "block_usage_analytics_blockType_userId_date_key" ON "block_usage_analytics"("blockType", "userId", "date");

-- CreateIndex
CREATE INDEX "content_analysis_cache_contentHash_idx" ON "content_analysis_cache"("contentHash");

-- CreateIndex
CREATE INDEX "content_analysis_cache_expiresAt_idx" ON "content_analysis_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_analysis_cache_contentHash_analysisType_key" ON "content_analysis_cache"("contentHash", "analysisType");

-- CreateIndex
CREATE INDEX "media_files_folderId_idx" ON "media_files"("folderId");

-- CreateIndex
CREATE INDEX "media_files_mimeType_idx" ON "media_files"("mimeType");

-- CreateIndex
CREATE INDEX "media_files_uploadedBy_idx" ON "media_files"("uploadedBy");

-- CreateIndex
CREATE INDEX "media_files_processingStatus_idx" ON "media_files"("processingStatus");

-- CreateIndex
CREATE INDEX "media_folders_path_idx" ON "media_folders"("path");

-- CreateIndex
CREATE INDEX "media_folders_createdBy_idx" ON "media_folders"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "media_folders_parentId_slug_key" ON "media_folders"("parentId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_name_key" ON "media_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "media_tags_slug_key" ON "media_tags"("slug");

-- CreateIndex
CREATE INDEX "media_processing_jobs_mediaId_idx" ON "media_processing_jobs"("mediaId");

-- CreateIndex
CREATE INDEX "media_processing_jobs_status_idx" ON "media_processing_jobs"("status");

-- CreateIndex
CREATE INDEX "media_processing_jobs_type_idx" ON "media_processing_jobs"("type");

-- CreateIndex
CREATE INDEX "media_cdn_cache_expiresAt_idx" ON "media_cdn_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "media_cdn_cache_isActive_idx" ON "media_cdn_cache"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "media_cdn_cache_mediaId_region_key" ON "media_cdn_cache"("mediaId", "region");

-- CreateIndex
CREATE INDEX "media_analytics_date_idx" ON "media_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "media_analytics_mediaId_date_key" ON "media_analytics"("mediaId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "media_upload_sessions_sessionId_key" ON "media_upload_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "media_upload_sessions_userId_idx" ON "media_upload_sessions"("userId");

-- CreateIndex
CREATE INDEX "media_upload_sessions_status_idx" ON "media_upload_sessions"("status");

-- CreateIndex
CREATE INDEX "media_upload_sessions_expiresAt_idx" ON "media_upload_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "media_search_index_mediaId_key" ON "media_search_index"("mediaId");

-- CreateIndex
CREATE INDEX "media_search_index_keywords_idx" ON "media_search_index"("keywords");

-- CreateIndex
CREATE INDEX "security_events_type_idx" ON "security_events"("type");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_ipAddress_idx" ON "security_events"("ipAddress");

-- CreateIndex
CREATE INDEX "security_events_userId_idx" ON "security_events"("userId");

-- CreateIndex
CREATE INDEX "security_events_createdAt_idx" ON "security_events"("createdAt");

-- CreateIndex
CREATE INDEX "firewall_rules_type_idx" ON "firewall_rules"("type");

-- CreateIndex
CREATE INDEX "firewall_rules_priority_idx" ON "firewall_rules"("priority");

-- CreateIndex
CREATE INDEX "firewall_rules_isActive_idx" ON "firewall_rules"("isActive");

-- CreateIndex
CREATE INDEX "ip_lists_type_idx" ON "ip_lists"("type");

-- CreateIndex
CREATE INDEX "ip_lists_isActive_idx" ON "ip_lists"("isActive");

-- CreateIndex
CREATE INDEX "ip_lists_expiresAt_idx" ON "ip_lists"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ip_lists_ipAddress_type_key" ON "ip_lists"("ipAddress", "type");

-- CreateIndex
CREATE INDEX "security_incidents_severity_idx" ON "security_incidents"("severity");

-- CreateIndex
CREATE INDEX "security_incidents_status_idx" ON "security_incidents"("status");

-- CreateIndex
CREATE INDEX "security_incidents_category_idx" ON "security_incidents"("category");

-- CreateIndex
CREATE INDEX "security_incidents_assignedTo_idx" ON "security_incidents"("assignedTo");

-- CreateIndex
CREATE INDEX "incident_responses_incidentId_idx" ON "incident_responses"("incidentId");

-- CreateIndex
CREATE INDEX "incident_responses_status_idx" ON "incident_responses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "active_sessions_sessionId_key" ON "active_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "active_sessions_userId_idx" ON "active_sessions"("userId");

-- CreateIndex
CREATE INDEX "active_sessions_isActive_idx" ON "active_sessions"("isActive");

-- CreateIndex
CREATE INDEX "active_sessions_expiresAt_idx" ON "active_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "password_history_userId_idx" ON "password_history"("userId");

-- CreateIndex
CREATE INDEX "password_history_createdAt_idx" ON "password_history"("createdAt");

-- CreateIndex
CREATE INDEX "login_attempts_email_idx" ON "login_attempts"("email");

-- CreateIndex
CREATE INDEX "login_attempts_ipAddress_idx" ON "login_attempts"("ipAddress");

-- CreateIndex
CREATE INDEX "login_attempts_success_idx" ON "login_attempts"("success");

-- CreateIndex
CREATE INDEX "login_attempts_createdAt_idx" ON "login_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "security_configs_category_idx" ON "security_configs"("category");

-- CreateIndex
CREATE INDEX "security_configs_isActive_idx" ON "security_configs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "security_configs_category_key_key" ON "security_configs"("category", "key");

-- CreateIndex
CREATE INDEX "import_jobs_type_idx" ON "import_jobs"("type");

-- CreateIndex
CREATE INDEX "import_jobs_status_idx" ON "import_jobs"("status");

-- CreateIndex
CREATE INDEX "import_jobs_createdBy_idx" ON "import_jobs"("createdBy");

-- CreateIndex
CREATE INDEX "export_jobs_type_idx" ON "export_jobs"("type");

-- CreateIndex
CREATE INDEX "export_jobs_status_idx" ON "export_jobs"("status");

-- CreateIndex
CREATE INDEX "export_jobs_createdBy_idx" ON "export_jobs"("createdBy");

-- CreateIndex
CREATE INDEX "export_jobs_expiresAt_idx" ON "export_jobs"("expiresAt");

-- CreateIndex
CREATE INDEX "import_logs_jobId_idx" ON "import_logs"("jobId");

-- CreateIndex
CREATE INDEX "import_logs_level_idx" ON "import_logs"("level");

-- CreateIndex
CREATE INDEX "export_logs_jobId_idx" ON "export_logs"("jobId");

-- CreateIndex
CREATE INDEX "export_logs_level_idx" ON "export_logs"("level");

-- CreateIndex
CREATE INDEX "backup_jobs_type_idx" ON "backup_jobs"("type");

-- CreateIndex
CREATE INDEX "backup_jobs_status_idx" ON "backup_jobs"("status");

-- CreateIndex
CREATE INDEX "backup_jobs_createdBy_idx" ON "backup_jobs"("createdBy");

-- CreateIndex
CREATE INDEX "backup_jobs_expiresAt_idx" ON "backup_jobs"("expiresAt");

-- CreateIndex
CREATE INDEX "restore_jobs_backupId_idx" ON "restore_jobs"("backupId");

-- CreateIndex
CREATE INDEX "restore_jobs_status_idx" ON "restore_jobs"("status");

-- CreateIndex
CREATE INDEX "restore_jobs_createdBy_idx" ON "restore_jobs"("createdBy");

-- CreateIndex
CREATE INDEX "diagnostic_results_category_idx" ON "diagnostic_results"("category");

-- CreateIndex
CREATE INDEX "diagnostic_results_status_idx" ON "diagnostic_results"("status");

-- CreateIndex
CREATE INDEX "diagnostic_results_severity_idx" ON "diagnostic_results"("severity");

-- CreateIndex
CREATE INDEX "diagnostic_results_executedAt_idx" ON "diagnostic_results"("executedAt");

-- CreateIndex
CREATE INDEX "maintenance_tasks_type_idx" ON "maintenance_tasks"("type");

-- CreateIndex
CREATE INDEX "maintenance_tasks_status_idx" ON "maintenance_tasks"("status");

-- CreateIndex
CREATE INDEX "maintenance_tasks_nextRun_idx" ON "maintenance_tasks"("nextRun");

-- CreateIndex
CREATE INDEX "maintenance_tasks_isActive_idx" ON "maintenance_tasks"("isActive");

-- CreateIndex
CREATE INDEX "maintenance_executions_taskId_idx" ON "maintenance_executions"("taskId");

-- CreateIndex
CREATE INDEX "maintenance_executions_status_idx" ON "maintenance_executions"("status");

-- CreateIndex
CREATE INDEX "maintenance_executions_startedAt_idx" ON "maintenance_executions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "plugins_slug_key" ON "plugins"("slug");

-- CreateIndex
CREATE INDEX "plugins_status_idx" ON "plugins"("status");

-- CreateIndex
CREATE INDEX "plugins_type_idx" ON "plugins"("type");

-- CreateIndex
CREATE INDEX "plugins_category_idx" ON "plugins"("category");

-- CreateIndex
CREATE INDEX "plugin_settings_pluginId_idx" ON "plugin_settings"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_settings_pluginId_key_key" ON "plugin_settings"("pluginId", "key");

-- CreateIndex
CREATE INDEX "plugin_hooks_hookName_idx" ON "plugin_hooks"("hookName");

-- CreateIndex
CREATE INDEX "plugin_hooks_priority_idx" ON "plugin_hooks"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_hooks_pluginId_hookName_callback_key" ON "plugin_hooks"("pluginId", "hookName", "callback");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_plugins_slug_key" ON "marketplace_plugins"("slug");

-- CreateIndex
CREATE INDEX "marketplace_plugins_category_idx" ON "marketplace_plugins"("category");

-- CreateIndex
CREATE INDEX "marketplace_plugins_status_idx" ON "marketplace_plugins"("status");

-- CreateIndex
CREATE INDEX "marketplace_plugins_featured_idx" ON "marketplace_plugins"("featured");

-- CreateIndex
CREATE INDEX "marketplace_plugins_rating_idx" ON "marketplace_plugins"("rating");

-- CreateIndex
CREATE INDEX "plugin_reviews_pluginId_idx" ON "plugin_reviews"("pluginId");

-- CreateIndex
CREATE INDEX "plugin_reviews_rating_idx" ON "plugin_reviews"("rating");

-- CreateIndex
CREATE INDEX "plugin_reviews_status_idx" ON "plugin_reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_reviews_pluginId_userId_key" ON "plugin_reviews"("pluginId", "userId");

-- CreateIndex
CREATE INDEX "plugin_purchases_userId_idx" ON "plugin_purchases"("userId");

-- CreateIndex
CREATE INDEX "plugin_purchases_status_idx" ON "plugin_purchases"("status");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_purchases_pluginId_userId_key" ON "plugin_purchases"("pluginId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "system_hooks_name_key" ON "system_hooks"("name");

-- CreateIndex
CREATE INDEX "system_hooks_type_idx" ON "system_hooks"("type");

-- CreateIndex
CREATE INDEX "system_hooks_isActive_idx" ON "system_hooks"("isActive");

-- CreateIndex
CREATE INDEX "hook_executions_hookName_idx" ON "hook_executions"("hookName");

-- CreateIndex
CREATE INDEX "hook_executions_pluginId_idx" ON "hook_executions"("pluginId");

-- CreateIndex
CREATE INDEX "hook_executions_executedAt_idx" ON "hook_executions"("executedAt");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_development_slug_key" ON "plugin_development"("slug");

-- CreateIndex
CREATE INDEX "plugin_development_developerId_idx" ON "plugin_development"("developerId");

-- CreateIndex
CREATE INDEX "plugin_development_status_idx" ON "plugin_development"("status");

-- CreateIndex
CREATE INDEX "diagnostic_jobs_type_idx" ON "diagnostic_jobs"("type");

-- CreateIndex
CREATE INDEX "diagnostic_jobs_status_idx" ON "diagnostic_jobs"("status");

-- CreateIndex
CREATE INDEX "diagnostic_jobs_createdBy_idx" ON "diagnostic_jobs"("createdBy");

-- CreateIndex
CREATE INDEX "system_issues_type_idx" ON "system_issues"("type");

-- CreateIndex
CREATE INDEX "system_issues_severity_idx" ON "system_issues"("severity");

-- CreateIndex
CREATE INDEX "system_issues_status_idx" ON "system_issues"("status");

-- CreateIndex
CREATE INDEX "system_issues_jobId_idx" ON "system_issues"("jobId");

-- CreateIndex
CREATE INDEX "performance_profiles_timestamp_idx" ON "performance_profiles"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "error_tracking_trackingId_key" ON "error_tracking"("trackingId");

-- CreateIndex
CREATE INDEX "error_tracking_trackingId_idx" ON "error_tracking"("trackingId");

-- CreateIndex
CREATE INDEX "error_tracking_resolved_idx" ON "error_tracking"("resolved");

-- CreateIndex
CREATE INDEX "troubleshooting_solutions_category_idx" ON "troubleshooting_solutions"("category");

-- CreateIndex
CREATE INDEX "troubleshooting_solutions_automatable_idx" ON "troubleshooting_solutions"("automatable");

-- CreateIndex
CREATE INDEX "auto_troubleshooting_history_issueId_idx" ON "auto_troubleshooting_history"("issueId");

-- CreateIndex
CREATE INDEX "auto_troubleshooting_history_solutionId_idx" ON "auto_troubleshooting_history"("solutionId");

-- CreateIndex
CREATE INDEX "auto_troubleshooting_history_success_idx" ON "auto_troubleshooting_history"("success");

-- CreateIndex
CREATE INDEX "system_health_metrics_timestamp_idx" ON "system_health_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "system_health_metrics_overallScore_idx" ON "system_health_metrics"("overallScore");

-- CreateIndex
CREATE INDEX "diagnostic_alerts_alertType_idx" ON "diagnostic_alerts"("alertType");

-- CreateIndex
CREATE INDEX "diagnostic_alerts_severity_idx" ON "diagnostic_alerts"("severity");

-- CreateIndex
CREATE INDEX "diagnostic_alerts_isActive_idx" ON "diagnostic_alerts"("isActive");

-- CreateIndex
CREATE INDEX "diagnostic_alerts_isResolved_idx" ON "diagnostic_alerts"("isResolved");

-- CreateIndex
CREATE INDEX "database_optimization_jobs_type_idx" ON "database_optimization_jobs"("type");

-- CreateIndex
CREATE INDEX "database_optimization_jobs_status_idx" ON "database_optimization_jobs"("status");

-- CreateIndex
CREATE INDEX "database_optimization_jobs_createdBy_idx" ON "database_optimization_jobs"("createdBy");

-- CreateIndex
CREATE INDEX "database_metrics_timestamp_idx" ON "database_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "slow_queries_queryHash_idx" ON "slow_queries"("queryHash");

-- CreateIndex
CREATE INDEX "slow_queries_executionTime_idx" ON "slow_queries"("executionTime");

-- CreateIndex
CREATE INDEX "slow_queries_timestamp_idx" ON "slow_queries"("timestamp");

-- CreateIndex
CREATE INDEX "database_alerts_alertType_idx" ON "database_alerts"("alertType");

-- CreateIndex
CREATE INDEX "database_alerts_severity_idx" ON "database_alerts"("severity");

-- CreateIndex
CREATE INDEX "database_alerts_isActive_idx" ON "database_alerts"("isActive");

-- CreateIndex
CREATE INDEX "database_cleanup_history_cleanupType_idx" ON "database_cleanup_history"("cleanupType");

-- CreateIndex
CREATE INDEX "database_cleanup_history_startedAt_idx" ON "database_cleanup_history"("startedAt");

-- CreateIndex
CREATE INDEX "table_analysis_cache_lastAnalyzed_idx" ON "table_analysis_cache"("lastAnalyzed");

-- CreateIndex
CREATE UNIQUE INDEX "table_analysis_cache_tableName_schemaName_key" ON "table_analysis_cache"("tableName", "schemaName");

-- CreateIndex
CREATE INDEX "connection_pool_stats_timestamp_idx" ON "connection_pool_stats"("timestamp");

-- CreateIndex
CREATE INDEX "query_performance_history_queryHash_idx" ON "query_performance_history"("queryHash");

-- CreateIndex
CREATE INDEX "query_performance_history_timestamp_idx" ON "query_performance_history"("timestamp");

-- CreateIndex
CREATE INDEX "query_performance_history_executionTime_idx" ON "query_performance_history"("executionTime");

-- CreateIndex
CREATE INDEX "dev_projects_status_idx" ON "dev_projects"("status");

-- CreateIndex
CREATE INDEX "dev_projects_createdBy_idx" ON "dev_projects"("createdBy");

-- CreateIndex
CREATE INDEX "test_results_projectId_idx" ON "test_results"("projectId");

-- CreateIndex
CREATE INDEX "test_results_status_idx" ON "test_results"("status");

-- CreateIndex
CREATE INDEX "test_results_suiteName_idx" ON "test_results"("suiteName");

-- CreateIndex
CREATE INDEX "build_history_projectId_idx" ON "build_history"("projectId");

-- CreateIndex
CREATE INDEX "build_history_status_idx" ON "build_history"("status");

-- CreateIndex
CREATE INDEX "build_history_version_idx" ON "build_history"("version");

-- CreateIndex
CREATE INDEX "dev_logs_projectId_idx" ON "dev_logs"("projectId");

-- CreateIndex
CREATE INDEX "dev_logs_level_idx" ON "dev_logs"("level");

-- CreateIndex
CREATE INDEX "dev_logs_timestamp_idx" ON "dev_logs"("timestamp");

-- CreateIndex
CREATE INDEX "hook_callbacks_hookName_idx" ON "hook_callbacks"("hookName");

-- CreateIndex
CREATE INDEX "hook_callbacks_priority_idx" ON "hook_callbacks"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "hook_callbacks_pluginId_hookName_callbackId_key" ON "hook_callbacks"("pluginId", "hookName", "callbackId");

-- CreateIndex
CREATE INDEX "plugin_api_endpoints_path_idx" ON "plugin_api_endpoints"("path");

-- CreateIndex
CREATE INDEX "plugin_api_endpoints_method_idx" ON "plugin_api_endpoints"("method");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_api_endpoints_pluginId_path_method_key" ON "plugin_api_endpoints"("pluginId", "path", "method");

-- CreateIndex
CREATE INDEX "hook_metrics_hookName_idx" ON "hook_metrics"("hookName");

-- CreateIndex
CREATE INDEX "hook_metrics_executionTime_idx" ON "hook_metrics"("executionTime");

-- CreateIndex
CREATE INDEX "hook_metrics_timestamp_idx" ON "hook_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "api_request_logs_pluginId_idx" ON "api_request_logs"("pluginId");

-- CreateIndex
CREATE INDEX "api_request_logs_path_idx" ON "api_request_logs"("path");

-- CreateIndex
CREATE INDEX "api_request_logs_statusCode_idx" ON "api_request_logs"("statusCode");

-- CreateIndex
CREATE INDEX "api_request_logs_timestamp_idx" ON "api_request_logs"("timestamp");

-- CreateIndex
CREATE INDEX "event_listeners_eventName_idx" ON "event_listeners"("eventName");

-- CreateIndex
CREATE INDEX "event_listeners_priority_idx" ON "event_listeners"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "event_listeners_pluginId_eventName_callbackId_key" ON "event_listeners"("pluginId", "eventName", "callbackId");

-- CreateIndex
CREATE INDEX "plugin_transactions_pluginId_idx" ON "plugin_transactions"("pluginId");

-- CreateIndex
CREATE INDEX "plugin_transactions_buyerId_idx" ON "plugin_transactions"("buyerId");

-- CreateIndex
CREATE INDEX "plugin_transactions_sellerId_idx" ON "plugin_transactions"("sellerId");

-- CreateIndex
CREATE INDEX "plugin_transactions_status_idx" ON "plugin_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_licenses_licenseKey_key" ON "plugin_licenses"("licenseKey");

-- CreateIndex
CREATE INDEX "plugin_licenses_pluginId_idx" ON "plugin_licenses"("pluginId");

-- CreateIndex
CREATE INDEX "plugin_licenses_userId_idx" ON "plugin_licenses"("userId");

-- CreateIndex
CREATE INDEX "plugin_licenses_licenseKey_idx" ON "plugin_licenses"("licenseKey");

-- CreateIndex
CREATE INDEX "plugin_licenses_isActive_idx" ON "plugin_licenses"("isActive");

-- CreateIndex
CREATE INDEX "plugin_downloads_pluginId_idx" ON "plugin_downloads"("pluginId");

-- CreateIndex
CREATE INDEX "plugin_downloads_userId_idx" ON "plugin_downloads"("userId");

-- CreateIndex
CREATE INDEX "plugin_downloads_downloadedAt_idx" ON "plugin_downloads"("downloadedAt");

-- CreateIndex
CREATE INDEX "review_votes_vote_idx" ON "review_votes"("vote");

-- CreateIndex
CREATE UNIQUE INDEX "review_votes_reviewId_userId_key" ON "review_votes"("reviewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDashboardPreference_userId_key" ON "UserDashboardPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardWidget_name_key" ON "DashboardWidget"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserWidget_userId_widgetId_key" ON "UserWidget"("userId", "widgetId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickAction_title_key" ON "QuickAction"("title");

-- CreateIndex
CREATE INDEX "ChartDataCache_chartType_expiresAt_idx" ON "ChartDataCache"("chartType", "expiresAt");

-- CreateIndex
CREATE INDEX "DashboardSystemHealthMetric_createdAt_idx" ON "DashboardSystemHealthMetric"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardSettings_userId_key" ON "DashboardSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaFileToMediaTag_AB_unique" ON "_MediaFileToMediaTag"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaFileToMediaTag_B_index" ON "_MediaFileToMediaTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_path_date_key" ON "analytics"("path", "date");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key_key" ON "user_settings"("userId", "key");

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rule_executions" ADD CONSTRAINT "category_rule_executions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_rule_executions" ADD CONSTRAINT "category_rule_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "category_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_gap_analyses" ADD CONSTRAINT "content_gap_analyses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_gap_analyses" ADD CONSTRAINT "content_gap_analyses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_gap_recommendations" ADD CONSTRAINT "content_gap_recommendations_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_gap_recommendations" ADD CONSTRAINT "content_gap_recommendations_gapAnalysisId_fkey" FOREIGN KEY ("gapAnalysisId") REFERENCES "content_gap_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_limit_logs" ADD CONSTRAINT "rate_limit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_threads" ADD CONSTRAINT "comment_threads_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_workflows" ADD CONSTRAINT "content_workflows_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "content_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_locks" ADD CONSTRAINT "content_locks_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_schedules" ADD CONSTRAINT "content_schedules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_sessions" ADD CONSTRAINT "editor_sessions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_sessions" ADD CONSTRAINT "editor_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autosaved_content" ADD CONSTRAINT "autosaved_content_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autosaved_content" ADD CONSTRAINT "autosaved_content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_comments" ADD CONSTRAINT "editor_comments_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_comments" ADD CONSTRAINT "editor_comments_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_comments" ADD CONSTRAINT "editor_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_usage_analytics" ADD CONSTRAINT "block_usage_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "media_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_processing_jobs" ADD CONSTRAINT "media_processing_jobs_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_cdn_cache" ADD CONSTRAINT "media_cdn_cache_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_analytics" ADD CONSTRAINT "media_analytics_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_upload_sessions" ADD CONSTRAINT "media_upload_sessions_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_upload_sessions" ADD CONSTRAINT "media_upload_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_search_index" ADD CONSTRAINT "media_search_index_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firewall_rules" ADD CONSTRAINT "firewall_rules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ip_lists" ADD CONSTRAINT "ip_lists_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_responses" ADD CONSTRAINT "incident_responses_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_responses" ADD CONSTRAINT "incident_responses_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "security_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_configs" ADD CONSTRAINT "security_configs_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_logs" ADD CONSTRAINT "import_logs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_logs" ADD CONSTRAINT "export_logs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "export_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "backup_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_executions" ADD CONSTRAINT "maintenance_executions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "maintenance_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_executions" ADD CONSTRAINT "maintenance_executions_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_installedBy_fkey" FOREIGN KEY ("installedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_settings" ADD CONSTRAINT "plugin_settings_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_hooks" ADD CONSTRAINT "plugin_hooks_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_plugins" ADD CONSTRAINT "marketplace_plugins_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_reviews" ADD CONSTRAINT "plugin_reviews_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "marketplace_plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_reviews" ADD CONSTRAINT "plugin_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_purchases" ADD CONSTRAINT "plugin_purchases_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "marketplace_plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_purchases" ADD CONSTRAINT "plugin_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hook_executions" ADD CONSTRAINT "hook_executions_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_development" ADD CONSTRAINT "plugin_development_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_jobs" ADD CONSTRAINT "diagnostic_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_issues" ADD CONSTRAINT "system_issues_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "diagnostic_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_issues" ADD CONSTRAINT "system_issues_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_troubleshooting_history" ADD CONSTRAINT "auto_troubleshooting_history_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "system_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_troubleshooting_history" ADD CONSTRAINT "auto_troubleshooting_history_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "troubleshooting_solutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_alerts" ADD CONSTRAINT "diagnostic_alerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database_optimization_jobs" ADD CONSTRAINT "database_optimization_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database_alerts" ADD CONSTRAINT "database_alerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database_cleanup_history" ADD CONSTRAINT "database_cleanup_history_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_projects" ADD CONSTRAINT "dev_projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "dev_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_history" ADD CONSTRAINT "build_history_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "dev_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_logs" ADD CONSTRAINT "dev_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "dev_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hook_callbacks" ADD CONSTRAINT "hook_callbacks_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_api_endpoints" ADD CONSTRAINT "plugin_api_endpoints_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hook_metrics" ADD CONSTRAINT "hook_metrics_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "plugin_api_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_listeners" ADD CONSTRAINT "event_listeners_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_transactions" ADD CONSTRAINT "plugin_transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_transactions" ADD CONSTRAINT "plugin_transactions_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "marketplace_plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_transactions" ADD CONSTRAINT "plugin_transactions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_licenses" ADD CONSTRAINT "plugin_licenses_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "marketplace_plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_licenses" ADD CONSTRAINT "plugin_licenses_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "plugin_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_licenses" ADD CONSTRAINT "plugin_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_downloads" ADD CONSTRAINT "plugin_downloads_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "plugin_licenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_downloads" ADD CONSTRAINT "plugin_downloads_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "marketplace_plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_downloads" ADD CONSTRAINT "plugin_downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_stats" ADD CONSTRAINT "plugin_stats_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "marketplace_plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "plugin_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDashboardPreference" ADD CONSTRAINT "UserDashboardPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWidget" ADD CONSTRAINT "UserWidget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWidget" ADD CONSTRAINT "UserWidget_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "DashboardWidget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardActivity" ADD CONSTRAINT "DashboardActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSettings" ADD CONSTRAINT "DashboardSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaFileToMediaTag" ADD CONSTRAINT "_MediaFileToMediaTag_A_fkey" FOREIGN KEY ("A") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaFileToMediaTag" ADD CONSTRAINT "_MediaFileToMediaTag_B_fkey" FOREIGN KEY ("B") REFERENCES "media_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
