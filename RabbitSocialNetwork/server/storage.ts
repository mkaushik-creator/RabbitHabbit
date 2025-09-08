import {
  users,
  type User,
  type InsertUser,
  contentPreferences,
  type ContentPreferences,
  type InsertContentPreferences,
  generatedContents,
  type GeneratedContent,
  type InsertGeneratedContent,
  posts,
  type Post,
  type InsertPost
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content preference operations
  createContentPreferences(preferences: InsertContentPreferences): Promise<ContentPreferences>;
  getContentPreferencesByUserId(userId: number | null): Promise<ContentPreferences[]>;
  
  // Generated content operations
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  getGeneratedContentByPreferenceId(preferenceId: number): Promise<GeneratedContent[]>;
  getContentByPlatform(platform: string): Promise<GeneratedContent[]>;
  getContentHistory(): Promise<Array<ContentPreferences & { contents: GeneratedContent[] }>>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  getPostHistory(): Promise<Post[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Content preferences methods
  async createContentPreferences(preferences: InsertContentPreferences): Promise<ContentPreferences> {
    const result = await db.insert(contentPreferences).values(preferences).returning();
    return result[0];
  }
  
  async getContentPreferencesByUserId(userId: number | null): Promise<ContentPreferences[]> {
    if (userId === null) {
      // If userId is null, return all preferences sorted by creation date
      return await db.select().from(contentPreferences).orderBy(desc(contentPreferences.createdAt));
    }
    
    return await db.select()
      .from(contentPreferences)
      .where(eq(contentPreferences.userId, userId))
      .orderBy(desc(contentPreferences.createdAt));
  }
  
  // Generated content methods
  async createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent> {
    const result = await db.insert(generatedContents).values(content).returning();
    return result[0];
  }
  
  async getGeneratedContentByPreferenceId(preferenceId: number): Promise<GeneratedContent[]> {
    return await db.select()
      .from(generatedContents)
      .where(eq(generatedContents.preferencesId, preferenceId))
      .orderBy(desc(generatedContents.createdAt));
  }
  
  async getContentByPlatform(platform: string): Promise<GeneratedContent[]> {
    return await db.select()
      .from(generatedContents)
      .where(like(generatedContents.platform, `%${platform}%`))
      .orderBy(desc(generatedContents.createdAt));
  }
  
  async getContentHistory(): Promise<Array<ContentPreferences & { contents: GeneratedContent[] }>> {
    const allPreferences = await db.select()
      .from(contentPreferences)
      .orderBy(desc(contentPreferences.createdAt));
      
    const result = [];
    
    for (const pref of allPreferences) {
      const contents = await this.getGeneratedContentByPreferenceId(pref.id);
      result.push({
        ...pref,
        contents
      });
    }
    
    return result;
  }
  
  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [createdPost] = await db
      .insert(posts)
      .values(post)
      .returning();
      
    return createdPost;
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
      
    return userPosts;
  }
  
  async getPostHistory(): Promise<Post[]> {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
      
    return allPosts;
  }
}

// Export an instance of DatabaseStorage to be used throughout the application
export const storage = new DatabaseStorage();
