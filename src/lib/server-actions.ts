import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";

// Simple sanitization function
function sanitizeInput(input: string): string {
  return input.trim().slice(0, 2000); // Basic length limit and trim
}

// Helper to get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper to check if user is admin (placeholder - implement your admin logic)
async function isAdmin(userId: string): Promise<boolean> {
  // TODO: Implement admin check based on your requirements
  // For now, return false
  return false;
}

// Simple rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; reset: number }>();

function checkRateLimit(userId: string, action: string, limit = 10, windowMs = 60000): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Posts
export async function createPost(body: string, visibility: 'public' | 'friends' = 'public', media?: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'createPost')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      user_id: user.id,
      body: sanitizeInput(body),
      visibility,
      media
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function editPost(id: string, body: string, visibility: 'public' | 'friends') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'editPost')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('posts')
    .update({
      body: sanitizeInput(body),
      visibility
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'deletePost')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id);
    
  if (error) throw error;
}

// Comments
export async function createComment(post_id: string, body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'createComment')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      user_id: user.id,
      post_id,
      body: sanitizeInput(body)
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'deleteComment')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);
    
  if (error) throw error;
}

// Profile
export async function updateProfile(display_name: string, bio: string, avatar_url?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'updateProfile')) {
    throw new Error('Rate limit exceeded');
  }
  
  const updateData: Database['public']['Tables']['profiles']['Update'] = {
    display_name: sanitizeInput(display_name),
    bio: sanitizeInput(bio)
  };
  
  if (avatar_url) {
    updateData.avatar_url = avatar_url;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUsername(username: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'updateUsername')) {
    throw new Error('Rate limit exceeded');
  }
  
  const normalizedUsername = username.toLowerCase().trim();
  
  // Check if username is available
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', normalizedUsername)
    .single();
    
  if (existing) {
    throw new Error('Username is already taken');
  }
  
  // Get current username for redirect
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .single();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ username: normalizedUsername })
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Create redirect if username changed
  if (currentProfile?.username && currentProfile.username !== normalizedUsername) {
    await supabase
      .from('username_redirects')
      .insert([{
        old_username: currentProfile.username,
        new_username: normalizedUsername,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }]);
  }
  
  return data;
}

export async function updateTheme(theme: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'updateTheme')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ theme })
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Friendships
export async function sendFriendRequest(friend_id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'sendFriendRequest')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('friendships')
    .insert([{
      user_id: user.id,
      friend_id,
      status: 'pending'
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Create notification
  await supabase
    .from('notifications')
    .insert([{
      user_id: friend_id,
      type: 'friend_request',
      entity_id: user.id
    }]);
  
  return data;
}

export async function acceptFriendRequest(friend_id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'acceptFriendRequest')) {
    throw new Error('Rate limit exceeded');
  }
  
  await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', friend_id)
    .eq('friend_id', user.id);
  
  // Create reciprocal friendship
  await supabase
    .from('friendships')
    .insert([{
      user_id: user.id,
      friend_id,
      status: 'accepted'
    }]);
  
  // Create notification
  await supabase
    .from('notifications')
    .insert([{
      user_id: friend_id,
      type: 'friend_accepted',
      entity_id: user.id
    }]);
}

export async function declineFriendRequest(friend_id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'declineFriendRequest')) {
    throw new Error('Rate limit exceeded');
  }
  
  await supabase
    .from('friendships')
    .delete()
    .eq('user_id', friend_id)
    .eq('friend_id', user.id);
}

export async function blockUser(friend_id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'blockUser')) {
    throw new Error('Rate limit exceeded');
  }
  
  await supabase
    .from('friendships')
    .upsert([{
      user_id: user.id,
      friend_id,
      status: 'blocked'
    }]);
}

// Profile Comments
export async function createProfileComment(target_user_id: string, body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'createProfileComment')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('profile_comments')
    .insert([{
      author_user_id: user.id,
      target_user_id,
      body: sanitizeInput(body)
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  // Create notification
  if (data && 'id' in data) {
    await supabase
      .from('notifications')
      .insert([{
        user_id: target_user_id,
        type: 'profile_comment',
        entity_id: (data as any).id
      }]);
  }
  
  return data;
}

export async function moderateProfileComment(comment_id: string, action: 'approve' | 'reject') {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'moderateProfileComment')) {
    throw new Error('Rate limit exceeded');
  }
  
  const status = action === 'approve' ? 'approved' : 'rejected';
  
  const { data, error } = await supabase
    .from('profile_comments')
    .update({ status })
    .eq('id', comment_id)
    .eq('target_user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Create notification if approved
  if (status === 'approved' && data && 'author_user_id' in data && 'id' in data) {
    await supabase
      .from('notifications')
      .insert([{
        user_id: (data as any).author_user_id,
        type: 'profile_comment_approved',
        entity_id: (data as any).id
      }]);
  }
  
  return data;
}

// Reports
export async function createReport(target_type: string, target_id: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'createReport')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      reporter_id: user.id,
      target_type,
      target_id,
      reason: sanitizeInput(reason)
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function moderateReport(report_id: string, action: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const isUserAdmin = await isAdmin(user.id);
  if (!isUserAdmin) throw new Error('Forbidden');
  
  if (!checkRateLimit(user.id, 'moderateReport')) {
    throw new Error('Rate limit exceeded');
  }
  
  const { data, error } = await supabase
    .from('reports')
    .update({ status: 'actioned' })
    .eq('id', report_id)
    .select()
    .single();
    
  if (error) throw error;
  
  // TODO: Implement actual content removal/user banning based on action
  // This would involve removing content, updating user status, etc.
  
  return data;
}

// Notifications
export async function markNotificationRead(notification_id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notification_id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Username validation and creation
export async function claimUsername(username: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'claimUsername')) {
    throw new Error('Rate limit exceeded');
  }
  
  const normalizedUsername = username.toLowerCase().trim();
  
  // Validate username format
  if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
    throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
  }
  
  // Check if username is available
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', normalizedUsername)
    .single();
    
  if (existing) {
    throw new Error('Username is already taken');
  }
  
  // Create profile
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      user_id: user.id,
      username: normalizedUsername,
      display_name: '',
      bio: ''
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}