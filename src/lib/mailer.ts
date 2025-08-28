// Resend email integration for transactional emails
// Auth emails still go through Supabase SMTP

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const emailTemplates = {
  welcome: (username: string, profileUrl: string): Omit<EmailTemplate, 'to'> => ({
    subject: 'Welcome to Top8!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Top8, @${username}!</h1>
        <p>Your profile is now live and ready to share with friends.</p>
        <p>
          <a href="${profileUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Profile
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          You can customize your profile anytime in settings.
        </p>
      </div>
    `,
    from: 'Top8 <hello@top8.io>'
  }),
  
  friendRequest: (fromUsername: string, toUsername: string): Omit<EmailTemplate, 'to'> => ({
    subject: `${fromUsername} sent you a friend request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Friend Request</h2>
        <p><strong>@${fromUsername}</strong> wants to be friends with you on Top8.</p>
        <p>
          <a href="https://top8.io/app" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Request
          </a>
        </p>
      </div>
    `,
    from: 'Top8 <notifications@top8.io>'
  }),
  
  profileComment: (fromUsername: string, toUsername: string, comment: string): Omit<EmailTemplate, 'to'> => ({
    subject: `${fromUsername} commented on your profile`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Profile Comment</h2>
        <p><strong>@${fromUsername}</strong> left a comment on your profile:</p>
        <blockquote style="border-left: 3px solid #2563eb; padding-left: 16px; margin: 16px 0; color: #374151;">
          ${comment}
        </blockquote>
        <p>
          <a href="https://top8.io/app" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Profile
          </a>
        </p>
      </div>
    `,
    from: 'Top8 <notifications@top8.io>'
  })
};

export async function sendEmail(template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - email would be sent in production');
    return { success: true }; // Don't fail in development
  }
  
  try {
    await resend.emails.send({
      from: template.from || 'Top8 <hello@top8.io>',
      to: template.to,
      subject: template.subject,
      html: template.html
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  const profileUrl = `https://${username}.top8.io`;
  const template = emailTemplates.welcome(username, profileUrl);
  
  await sendEmail({
    ...template,
    to: email
  });
}

export async function sendFriendRequestEmail(toEmail: string, fromUsername: string, toUsername: string): Promise<void> {
  const template = emailTemplates.friendRequest(fromUsername, toUsername);
  
  await sendEmail({
    ...template,
    to: toEmail
  });
}

export async function sendProfileCommentEmail(
  toEmail: string, 
  fromUsername: string, 
  toUsername: string, 
  comment: string
): Promise<void> {
  const template = emailTemplates.profileComment(fromUsername, toUsername, comment);
  
  await sendEmail({
    ...template,
    to: toEmail
  });
}