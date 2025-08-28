import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { signOut } from '@/lib/auth';
import { Heart, MessageCircle, Settings, Bell, User, LogOut } from 'lucide-react';

interface Post {
  id: string;
  body: string;
  visibility: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface Notification {
  id: string;
  type: string;
  read: boolean;
  created_at: string;
  entity_id?: string;
}

export default function App() {
  const [newPost, setNewPost] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          user_id: user?.id,
          body: newPost.trim(),
          visibility
        }])
        .select(`
          *,
          profiles (username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setPosts([data, ...posts]);
      setNewPost('');
      toast({
        title: 'Success',
        description: 'Post created successfully!'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create post',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/app" className="text-2xl font-bold text-primary">
            Top8
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/app/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link to={`/u/${profile?.username}`}>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/settings/profile">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Post Composer */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">What's on your mind?</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <Textarea
                    placeholder="Share something with your Top8..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    maxLength={1000}
                    disabled={loading}
                  />
                  
                  <div className="flex items-center justify-between">
                    <Select value={visibility} onValueChange={(value: 'public' | 'friends') => setVisibility(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button type="submit" disabled={!newPost.trim() || loading}>
                      {loading ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={post.profiles.avatar_url} />
                        <AvatarFallback>
                          {post.profiles.display_name?.[0] || post.profiles.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/u/${post.profiles.username}`}
                            className="font-semibold hover:underline"
                          >
                            {post.profiles.display_name || post.profiles.username}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            @{post.profiles.username}
                          </span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          {post.visibility === 'friends' && (
                            <Badge variant="secondary" className="text-xs">
                              Friends
                            </Badge>
                          )}
                        </div>
                        
                        <p className="whitespace-pre-wrap">{post.body}</p>
                        
                        <div className="flex items-center space-x-4 pt-2">
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.like_count}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comment_count}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.[0] || profile?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {profile?.display_name || profile?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{profile?.username}
                    </p>
                  </div>
                  
                  <Link to={`/u/${profile?.username}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Notifications</h3>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 rounded text-sm ${
                          !notification.read ? 'bg-muted' : ''
                        }`}
                      >
                        {notification.type === 'friend_request' && 'New friend request'}
                        {notification.type === 'friend_accepted' && 'Friend request accepted'}
                        {notification.type === 'profile_comment' && 'New profile comment'}
                        {notification.type === 'profile_comment_approved' && 'Profile comment approved'}
                      </div>
                    ))}
                    <Link to="/app/notifications">
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        View All
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notifications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}