// Application-specific types

export interface Post {
  id: string;
  user_id: string;
  body: string;
  media?: any;
  visibility: 'public' | 'friends';
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
}

export interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  theme: any;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  entity_id?: string;
  created_at: string;
  read: boolean;
}

export interface ProfileComment {
  id: string;
  target_user_id: string;
  author_user_id: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: 'open' | 'actioned' | 'dismissed';
  created_at: string;
  reporter?: Profile;
}