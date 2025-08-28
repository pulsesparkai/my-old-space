import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { validateUsername, sanitizeUsername } from '@/lib/sanitize';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Settings } from 'lucide-react';

export default function ChooseUsername() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    const validation = validateUsername(value);
    if (!validation.valid) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value.toLowerCase())
        .single();

      setIsAvailable(!data);
    } catch (err) {
      // If no data found, username is available
      setIsAvailable(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleaned = sanitizeUsername(value);
    setUsername(cleaned);
    
    // Debounce username checking
    const timeoutId = setTimeout(() => checkUsername(cleaned), 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAvailable) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          username: username.toLowerCase(),
          display_name: '',
          bio: ''
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Username taken',
            description: 'This username is already taken. Please choose another.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          });
        }
      } else {
        await refreshProfile();
        setIsComplete(true);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputStatus = () => {
    if (!username) return '';
    if (isChecking) return 'Checking...';
    if (isAvailable === true) return '✓ Available';
    if (isAvailable === false) return '✗ Not available';
    return '';
  };

  const isValid = username.length >= 3 && isAvailable === true;

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">🎉 Welcome to Top8!</CardTitle>
            <CardDescription>
              Your profile is ready at <strong>https://{username}.top8.io</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.open(`https://${username}.top8.io`, '_blank')}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/settings/profile')}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Username</CardTitle>
          <CardDescription>
            This will be your unique identifier. Your profile will be available at https://{username || 'username'}.top8.io
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={loading}
                className={`${
                  isAvailable === true ? 'border-green-500' : 
                  isAvailable === false ? 'border-red-500' : ''
                }`}
              />
              <p className="text-sm text-muted-foreground">
                {getInputStatus()}
              </p>
              <p className="text-xs text-muted-foreground">
                3-30 characters, lowercase letters, numbers, and hyphens only
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !isValid || isChecking}
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}