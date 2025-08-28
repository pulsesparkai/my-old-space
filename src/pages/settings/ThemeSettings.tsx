import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

const THEME_PRESETS = [
  { value: 'classic', label: 'Classic MySpace', bg: 'stars', accent: '#ff6cab' },
  { value: 'emo', label: 'Emo Kid', bg: 'skulls', accent: '#000000' },
  { value: 'scene', label: 'Scene Queen', bg: 'rainbow', accent: '#ff00ff' },
  { value: 'indie', label: 'Indie Aesthetic', bg: 'film', accent: '#f4a261' },
  { value: 'goth', label: 'Gothic Romance', bg: 'roses', accent: '#800020' }
];

const BACKGROUNDS = [
  { value: 'stars', label: '✨ Twinkling Stars' },
  { value: 'skulls', label: '💀 Gothic Skulls' },
  { value: 'rainbow', label: '🌈 Rainbow Gradient' },
  { value: 'film', label: '🎞️ Film Strip' },
  { value: 'roses', label: '🌹 Black Roses' },
  { value: 'hearts', label: '💖 Floating Hearts' },
  { value: 'music', label: '🎵 Music Notes' }
];

const ACCENT_COLORS = [
  { value: '#ff6cab', label: 'Hot Pink' },
  { value: '#000000', label: 'Black' },
  { value: '#ff00ff', label: 'Magenta' },
  { value: '#f4a261', label: 'Orange' },
  { value: '#800020', label: 'Burgundy' },
  { value: '#4dabf7', label: 'Blue' },
  { value: '#51cf66', label: 'Green' },
  { value: '#ffd43b', label: 'Yellow' }
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState({
    preset: 'classic',
    bg: 'stars',
    accent: '#ff6cab'
  });
  const [loading, setLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile]);

  const handlePresetChange = (preset: string) => {
    const presetData = THEME_PRESETS.find(p => p.value === preset);
    if (presetData) {
      setTheme({
        preset,
        bg: presetData.bg,
        accent: presetData.accent
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Success',
        description: 'Theme updated successfully!'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update theme',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Theme Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customize Your Profile Theme</CardTitle>
            <CardDescription>
              Make your profile uniquely yours with custom themes and colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Preset Themes */}
              <div className="space-y-2">
                <Label htmlFor="preset">Theme Preset</Label>
                <Select value={theme.preset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Background */}
              <div className="space-y-2">
                <Label htmlFor="background">Background Pattern</Label>
                <Select value={theme.bg} onValueChange={(bg) => setTheme({ ...theme, bg })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUNDS.map((bg) => (
                      <SelectItem key={bg.value} value={bg.value}>
                        {bg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <Label htmlFor="accent">Accent Color</Label>
                <Select value={theme.accent} onValueChange={(accent) => setTheme({ ...theme, accent })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="p-6 rounded-lg border-2"
                  style={{ 
                    backgroundColor: theme.accent + '20',
                    borderColor: theme.accent
                  }}
                >
                  <div className="text-center">
                    <h3 className="font-bold" style={{ color: theme.accent }}>
                      Your Profile Preview
                    </h3>
                    <p className="text-sm opacity-75">
                      Background: {BACKGROUNDS.find(b => b.value === theme.bg)?.label}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Theme'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/app')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}