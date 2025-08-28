import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usernameSchema, isReservedUsername } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';

export default function ChooseUsername() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    try {
      usernameSchema.parse(value);
    } catch {
      setIsAvailable(false);
      return;
    }

    if (isReservedUsername(value)) {
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
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
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
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        await refreshProfile();
        toast({
          title: 'Success',
          description: 'Your username has been set!'
        });
        navigate('/app');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Username</CardTitle>
          <CardDescription>
            This will be your unique identifier on Top8. Choose wisely - you can only change it once!
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