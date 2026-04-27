-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'collaborator');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('fire', 'build', 'grow', 'later');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('absolute_rule', 'personalization_rule', 'sending_rule');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'collaborator',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_items" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "phase" "Phase" NOT NULL,
    "tag" TEXT,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "email_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cold_email_rules" (
    "id" SERIAL NOT NULL,
    "type" "RuleType" NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cold_email_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_phases" (
    "id" SERIAL NOT NULL,
    "phase_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "period" TEXT,
    "badge_color" TEXT,
    "mrr_target" TEXT,
    "kpi_label" TEXT,
    "kpi_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scale_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_actions" (
    "id" SERIAL NOT NULL,
    "phase_id" INTEGER NOT NULL,
    "week_label" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scale_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scale_blockers" (
    "id" SERIAL NOT NULL,
    "phase_id" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fix_text" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scale_blockers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'collaborator',
    "invited_by" INTEGER NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- AddForeignKey
ALTER TABLE "scale_actions" ADD CONSTRAINT "scale_actions_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "scale_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_blockers" ADD CONSTRAINT "scale_blockers_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "scale_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
