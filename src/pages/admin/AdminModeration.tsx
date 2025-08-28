import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, AlertTriangle, Eye, Ban, Trash2 } from 'lucide-react';
import type { Report, Profile } from '@/types/aliases';

interface EnrichedReport extends Report {
  reporter_profile?: Profile | null;
}

// This is a placeholder for admin check - implement based on your requirements
const isUserAdmin = (userId: string): boolean => {
  // TODO: Implement proper admin check
  return false; // For demo purposes
};

export default function AdminModeration() {
  const [reports, setReports] = useState<EnrichedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EnrichedReport | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (user && !isUserAdmin(user.id)) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page',
        variant: 'destructive'
      });
      navigate('/app');
      return;
    }

    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      // 1) fetch reports
      const { data: reports, error: rErr } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (rErr) throw rErr;

      if (!reports?.length) {
        setReports([]);
        setLoading(false);
        return;
      }

      // 2) fetch reporter profiles
      const reporterIds = Array.from(new Set((reports as Report[]).map(r => r.reporter_id)));
      let profilesById = new Map<string, Profile>();
      if (reporterIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', reporterIds);
        (profiles || []).forEach(p => profilesById.set((p as Profile).user_id, p as Profile));
      }

      // 3) merge
      const enriched = (reports as Report[]).map(r => ({
        ...r,
        reporter_profile: profilesById.get(r.reporter_id) || null
      }));

      setReports(enriched as EnrichedReport[]);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (action: 'dismiss' | 'remove_content' | 'ban_user') => {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'actioned'
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      // Remove from list
      setReports(reports.filter(r => r.id !== selectedReport.id));
      setSelectedReport(null);
      setActionNotes('');

      toast({
        title: 'Success',
        description: `Report ${action.replace('_', ' ')}d successfully`
      });

      // TODO: Implement actual content removal/user banning logic here
      console.log(`Action taken: ${action}`, {
        reportId: selectedReport.id,
        targetType: selectedReport.target_type,
        targetId: selectedReport.target_id,
        notes: actionNotes
      });

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to process moderation action',
        variant: 'destructive'
      });
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Post';
      case 'comment': return 'Comment';
      case 'profile': return 'Profile';
      case 'profile_comment': return 'Profile Comment';
      default: return type;
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Admin Moderation</h1>
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{reports.length} open reports</span>
          </Badge>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No open reports to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {getTargetTypeLabel(report.target_type)} Report
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Reported by @{report.reporter_profile?.username} • {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">Open</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Reason:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {report.reason}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Report</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Report Details:</h4>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Type:</span> {getTargetTypeLabel(report.target_type)}</p>
                                <p><span className="font-medium">ID:</span> {report.target_id}</p>
                                <p><span className="font-medium">Reporter:</span> @{report.reporter_profile?.username}</p>
                                <p><span className="font-medium">Date:</span> {new Date(report.created_at).toLocaleString()}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Reason:</h4>
                              <p className="text-sm bg-muted p-3 rounded">{report.reason}</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Action Notes (optional):</h4>
                              <Textarea
                                placeholder="Add notes about your decision..."
                                value={actionNotes}
                                onChange={(e) => setActionNotes(e.target.value)}
                                rows={3}
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handleModerationAction('dismiss')}
                              >
                                Dismiss Report
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleModerationAction('remove_content')}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove Content
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleModerationAction('ban_user')}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban User
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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