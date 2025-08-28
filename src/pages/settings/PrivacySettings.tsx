import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

export default function PrivacySettings() {
  const [privateProfile, setPrivateProfile] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [postVisibility, setPostVisibility] = useState('public');
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSave = () => {
    // TODO: Implement privacy settings save
    console.log('Privacy settings saved:', {
      privateProfile,
      allowComments,
      requireApproval,
      showEmail,
      postVisibility
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Privacy Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Privacy</CardTitle>
              <CardDescription>
                Control who can see your profile and interact with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="private-profile">Private Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Only friends can see your profile and posts
                  </p>
                </div>
                <Switch
                  id="private-profile"
                  checked={privateProfile}
                  onCheckedChange={setPrivateProfile}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address on your profile
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={showEmail}
                  onCheckedChange={setShowEmail}
                />
              </div>
            </CardContent>
          </Card>

          {/* Post Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>
                Control the default visibility of your posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="post-visibility">Default Post Visibility</Label>
                <Select value={postVisibility} onValueChange={setPostVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Comments & Interactions */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Interactions</CardTitle>
              <CardDescription>
                Manage how others can interact with your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-comments">Allow Profile Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others leave comments on your profile
                  </p>
                </div>
                <Switch
                  id="allow-comments"
                  checked={allowComments}
                  onCheckedChange={setAllowComments}
                />
              </div>

              {allowComments && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-approval">Require Comment Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Comments must be approved before appearing on your profile
                    </p>
                  </div>
                  <Switch
                    id="require-approval"
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blocked Users */}
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>
                Manage users you've blocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No blocked users currently
              </p>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => navigate('/app')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}