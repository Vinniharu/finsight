CREATE TABLE IF NOT EXISTS "insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"content" text NOT NULL,
	"type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"category" text,
	"is_important" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" text,
	"file_type" text,
	"file_size" integer,
	"content" json,
	"analysis" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
