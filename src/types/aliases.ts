// src/types/aliases.ts
import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ProfileComment = Database["public"]["Tables"]["profile_comments"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];