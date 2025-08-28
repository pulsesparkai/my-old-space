// src/types/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Visibility = "public" | "friends";
export type GuestbookStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "open" | "actioned" | "dismissed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          username: string;
          display_name: string;
          bio: string;
          avatar_url: string | null;
          theme: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string | null;
          theme?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };

      posts: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          media: Json | null;
          visibility: Visibility;
          like_count: number;
          comment_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          body: string;
          media?: Json | null;
          visibility?: Visibility;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Row"]>;
        Relationships: [
          { foreignKeyName: "posts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ];
      };

      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
        Relationships: [
          { foreignKeyName: "comments_post_id_fkey"; columns: ["post_id"]; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "comments_user_id_fkey"; columns: ["user_id"]; referencedRelation: "users"; referencedColumns: ["id"] }
        ];
      };

      friendships: {
        Row: {
          user_id: string;
          friend_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
        };
        Insert: {
          user_id: string;
          friend_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["friendships"]["Row"]>;
        Relationships: [];
      };

      profile_comments: {
        Row: {
          id: string;
          target_user_id: string;
          author_user_id: string;
          body: string;
          status: GuestbookStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_user_id: string;
          author_user_id: string;
          body: string;
          status?: GuestbookStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profile_comments"]["Row"]>;
        Relationships: [];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          entity_id: string | null;
          created_at: string;
          read: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          entity_id?: string | null;
          created_at?: string;
          read?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };

      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Relationships: [];
      };

      username_redirects: {
        Row: {
          old_username: string;
          new_username: string;
          expires_at: string;
        };
        Insert: {
          old_username: string;
          new_username: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["username_redirects"]["Row"]>;
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      visibility: Visibility;
      guestbook_status: GuestbookStatus;
      report_status: ReportStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}