import { Profile } from "passport-google-oauth20";

export type AuthProvider = "google" | "twitter" | "apple" | "email" | "demo";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  provider: AuthProvider;
}