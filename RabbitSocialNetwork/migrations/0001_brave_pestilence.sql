ALTER TABLE "posts" DROP CONSTRAINT "posts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_contents" ALTER COLUMN "scheduled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "generated_contents" ALTER COLUMN "published" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_preferences_user_id_idx" ON "content_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_preferences_created_at_idx" ON "content_preferences" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "generated_contents_user_id_idx" ON "generated_contents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_contents_preferences_id_idx" ON "generated_contents" USING btree ("preferences_id");--> statement-breakpoint
CREATE INDEX "generated_contents_platform_idx" ON "generated_contents" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "generated_contents_created_at_idx" ON "generated_contents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "generated_contents_scheduled_idx" ON "generated_contents" USING btree ("scheduled");--> statement-breakpoint
CREATE INDEX "generated_contents_published_idx" ON "generated_contents" USING btree ("published");--> statement-breakpoint
CREATE INDEX "posts_user_id_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_scheduled_for_idx" ON "posts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_provider_idx" ON "users" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");