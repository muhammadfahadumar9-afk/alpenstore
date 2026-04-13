import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, FileText, Home, Info, ShoppingBag, Image, Phone, Shield, ExternalLink, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  title: string | null;
  bio: string | null;
  image_url: string | null;
  section: string;
  branch_name: string | null;
  display_order: number;
}

interface ContentBlock {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  content: string | null;
  display_order: number;
}

const pages = [
  { title: 'Home Page', description: 'Main landing page with hero and featured products', icon: Home, href: '/', key: 'home' },
  { title: 'About Us', description: 'Company story, team & values', icon: Info, href: '/about', key: 'about' },
  { title: 'Shop', description: 'Product catalog with filters', icon: ShoppingBag, href: '/shop', key: 'shop' },
  { title: 'Gallery', description: 'Product image showcase', icon: Image, href: '/gallery', key: 'gallery' },
  { title: 'Contact', description: 'Contact form and branch locations', icon: Phone, href: '/contact', key: 'contact' },
  { title: 'Privacy Policy', description: 'Data handling and refund policy', icon: Shield, href: '/privacy', key: 'privacy' },
];

const SECTIONS = [
  { value: 'ceo', label: 'CEO' },
  { value: 'board', label: 'Board of Directors' },
  { value: 'management', label: 'Management Team' },
  { value: 'branch', label: 'Branch Manager' },
];

