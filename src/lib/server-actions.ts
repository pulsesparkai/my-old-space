import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, sanitizeHtml } from "./sanitize";
import { checkRateLimit } from "./rate-limit";
import {
  createPostSchema,
  editPostSchema,
  createCommentSchema,
  updateProfileSchema,
  updateUsernameSchema,
  updateThemeSchema,
  friendshipActionSchema,
  createProfileCommentSchema,
  moderateProfileCommentSchema,
  createReportSchema,
  moderateReportSchema,
  markNotificationReadSchema
} from "./validation";

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

// Posts
export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  // Rate limiting
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const body = formData.get('body') as string;
  const visibility = formData.get('visibility') as string || 'public';
  
  const validatedData = createPostSchema.parse({
    body: sanitizeText(body),
    visibility
  });
  
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      user_id: user.id,
      ...validatedData
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function editPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const id = formData.get('id') as string;
  const body = formData.get('body') as string;
  const visibility = formData.get('visibility') as string;
  
  const validatedData = editPostSchema.parse({
    id,
    body: sanitizeText(body),
    visibility
  });
  
  const { data, error } = await supabase
    .from('posts')
    .update({
      body: validatedData.body,
      visibility: validatedData.visibility
    })
    .eq('id', validatedData.id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
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
export async function createComment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const post_id = formData.get('post_id') as string;
  const body = formData.get('body') as string;
  
  const validatedData = createCommentSchema.parse({
    post_id,
    body: sanitizeText(body)
  });
  
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      user_id: user.id,
      ...validatedData
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  // Increment comment count
  await supabase.rpc('increment', {
    table_name: 'posts',
    row_id: post_id,
    column_name: 'comment_count'
  });
  
  return data;
}

export async function deleteComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  // Get comment to find post_id
  const { data: comment } = await supabase
    .from('comments')
    .select('post_id')
    .eq('id', commentId)
    .eq('user_id', user.id)
    .single();
    
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);
    
  if (error) throw error;
  
  // Decrement comment count
  if (comment) {
    await supabase.rpc('decrement', {
      table_name: 'posts',
      row_id: comment.post_id,
      column_name: 'comment_count'
    });
  }
}

// Profile
export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const display_name = formData.get('display_name') as string;
  const bio = formData.get('bio') as string;
  const avatar_url = formData.get('avatar_url') as string;
  
  const validatedData = updateProfileSchema.parse({
    display_name: sanitizeText(display_name),
    bio: sanitizeText(bio),
    avatar_url
  });
  
  const { data, error } = await supabase
    .from('profiles')
    .update(validatedData)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUsername(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const username = formData.get('username') as string;
  
  const validatedData = updateUsernameSchema.parse({
    username: username.toLowerCase()
  });
  
  // Check if username is available
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', validatedData.username)
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
    .update({ username: validatedData.username })
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Create redirect if username changed
  if (currentProfile?.username && currentProfile.username !== validatedData.username) {
    await supabase
      .from('username_redirects')
      .insert([{
        old_username: currentProfile.username,
        new_username: validatedData.username,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }]);
  }
  
  return data;
}

export async function updateTheme(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const theme = JSON.parse(formData.get('theme') as string);
  
  const validatedData = updateThemeSchema.parse({ theme });
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ theme: validatedData.theme })
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Friendships
export async function handleFriendship(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const friend_id = formData.get('friend_id') as string;
  const action = formData.get('action') as string;
  
  const validatedData = friendshipActionSchema.parse({ friend_id, action });
  
  switch (validatedData.action) {
    case 'send':
      const { data, error } = await supabase
        .from('friendships')
        .insert([{
          user_id: user.id,
          friend_id: validatedData.friend_id,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: validatedData.friend_id,
          type: 'friend_request',
          entity_id: user.id
        }]);
      
      return data;
      
    case 'accept':
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', validatedData.friend_id)
        .eq('friend_id', user.id);
      
      // Create reciprocal friendship
      await supabase
        .from('friendships')
        .insert([{
          user_id: user.id,
          friend_id: validatedData.friend_id,
          status: 'accepted'
        }]);
      
      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: validatedData.friend_id,
          type: 'friend_accepted',
          entity_id: user.id
        }]);
      
      break;
      
    case 'decline':
      await supabase
        .from('friendships')
        .delete()
        .eq('user_id', validatedData.friend_id)
        .eq('friend_id', user.id);
      break;
      
    case 'block':
      await supabase
        .from('friendships')
        .upsert([{
          user_id: user.id,
          friend_id: validatedData.friend_id,
          status: 'blocked'
        }]);
      break;
  }
}

// Profile Comments
export async function createProfileComment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const target_user_id = formData.get('target_user_id') as string;
  const body = formData.get('body') as string;
  
  const validatedData = createProfileCommentSchema.parse({
    target_user_id,
    body: sanitizeText(body)
  });
  
  const { data, error } = await supabase
    .from('profile_comments')
    .insert([{
      author_user_id: user.id,
      ...validatedData
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  // Create notification
  await supabase
    .from('notifications')
    .insert([{
      user_id: validatedData.target_user_id,
      type: 'profile_comment',
      entity_id: data.id
    }]);
  
  return data;
}

export async function moderateProfileComment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const comment_id = formData.get('comment_id') as string;
  const action = formData.get('action') as string;
  
  const validatedData = moderateProfileCommentSchema.parse({ comment_id, action });
  
  const status = validatedData.action === 'approve' ? 'approved' : 'rejected';
  
  const { data, error } = await supabase
    .from('profile_comments')
    .update({ status })
    .eq('id', validatedData.comment_id)
    .eq('target_user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  
  // Create notification if approved
  if (status === 'approved') {
    await supabase
      .from('notifications')
      .insert([{
        user_id: data.author_user_id,
        type: 'profile_comment_approved',
        entity_id: data.id
      }]);
  }
  
  return data;
}

// Reports
export async function createReport(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const target_type = formData.get('target_type') as string;
  const target_id = formData.get('target_id') as string;
  const reason = formData.get('reason') as string;
  
  const validatedData = createReportSchema.parse({
    target_type,
    target_id,
    reason: sanitizeText(reason)
  });
  
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      reporter_id: user.id,
      ...validatedData
    }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function moderateReport(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const isUserAdmin = await isAdmin(user.id);
  if (!isUserAdmin) throw new Error('Forbidden');
  
  if (!checkRateLimit(user.id, 'unknown')) {
    throw new Error('Rate limit exceeded');
  }
  
  const report_id = formData.get('report_id') as string;
  const action = formData.get('action') as string;
  const notes = formData.get('notes') as string;
  
  const validatedData = moderateReportSchema.parse({ report_id, action, notes });
  
  const { data, error } = await supabase
    .from('reports')
    .update({ status: 'actioned' })
    .eq('id', validatedData.report_id)
    .select()
    .single();
    
  if (error) throw error;
  
  // TODO: Implement actual content removal/user banning based on action
  // This would involve removing content, updating user status, etc.
  
  return data;
}

// Notifications
export async function markNotificationRead(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const notification_id = formData.get('notification_id') as string;
  
  const validatedData = markNotificationReadSchema.parse({ notification_id });
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', validatedData.notification_id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}