// Simplified types to work around TypeScript issues
// TODO: Use proper Supabase generated types once they're available

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          username: string;
          display_name: string;
          bio: string;
          avatar_url?: string;
          theme: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string;
          theme?: any;
        };
        Update: {
          username?: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string;
          theme?: any;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          media?: any;
          visibility: string;
          like_count: number;
          comment_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          body: string;
          media?: any;
          visibility?: string;
        };
        Update: {
          body?: string;
          media?: any;
          visibility?: string;
        };
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
          post_id: string;
          user_id: string;
          body: string;
        };
        Update: {
          body?: string;
        };
      };
      friendships: {
        Row: {
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          friend_id: string;
          status: string;
        };
        Update: {
          status?: string;
        };
      };
      profile_comments: {
        Row: {
          id: string;
          target_user_id: string;
          author_user_id: string;
          body: string;
          status: string;
          created_at: string;
        };
        Insert: {
          target_user_id: string;
          author_user_id: string;
          body: string;
          status?: string;
        };
        Update: {
          status?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          entity_id?: string;
          created_at: string;
          read: boolean;
        };
        Insert: {
          user_id: string;
          type: string;
          entity_id?: string;
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status?: string;
        };
        Update: {
          status?: string;
        };
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
        Update: {
          new_username?: string;
          expires_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}