// PostgreSQL-focused schema (since we're using Neon)
import {
  pgTable, text, serial, integer, boolean, jsonb, timestamp, index, uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Validation schemas and enums (defined first for use in table schemas)
export const contentTypeEnum = z.enum([
  'thought', 'quote', 'achievement', 'tip', 'story', 'question', 'poll', 'announcement'
]);

export const audienceEnum = z.enum([
  'aspiring-developers', 'tech-vcs', 'startup-founders', 'software-engineers',
  'product-managers', 'designers', 'general-tech', 'students'
]);

export const toneEnum = z.enum([
  'witty', 'tactical', 'professional', 'casual', 'inspirational', 'educational', 'humorous'
]);

export const platformEnum = z.enum([
  'linkedin', 'twitter', 'instagram', 'discord', 'facebook', 'tiktok', 'youtube'
]);

export const imageOptionEnum = z.enum([
  'generate-dalle', 'upload-manual', 'no-image', 'stock-photo'
]);

export const postStatusEnum = z.enum([
  'draft', 'scheduled', 'posted', 'failed'
]);

// User schema for real authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  fullName: text("full_name"),
  avatar: text("avatar_url"),
  provider: text("provider"), // 'google', 'apple', 'twitter', 'email'
  providerId: text("provider_id"), // id from the provider
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
}, (table) => ({
  usernameIdx: uniqueIndex("users_username_idx").on(table.username),
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  providerIdx: index("users_provider_idx").on(table.provider),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));

export const usersRelations = relations(users, ({ many }) => ({
  contentPreferences: many(contentPreferences),
  contents: many(generatedContents),
  posts: many(posts),
}));

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  email: z.string().email("Invalid email format"),
  fullName: z.string().max(100, "Full name must be less than 100 characters").optional(),
  provider: z.enum(['google', 'apple', 'twitter', 'email', 'demo']).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tokenExpiry: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Content preferences schema
export const contentPreferences = pgTable("content_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // Thought, Quote, Achievement, etc.
  audience: text("audience").notNull(), // Aspiring developers, Tech VCs, etc.
  tone: text("tone").notNull(), // Witty, Tactical, Professional, etc.
  platforms: text("platforms").array().notNull(), // Array of platform names
  imageOption: text("image_option").notNull(), // Generate via DALL·E, Upload manually, etc.
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("content_preferences_user_id_idx").on(table.userId),
  createdAtIdx: index("content_preferences_created_at_idx").on(table.createdAt),
}));

export const contentPreferencesRelations = relations(contentPreferences, ({ one, many }) => ({
  user: one(users, { 
    fields: [contentPreferences.userId], 
    references: [users.id] 
  }),
  generatedContents: many(generatedContents),
}));

export const insertContentPreferencesSchema = createInsertSchema(contentPreferences, {
  contentType: contentTypeEnum,
  audience: audienceEnum,
  tone: toneEnum,
  platforms: z.array(platformEnum).min(1, "At least one platform is required"),
  imageOption: imageOptionEnum,
}).omit({
  id: true,
  createdAt: true,
});

export type InsertContentPreferences = z.infer<typeof insertContentPreferencesSchema>;
export type ContentPreferences = typeof contentPreferences.$inferSelect;

// Generated content schema
export const generatedContents = pgTable("generated_contents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  preferencesId: integer("preferences_id").references(() => contentPreferences.id, { onDelete: "cascade" }).notNull(),
  platform: text("platform").notNull(), // LinkedIn, Twitter, Instagram, Discord
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  hashtags: text("hashtags"),
  imagePrompt: text("image_prompt"),
  additionalData: jsonb("additional_data"), // Any platform-specific formatting data
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  scheduled: boolean("scheduled").$default(() => false).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  published: boolean("published").$default(() => false).notNull(),
}, (table) => ({
  userIdIdx: index("generated_contents_user_id_idx").on(table.userId),
  preferencesIdIdx: index("generated_contents_preferences_id_idx").on(table.preferencesId),
  platformIdx: index("generated_contents_platform_idx").on(table.platform),
  createdAtIdx: index("generated_contents_created_at_idx").on(table.createdAt),
  scheduledIdx: index("generated_contents_scheduled_idx").on(table.scheduled),
  publishedIdx: index("generated_contents_published_idx").on(table.published),
}));

export const generatedContentsRelations = relations(generatedContents, ({ one }) => ({
  user: one(users, {
    fields: [generatedContents.userId],
    references: [users.id]
  }),
  preferences: one(contentPreferences, {
    fields: [generatedContents.preferencesId],
    references: [contentPreferences.id]
  }),
}));

export const insertGeneratedContentSchema = createInsertSchema(generatedContents).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type GeneratedContent = typeof generatedContents.$inferSelect;

// Posts table for user posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  platforms: text("platforms").array().notNull(), // Array of platform names
  status: text("status").notNull().default("draft"), // "posted", "scheduled", "failed", "draft"
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("posts_user_id_idx").on(table.userId),
  statusIdx: index("posts_status_idx").on(table.status),
  scheduledForIdx: index("posts_scheduled_for_idx").on(table.scheduledFor),
  createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  }),
}));

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Onboarding input schema
export const onboardingInputSchema = z.object({
  contentType: contentTypeEnum,
  audience: audienceEnum,
  tone: toneEnum,
  platforms: z.array(platformEnum).min(1, "At least one platform is required"),
  imageOption: imageOptionEnum,
  customKeywords: z.string().max(500, "Keywords must be less than 500 characters").optional(),
  contentStyle: z.enum(['story', 'data-driven', 'call-to-action']).optional(),
  emotionalTone: z.enum(['emotional', 'factual']).optional(),
  structurePreference: z.enum(['short-sentences', 'flowing-paragraphs', 'bullet-points']).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

// Content generation response schema
export const contentGenerationResponseSchema = z.object({
  linkedin: z.array(z.object({
    content: z.string(),
    hashtags: z.string().optional(),
    imagePrompt: z.string().optional(),
  })).optional(),
  twitter: z.array(z.object({
    content: z.string(),
    hashtags: z.string().optional(),
    imagePrompt: z.string().optional(),
  })).optional(),
  instagram: z.array(z.object({
    content: z.string(),
    hashtags: z.string().optional(),
    imagePrompt: z.string().optional(),
  })).optional(),
  discord: z.array(z.object({
    content: z.string(),
    hashtags: z.string().optional(),
    imagePrompt: z.string().optional(),
  })).optional(),
});

export type ContentGenerationResponse = z.infer<typeof contentGenerationResponseSchema>;
