CREATE TABLE "content_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"content_type" text NOT NULL,
	"audience" text NOT NULL,
	"tone" text NOT NULL,
	"platforms" text[] NOT NULL,
	"image_option" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"preferences_id" integer NOT NULL,
	"platform" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"hashtags" text,
	"image_prompt" text,
	"additional_data" jsonb,
	"created_at" timestamp NOT NULL,
	"scheduled" boolean,
	"scheduled_for" timestamp,
	"published" boolean
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"content" text NOT NULL,
	"platforms" text[] NOT NULL,
	"status" text NOT NULL,
	"scheduled_for" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"full_name" text,
	"avatar_url" text,
	"provider" text,
	"provider_id" text,
	"access_token" text,
	"refresh_token" text,
	"token_expiry" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "content_preferences" ADD CONSTRAINT "content_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_contents" ADD CONSTRAINT "generated_contents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_contents" ADD CONSTRAINT "generated_contents_preferences_id_content_preferences_id_fk" FOREIGN KEY ("preferences_id") REFERENCES "public"."content_preferences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;