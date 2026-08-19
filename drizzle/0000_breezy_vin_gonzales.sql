CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "quiz_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientSessionId" varchar(64) NOT NULL,
	"userId" integer NOT NULL,
	"displayName" varchar(64) NOT NULL,
	"theme" varchar(64) NOT NULL,
	"difficulty" varchar(16) NOT NULL,
	"score" integer NOT NULL,
	"totalQuestions" integer NOT NULL,
	"percentage" integer NOT NULL,
	"questionIds" json NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_progress" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "theme_progress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"theme" varchar(64) NOT NULL,
	"attemptedQuestions" integer DEFAULT 0 NOT NULL,
	"correctAnswers" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"password" varchar(128),
	"role" "role" DEFAULT 'user' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_progress" ADD CONSTRAINT "theme_progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_sessions_client_session_unique" ON "quiz_sessions" USING btree ("clientSessionId");--> statement-breakpoint
CREATE INDEX "quiz_sessions_ranking_index" ON "quiz_sessions" USING btree ("percentage","score");--> statement-breakpoint
CREATE INDEX "quiz_sessions_user_index" ON "quiz_sessions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "theme_progress_user_theme_unique" ON "theme_progress" USING btree ("userId","theme");--> statement-breakpoint
CREATE INDEX "theme_progress_user_index" ON "theme_progress" USING btree ("userId");