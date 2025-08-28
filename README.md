# Top8.io - Nostalgic Social Network

A MySpace-inspired social network built with React, TypeScript, Tailwind CSS, and Supabase.

## 🌟 Features

- **User Authentication**: Email magic links + Google OAuth
- **Custom Profiles**: Themed profiles with custom backgrounds and colors  
- **Subdomain Profiles**: Access profiles via `{username}.top8.io`
- **Posts & Comments**: Share updates with friends
- **Profile Comments (Guestbook)**: Classic MySpace-style profile commenting
- **Friendship System**: Send/accept friend requests
- **Notifications**: Real-time updates for interactions
- **Moderation Tools**: Content reporting and admin moderation
- **Security**: Rate limiting, content sanitization, RLS policies

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM

## 📋 Database Schema

- `profiles` - User profiles with themes and display info
- `posts` - User posts with visibility controls
- `comments` - Post comments
- `friendships` - Friend relationships with status
- `profile_comments` - Profile guestbook comments with moderation
- `notifications` - User notifications
- `reports` - Content reporting system
- `username_redirects` - Username change history

## ⚙️ Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Resend Email API
RESEND_API_KEY=your-resend-api-key-here

# Site URL
VITE_SITE_URL=http://localhost:8080
```

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd top8-social-network
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. The database schema is already created in this project
3. Configure authentication providers (Email + Google OAuth)
4. Set up storage bucket for images (already configured)
5. RLS policies are already in place

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials from your project settings
3. Configure authentication redirect URLs in Supabase dashboard

### 4. Authentication Setup

#### Resend Email Configuration
1. Create account at [Resend](https://resend.com)
2. Verify your sending domain 
3. Create API key at [Resend API Keys](https://resend.com/api-keys)
4. In Supabase → Auth → SMTP:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend` (or `apikey`)
   - Password: Your `RESEND_API_KEY`
   - From: `Top8.io <info@yourdomain.com>`

#### Google OAuth Setup
1. Create Google OAuth client in Google Cloud Console
2. Add authorized redirect URIs:
   - `http://localhost:8080/auth/callback`
   - `https://app.top8.io/auth/callback`
3. Add client ID/secret to Supabase → Auth → Providers → Google

#### Supabase Auth URLs
- **Authentication > URL Configuration**: 
  - Site URL: `http://localhost:8080` (local) or your domain
  - Redirect URLs: Add your callback URLs

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:8080`

## 🌐 Subdomain Routing

The app supports subdomain routing where `{username}.top8.io` automatically redirects to `/u/{username}`. 

**For Production:**
1. Set up wildcard DNS: `*.top8.io` → your server IP
2. Configure your hosting to handle wildcard subdomains
3. The client-side routing will automatically detect and redirect

**Reserved Subdomains:**
- `app`, `auth`, `api`, `admin`, `cdn`, `img`, `static`, `www`, `support`, `status`, `mail`, `m`, `dev`, `test`, `stage`

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. For subdomain support:
   - Add your custom domain (e.g., `top8.io`)
   - Configure wildcard subdomain: `*.top8.io`
4. Deploy automatically on push to main

### Other Platforms

The app is a standard Vite React app and can be deployed to:
- Netlify (with wildcard domain support)
- Railway
- Heroku
- Any static hosting service with custom domain support

## 📱 Features Overview

### Authentication
- Magic link email authentication
- Google OAuth integration
- Protected routes with automatic redirects
- Username selection after first login

### Profile System
- Customizable themes (colors, backgrounds)
- Avatar uploads via Supabase Storage
- Bio and display name customization
- Username changes (limited to one)
- Subdomain access: `username.top8.io`

### Social Features
- Public/friends-only posts
- Real-time notifications
- Friend request system
- Profile commenting with moderation queue

### Security & Moderation
- Rate limiting on all write operations
- Content sanitization (DOMPurify)
- Row Level Security (RLS) policies
- Content reporting system
- Admin moderation interface

## 📁 File Structure

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks (useAuth)
├── lib/               # Utility functions (auth, validation, subdomain)
├── pages/             # Route components
│   ├── settings/      # Settings pages
│   ├── moderation/    # Moderation tools
│   └── admin/         # Admin interfaces
└── integrations/      # Supabase client and types
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the nostalgic internet era**