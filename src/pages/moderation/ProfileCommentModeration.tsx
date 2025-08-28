import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, X } from 'lucide-react';
import type { ProfileComment, Profile } from '@/types/aliases';

interface EnrichedProfileComment extends ProfileComment {
  author_profile?: Profile | null;
}

export default function ProfileCommentModeration() {
  const [comments, setComments] = useState<EnrichedProfileComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingComments();
  }, [user]);

  const fetchPendingComments = async () => {
    if (!user) return;

    try {
      // 1) fetch profile comments
      const { data: pcs, error } = await supabase
        .from('profile_comments')
        .select('*')
        .eq('target_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!pcs?.length) {
        setComments([]);
        setLoading(false);
        return;
      }

      // 2) fetch author profiles
      const authorIds = Array.from(new Set((pcs as ProfileComment[]).map(c => c.author_user_id)));
      let profilesById = new Map<string, Profile>();
      if (authorIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', authorIds);
        (profiles || []).forEach(p => profilesById.set((p as Profile).user_id, p as Profile));
      }

      // 3) merge
      const enriched = (pcs as ProfileComment[]).map(c => ({
        ...c,
        author_profile: profilesById.get(c.author_user_id) || null
      }));

      setComments(enriched as EnrichedProfileComment[]);
    } catch (err) {
      console.error('Error fetching pending comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('profile_comments')
        .update({ status })
        .eq('id', commentId)
        .eq('target_user_id', user?.id);

      if (error) throw error;

      // Remove comment from pending list
      setComments(comments.filter(c => c.id !== commentId));

      toast({
        title: 'Success',
        description: `Comment ${action}d successfully`
      });

      // Create notification if approved
      if (action === 'approve') {
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: comment.author_user_id,
              type: 'profile_comment_approved',
              entity_id: commentId
            }]);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || `Failed to ${action} comment`,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Profile Comment Moderation</h1>
          {comments.length > 0 && (
            <Badge variant="secondary">{comments.length} pending</Badge>
          )}
        </div>

        {comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No pending comments to moderate</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={comment.author_profile?.avatar_url} />
                        <AvatarFallback>
                          {comment.author_profile?.display_name?.[0] || comment.author_profile?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {comment.author_profile?.display_name || comment.author_profile?.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{comment.author_profile?.username}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 whitespace-pre-wrap">{comment.body}</p>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleModeration(comment.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModeration(comment.id, 'reject')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}