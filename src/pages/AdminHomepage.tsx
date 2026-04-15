import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Edit2, Save, Home, Star, Layout, MessageSquare, Truck } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentBlock {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  display_order: number;
}

const HOME_SECTIONS = [
  { prefix: 'hero', label: 'Hero Section', icon: Layout, description: 'Main banner title, subtitle, CTA text' },
  { prefix: 'features', label: 'Why Choose Us', icon: Star, description: 'Feature highlights and trust signals' },
  { prefix: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'Customer reviews and quotes' },
  { prefix: 'cta', label: 'Call to Action', icon: Truck, description: 'Bottom CTA section content' },
];

export default function AdminHomepage() {
  const { user, isAdmin, isLoading: authLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<Partial<ContentBlock> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingToSection, setAddingToSection] = useState<string | null>(null);

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

  const openAddContent = (sectionPrefix: string) => {
    setAddingToSection(sectionPrefix);
    setEditingContent({ section_key: sectionPrefix + '_', display_order: 0 });
    setDialogOpen(true);
  };

  const saveContent = async () => {
    if (!editingContent?.section_key) { toast.error('Section key is required'); return; }
    const { error } = editingContent.id
      ? await supabase.from('site_content').update({
          title: editingContent.title,
          content: editingContent.content,
          image_url: editingContent.image_url,
          display_order: editingContent.display_order || 0,
        }).eq('id', editingContent.id)
      : await supabase.from('site_content').insert({
          page_key: 'home',
          section_key: editingContent.section_key,
          title: editingContent.title,
          content: editingContent.content,
          image_url: editingContent.image_url,
          display_order: editingContent.display_order || 0,
        });
    if (error) { toast.error('Failed to save'); return; }
    toast.success(editingContent.id ? 'Content updated' : 'Content added');
    setDialogOpen(false);
    setEditingContent(null);
    setAddingToSection(null);
    fetchData();
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Delete this content block?')) return;
    const { error } = await supabase.from('site_content').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Content deleted');
    fetchData();
  };

  const getBlocksForSection = (prefix: string) => {
    return contentBlocks.filter(b => b.section_key.startsWith(prefix));
  };

  // Blocks that don't match any known section
  const otherBlocks = contentBlocks.filter(b => !HOME_SECTIONS.some(s => b.section_key.startsWith(s.prefix)));

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
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold">Home Page Management</h1>
            <p className="text-sm text-muted-foreground">{contentBlocks.length} content blocks</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {HOME_SECTIONS.map(section => {
          const blocks = getBlocksForSection(section.prefix);
          const SectionIcon = section.icon;
          return (
            <Card key={section.prefix}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <SectionIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => openAddContent(section.prefix)}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : blocks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No {section.label.toLowerCase()} content yet. Click "Add" to create one.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {blocks.map(block => (
                      <div key={block.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm">{block.title || block.section_key}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{block.content}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingContent(block); setAddingToSection(null); setDialogOpen(true); }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteContent(block.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Other/uncategorized blocks */}
        {otherBlocks.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Other Content</CardTitle>
              <Button size="sm" variant="outline" onClick={() => { setEditingContent({ display_order: 0 }); setAddingToSection(null); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {otherBlocks.map(block => (
                  <div key={block.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{block.title || block.section_key}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{block.content}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingContent(block); setAddingToSection(null); setDialogOpen(true); }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteContent(block.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Content Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingContent?.id ? 'Edit' : 'Add'} Content Block</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Section Key *</Label><Input value={editingContent?.section_key || ''} onChange={e => setEditingContent(prev => ({ ...prev, section_key: e.target.value }))} placeholder="e.g. hero_title, features_delivery" disabled={!!editingContent?.id} /></div>
            <div><Label>Title</Label><Input value={editingContent?.title || ''} onChange={e => setEditingContent(prev => ({ ...prev, title: e.target.value }))} /></div>
            <div><Label>Content</Label><Textarea rows={5} value={editingContent?.content || ''} onChange={e => setEditingContent(prev => ({ ...prev, content: e.target.value }))} /></div>
            <div><Label>Display Order</Label><Input type="number" value={editingContent?.display_order || 0} onChange={e => setEditingContent(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
            <div>
              <Label>Image</Label>
              <ImageUploader
                currentUrl={editingContent?.image_url || null}
                onImageChange={(url) => setEditingContent(prev => ({ ...prev, image_url: url }))}
                folder="home"
              />
            </div>
            <Button onClick={saveContent} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
