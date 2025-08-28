import { z } from 'zod';

// Username validation
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens')
  .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Username cannot start or end with a hyphen')
  .refine(val => !val.includes('--'), 'Username cannot contain consecutive hyphens');

// Reserved usernames
const RESERVED_USERNAMES = [
  'app', 'auth', 'api', 'admin', 'cdn', 'img', 'static', 'www', 
  'support', 'status', 'mail', 'm', 'dev', 'test', 'stage'
];

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
}

// Post schemas
export const createPostSchema = z.object({
  body: z.string().min(1, 'Post cannot be empty').max(1000, 'Post is too long'),
  visibility: z.enum(['public', 'friends']).default('public'),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image']),
    alt: z.string().optional()
  })).optional()
});

export const editPostSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1, 'Post cannot be empty').max(1000, 'Post is too long'),
  visibility: z.enum(['public', 'friends'])
});

// Comment schemas
export const createCommentSchema = z.object({
  post_id: z.string().uuid(),
  body: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long')
});

// Profile schemas
export const updateProfileSchema = z.object({
  display_name: z.string().max(100, 'Display name is too long'),
  bio: z.string().max(500, 'Bio is too long'),
  avatar_url: z.string().url().optional().or(z.literal(''))
});

export const updateUsernameSchema = z.object({
  username: usernameSchema
});

export const updateThemeSchema = z.object({
  theme: z.object({
    preset: z.string(),
    bg: z.string(),
    accent: z.string(),
    font: z.string().optional()
  })
});

// Friendship schemas
export const friendshipActionSchema = z.object({
  friend_id: z.string().uuid(),
  action: z.enum(['send', 'accept', 'decline', 'block'])
});

// Profile comment schemas
export const createProfileCommentSchema = z.object({
  target_user_id: z.string().uuid(),
  body: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long')
});

export const moderateProfileCommentSchema = z.object({
  comment_id: z.string().uuid(),
  action: z.enum(['approve', 'reject'])
});

// Report schemas
export const createReportSchema = z.object({
  target_type: z.enum(['post', 'comment', 'profile', 'profile_comment']),
  target_id: z.string().uuid(),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason is too long')
});

export const moderateReportSchema = z.object({
  report_id: z.string().uuid(),
  action: z.enum(['dismiss', 'remove_content', 'ban_user']),
  notes: z.string().optional()
});

// Notification schemas
export const markNotificationReadSchema = z.object({
  notification_id: z.string().uuid()
});