export default function AdminPages() {
  const { user, isAdmin, isLoading: authLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [allContent, setAllContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [editingContent, setEditingContent] = useState<Partial<ContentBlock> | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [contentPageKey, setContentPageKey] = useState('about');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  
  const getContentForPage = (pageKey: string) => allContent.filter(c => c.page_key === pageKey);

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
    const [membersRes, contentRes] = await Promise.all([
      supabase.from('team_members').select('*').order('display_order'),
      supabase.from('site_content').select('*').order('display_order'),
    ]);
    if (membersRes.data) setMembers(membersRes.data);
    if (contentRes.data) setAllContent(contentRes.data);
    setLoading(false);
  };

  const saveMember = async () => {
    if (!editingMember?.name) { toast.error('Name is required'); return; }
    const payload = {
      name: editingMember.name,
      role: editingMember.role,
      title: editingMember.title,
      bio: editingMember.bio,
      image_url: editingMember.image_url,
      section: editingMember.section || 'management',
      branch_name: editingMember.branch_name,
      display_order: editingMember.display_order || 0,
    };
    const { error } = editingMember.id
      ? await supabase.from('team_members').update(payload).eq('id', editingMember.id)
      : await supabase.from('team_members').insert(payload);
    if (error) { toast.error('Failed to save'); return; }
    toast.success(editingMember.id ? 'Member updated' : 'Member added');
    setMemberDialogOpen(false);
    setEditingMember(null);
    fetchData();
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Delete this member?')) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Member deleted');
    fetchData();
  };

  const saveContent = async () => {
    if (!editingContent?.section_key) { toast.error('Section key is required'); return; }
    const { error } = editingContent.id
      ? await supabase.from('site_content').update({
          title: editingContent.title,
          content: editingContent.content,
          display_order: editingContent.display_order || 0,
        }).eq('id', editingContent.id)
      : await supabase.from('site_content').insert({
          page_key: contentPageKey,
          section_key: editingContent.section_key,
          title: editingContent.title,
          content: editingContent.content,
          display_order: editingContent.display_order || 0,
        });
    if (error) { toast.error('Failed to save'); return; }
    toast.success(editingContent.id ? 'Content updated' : 'Content added');
    setContentDialogOpen(false);
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

  const renderContentList = (blocks: ContentBlock[], pageKey: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Content Blocks</h3>
        <Dialog open={contentDialogOpen && contentPageKey === pageKey} onOpenChange={(open) => { setContentDialogOpen(open); if (open) setContentPageKey(pageKey); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingContent({ display_order: 0 }); setContentPageKey(pageKey); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Block
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingContent?.id ? 'Edit' : 'Add'} Content Block</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Section Key *</Label><Input value={editingContent?.section_key || ''} onChange={e => setEditingContent(prev => ({ ...prev, section_key: e.target.value }))} placeholder="e.g. hero, story, values" disabled={!!editingContent?.id} /></div>
              <div><Label>Title</Label><Input value={editingContent?.title || ''} onChange={e => setEditingContent(prev => ({ ...prev, title: e.target.value }))} /></div>
              <div><Label>Content</Label><Textarea rows={5} value={editingContent?.content || ''} onChange={e => setEditingContent(prev => ({ ...prev, content: e.target.value }))} /></div>
              <div><Label>Display Order</Label><Input type="number" value={editingContent?.display_order || 0} onChange={e => setEditingContent(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
              <Button onClick={saveContent} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {blocks.length === 0 ? (
        <p className="text-muted-foreground text-center py-6 text-sm">No content blocks yet.</p>
      ) : (
        <div className="grid gap-3">
          {blocks.map(block => (
            <Card key={block.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{block.title || block.section_key}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{block.content}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingContent(block); setContentPageKey(pageKey); setContentDialogOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteContent(block.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">Page Management</h1>
              <p className="text-sm text-muted-foreground">Manage website pages & content</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Cards with Edit */}
        {!selectedPage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => {
              const pageContent = getContentForPage(page.key);
              return (
                <Card key={page.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <page.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <CardDescription>{page.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="default" className="w-full" onClick={() => setSelectedPage(page.key)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Manage Content ({page.key === 'about' ? members.length + pageContent.length : pageContent.length})
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={page.href} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" /> View Page
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Back button and page title */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedPage(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-serif font-semibold">
                {pages.find(p => p.key === selectedPage)?.title} — Content
              </h2>
            </div>

            {/* Team Members (only for About page) */}
            {selectedPage === 'about' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingMember({ section: 'management', display_order: 0 })}>
                        <Plus className="w-4 h-4 mr-2" /> Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>{editingMember?.id ? 'Edit' : 'Add'} Team Member</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div><Label>Name *</Label><Input value={editingMember?.name || ''} onChange={e => setEditingMember(prev => ({ ...prev, name: e.target.value }))} /></div>
                        <div><Label>Section</Label>
                          <Select value={editingMember?.section || 'management'} onValueChange={v => setEditingMember(prev => ({ ...prev, section: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{SECTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div><Label>Title/Position</Label><Input value={editingMember?.title || ''} onChange={e => setEditingMember(prev => ({ ...prev, title: e.target.value }))} /></div>
                        <div><Label>Role</Label><Input value={editingMember?.role || ''} onChange={e => setEditingMember(prev => ({ ...prev, role: e.target.value }))} /></div>
                        {editingMember?.section === 'branch' && (
                          <div><Label>Branch Name</Label><Input value={editingMember?.branch_name || ''} onChange={e => setEditingMember(prev => ({ ...prev, branch_name: e.target.value }))} /></div>
                        )}
                        <div><Label>Bio</Label><Textarea value={editingMember?.bio || ''} onChange={e => setEditingMember(prev => ({ ...prev, bio: e.target.value }))} /></div>
                        <div><Label>Image URL</Label><Input value={editingMember?.image_url || ''} onChange={e => setEditingMember(prev => ({ ...prev, image_url: e.target.value }))} /></div>
                        <div><Label>Display Order</Label><Input type="number" value={editingMember?.display_order || 0} onChange={e => setEditingMember(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
                        <Button onClick={saveMember} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {loading ? <Skeleton className="h-32 w-full" /> : (
                  <div className="space-y-4">
                    {SECTIONS.map(section => {
                      const sectionMembers = members.filter(m => m.section === section.value);
                      if (sectionMembers.length === 0) return null;
                      return (
                        <div key={section.value}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{section.label}</h4>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sectionMembers.map(member => (
                              <Card key={member.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.title || member.role}</p>
                                    {member.branch_name && <p className="text-xs text-primary">{member.branch_name}</p>}
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingMember(member); setMemberDialogOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMember(member.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {members.length === 0 && <p className="text-muted-foreground text-center py-8">No team members yet. Add your first member above.</p>}
                  </div>
                )}
              </div>
            )}

            {/* Content Blocks for selected page */}
            {renderContentList(getContentForPage(selectedPage), selectedPage)}
          </div>
        )}
      </main>
    </div>
  );
}
