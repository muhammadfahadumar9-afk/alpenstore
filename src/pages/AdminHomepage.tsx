import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit2, Save, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ContentBlock {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  content: string | null;
  display_order: number;
}

export default function AdminHomepage() {
  const { user, isAdmin, isLoading: authLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<Partial<ContentBlock> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdminLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, isAdminLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_content').select('*').eq('page_key', 'home').order('display_order');
    if (data) setContentBlocks(data);
    setLoading(false);
  };

  const saveContent = async () => {
    if (!editingContent?.section_key) { toast.error('Section key is required'); return; }
    
    if (editingContent.id) {
      const { error } = await supabase.from('site_content').update({
        title: editingContent.title,
        content: editingContent.content,
        display_order: editingContent.display_order || 0,
      }).eq('id', editingContent.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Content updated');
    } else {
      const { error } = await supabase.from('site_content').insert({
        page_key: 'home',
        section_key: editingContent.section_key,
        title: editingContent.title,
        content: editingContent.content,
        display_order: editingContent.display_order || 0,
      });
      if (error) { toast.error('Failed to add'); return; }
      toast.success('Content added');
    }
    setDialogOpen(false);
    setEditingContent(null);
    fetchData();
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Delete this content block?')) return;
    const { error } = await supabase.from('site_content').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Content deleted');
    fetchData();
  };

  if (authLoading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4"><Skeleton className="h-8 w-48" /></div>
        </header>
        <main className="container mx-auto px-4 py-8"><Skeleton className="h-64 w-full" /></main>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">Home Page Management</h1>
              <p className="text-sm text-muted-foreground">Edit homepage content sections</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold">Content Sections</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingContent({ page_key: 'home', display_order: 0 })}>
                <Plus className="w-4 h-4 mr-2" /> Add Content Block
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingContent?.id ? 'Edit' : 'Add'} Content Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Section Key *</Label><Input value={editingContent?.section_key || ''} onChange={e => setEditingContent(prev => ({ ...prev, section_key: e.target.value }))} placeholder="e.g. hero_title, hero_subtitle, cta_text" disabled={!!editingContent?.id} /></div>
                <div><Label>Title</Label><Input value={editingContent?.title || ''} onChange={e => setEditingContent(prev => ({ ...prev, title: e.target.value }))} /></div>
                <div><Label>Content</Label><Textarea rows={5} value={editingContent?.content || ''} onChange={e => setEditingContent(prev => ({ ...prev, content: e.target.value }))} /></div>
                <div><Label>Display Order</Label><Input type="number" value={editingContent?.display_order || 0} onChange={e => setEditingContent(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
                <Button onClick={saveContent} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <Skeleton className="h-32 w-full" /> : (
          <div className="grid gap-3">
            {contentBlocks.map(block => (
              <Card key={block.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{block.title || block.section_key}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{block.content}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingContent(block); setDialogOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteContent(block.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {contentBlocks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No homepage content blocks yet. Add sections like hero title, subtitle, and CTA text.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
