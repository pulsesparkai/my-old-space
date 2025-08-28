import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/aliases';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [profileComments, setProfileComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchPosts();
      fetchProfileComments();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!profile) return;
    
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })
        .limit(10);
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchProfileComments = async () => {
    if (!profile) return;
    
    try {
      // 1) fetch profile comments
      const { data: pcs } = await supabase
        .from('profile_comments')
        .select('*')
        .eq('target_user_id', profile.user_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!pcs?.length) {
        setProfileComments([]);
        return;
      }

      // 2) fetch author profiles
      const authorIds = Array.from(new Set(pcs.map(c => c.author_user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', authorIds);

      const profilesById = new Map();
      (profiles || []).forEach(p => profilesById.set(p.user_id, p));

      // 3) merge
      const enriched = pcs.map(c => ({
        ...c,
        profiles: profilesById.get(c.author_user_id) || null
      }));

      setProfileComments(enriched);
    } catch (err) {
      console.error('Error fetching profile comments:', err);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim() || !profile) return;

    try {
      const { error } = await supabase
        .from('profile_comments')
        .insert([{
          target_user_id: profile.user_id,
          author_user_id: user.id,
          body: newComment.trim()
        }]);

      if (error) throw error;
      
      setNewComment('');
      toast({
        title: 'Comment submitted',
        description: 'Your comment is pending approval'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Profile not found</h1>
      </div>
    );
  }

  const themeStyles = {
    backgroundColor: profile.theme?.accent + '10',
    borderColor: profile.theme?.accent
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: profile.theme?.bg ? `var(--bg-${profile.theme.bg})` : undefined }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card style={themeStyles}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.display_name?.[0] || profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-2xl font-bold" style={{ color: profile.theme?.accent }}>
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              {profile.bio && (
                <p className="max-w-md mx-auto">{profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Posts</h2>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="p-3 border rounded">
                      <p className="text-sm">{post.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No posts yet</p>
              )}
            </CardContent>
          </Card>

          {/* Profile Comments (Guestbook) */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Guestbook</h2>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="space-y-4 mb-6">
                  <Textarea
                    placeholder="Leave a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={500}
                  />
                  <Button onClick={submitComment} disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </div>
              )}
              
              {profileComments.length > 0 ? (
                <div className="space-y-4">
                  {profileComments.map((comment) => (
                    <div key={comment.id} className="p-3 border rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.profiles?.avatar_url} />
                          <AvatarFallback>
                            {comment.profiles?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {comment.profiles?.display_name || comment.profiles?.username}
                        </span>
                      </div>
                      <p className="text-sm">{comment.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No comments yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}