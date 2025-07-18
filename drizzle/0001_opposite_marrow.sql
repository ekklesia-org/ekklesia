CREATE TYPE "public"."SocietyPosition" AS ENUM('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."SocietyType" AS ENUM('SAF', 'UPH', 'UPA', 'UMP', 'UCP');--> statement-breakpoint
CREATE TABLE "societies" (
	"id" text PRIMARY KEY NOT NULL,
	"churchId" text NOT NULL,
	"name" text NOT NULL,
	"type" "SocietyType" NOT NULL,
	"description" text,
	"foundedDate" date,
	"meetingDay" text,
	"meetingTime" text,
	"meetingLocation" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "society_events" (
	"id" text PRIMARY KEY NOT NULL,
	"societyId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"eventDate" timestamp NOT NULL,
	"location" text,
	"attendanceCount" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "society_members" (
	"id" text PRIMARY KEY NOT NULL,
	"societyId" text NOT NULL,
	"memberId" text NOT NULL,
	"position" "SocietyPosition" DEFAULT 'MEMBER' NOT NULL,
	"joinedDate" date DEFAULT now() NOT NULL,
	"leftDate" date,
	"isActive" boolean DEFAULT true NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "societies" ADD CONSTRAINT "societies_churchId_churches_id_fk" FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "society_events" ADD CONSTRAINT "society_events_societyId_societies_id_fk" FOREIGN KEY ("societyId") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "society_members" ADD CONSTRAINT "society_members_societyId_societies_id_fk" FOREIGN KEY ("societyId") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "society_members" ADD CONSTRAINT "society_members_memberId_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "societies_churchId_idx" ON "societies" USING btree ("churchId");--> statement-breakpoint
CREATE INDEX "societies_type_idx" ON "societies" USING btree ("type");--> statement-breakpoint
CREATE INDEX "societies_isActive_idx" ON "societies" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "society_events_societyId_idx" ON "society_events" USING btree ("societyId");--> statement-breakpoint
CREATE INDEX "society_events_eventDate_idx" ON "society_events" USING btree ("eventDate");--> statement-breakpoint
CREATE INDEX "society_members_societyId_idx" ON "society_members" USING btree ("societyId");--> statement-breakpoint
CREATE INDEX "society_members_memberId_idx" ON "society_members" USING btree ("memberId");--> statement-breakpoint
CREATE INDEX "society_members_isActive_idx" ON "society_members" USING btree ("isActive");