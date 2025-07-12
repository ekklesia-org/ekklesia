CREATE TYPE "public"."MaritalStatus" AS ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');--> statement-breakpoint
CREATE TYPE "public"."MemberStatus" AS ENUM('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED');--> statement-breakpoint
CREATE TYPE "public"."TransactionCategory" AS ENUM('TITHE', 'OFFERING', 'DONATION', 'EVENT_INCOME', 'UTILITIES', 'MAINTENANCE', 'SUPPLIES', 'MINISTRY', 'SALARY', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."TransactionStatus" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."TransactionType" AS ENUM('INCOME', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('SUPER_ADMIN', 'CHURCH_ADMIN', 'PASTOR', 'TREASURER', 'SECRETARY', 'MEMBER');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"churchId" text NOT NULL,
	"userId" text NOT NULL,
	"action" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text NOT NULL,
	"oldValues" jsonb,
	"newValues" jsonb,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "church_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"churchId" text NOT NULL,
	"timezone" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"fiscalYear" text DEFAULT 'calendar' NOT NULL,
	"enabledModules" text[],
	"enableOCR" boolean DEFAULT false NOT NULL,
	"ocrApiKey" text,
	"bankName" text,
	"accountNumber" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "church_settings_churchId_unique" UNIQUE("churchId")
);
--> statement-breakpoint
CREATE TABLE "churches" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zipCode" text,
	"website" text,
	"logoUrl" text,
	"taxId" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "churches_slug_unique" UNIQUE("slug"),
	CONSTRAINT "churches_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"churchId" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"email" text,
	"phone" text,
	"dateOfBirth" timestamp,
	"cpf" text,
	"rg" text,
	"address" text,
	"city" text,
	"state" text,
	"zipCode" text,
	"status" "MemberStatus" DEFAULT 'ACTIVE' NOT NULL,
	"maritalStatus" "MaritalStatus" DEFAULT 'SINGLE' NOT NULL,
	"baptismDate" timestamp,
	"memberSince" timestamp DEFAULT now() NOT NULL,
	"spouseId" text,
	"profession" text,
	"notes" text,
	"photoUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" text,
	CONSTRAINT "members_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "members_spouseId_unique" UNIQUE("spouseId"),
	CONSTRAINT "members_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"churchId" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"type" "TransactionType" NOT NULL,
	"category" "TransactionCategory" NOT NULL,
	"status" "TransactionStatus" DEFAULT 'PENDING' NOT NULL,
	"transactionDate" timestamp NOT NULL,
	"referenceNumber" text,
	"bankAccount" text,
	"bankReference" text,
	"memberId" text,
	"isFromOCR" boolean DEFAULT false NOT NULL,
	"ocrData" jsonb,
	"attachments" text[],
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"phone" text,
	"avatar" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"role" "UserRole" DEFAULT 'MEMBER' NOT NULL,
	"churchId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastLogin" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_churchId_churches_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_settings" ADD CONSTRAINT "church_settings_churchId_churches_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_churchId_churches_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_churchId_churches_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_churchId_churches_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_churchId_idx" ON "audit_logs" USING btree ("churchId");--> statement-breakpoint
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "churches_isActive_idx" ON "churches" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "churches_createdAt_idx" ON "churches" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "churches_name_idx" ON "churches" USING btree ("name");--> statement-breakpoint
CREATE INDEX "members_churchId_idx" ON "members" USING btree ("churchId");--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "members_email_idx" ON "members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "transactions_churchId_idx" ON "transactions" USING btree ("churchId");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_transactionDate_idx" ON "transactions" USING btree ("transactionDate");