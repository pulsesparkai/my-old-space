import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive'
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', data.session.user.id)
            .single();

          if (!profile) {
            navigate('/choose-username');
          } else {
            navigate('/app');
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive'
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}