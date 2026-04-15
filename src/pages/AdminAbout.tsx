import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Edit2, Save, Users, Crown, Briefcase, MapPin, UserCircle } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
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
  image_url: string | null;
  display_order: number;
}

const SECTIONS = [
  { value: 'ceo', label: 'CEO', icon: Crown, description: 'Chief Executive Officer' },
  { value: 'board', label: 'Board of Directors', icon: Users, description: 'Board members' },
  { value: 'management', label: 'Management Team', icon: Briefcase, description: 'Management staff' },
  { value: 'branch', label: 'Branch Managers', icon: MapPin, description: 'Branch managers' },
];

export default function AdminAbout() {
  const { user, isAdmin, isLoading: authLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [editingContent, setEditingContent] = useState<Partial<ContentBlock> | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);

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
      supabase.from('site_content').select('*').eq('page_key', 'about').order('display_order'),
    ]);
    if (membersRes.data) setMembers(membersRes.data);
    if (contentRes.data) setContentBlocks(contentRes.data);
    setLoading(false);
  };

  const openAddMember = (section: string) => {
    setEditingMember({ section, display_order: 0 });
    setMemberDialogOpen(true);
  };

  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberDialogOpen(true);
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
          image_url: editingContent.image_url,
          display_order: editingContent.display_order || 0,
        }).eq('id', editingContent.id)
      : await supabase.from('site_content').insert({
          page_key: 'about',
          section_key: editingContent.section_key,
          title: editingContent.title,
          content: editingContent.content,
          image_url: editingContent.image_url,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold">About Us Management</h1>
            <p className="text-sm text-muted-foreground">{members.length} team members</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Each section gets its own card with its own Add button */}
        {SECTIONS.map(section => {
          const sectionMembers = members.filter(m => m.section === section.value);
          const SectionIcon = section.icon;
          return (
            <Card key={section.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <SectionIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">{sectionMembers.length} member{sectionMembers.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => openAddMember(section.value)}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : sectionMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No {section.label.toLowerCase()} added yet. Click "Add" to add one.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sectionMembers.map(member => (
                      <div key={member.id} className="relative group border rounded-lg overflow-hidden">
                        {member.image_url && (
                          <div className="aspect-[4/3] overflow-hidden bg-muted">
                            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-semibold text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.title || member.role}</p>
                          {member.branch_name && <p className="text-xs text-primary mt-0.5">{member.branch_name}</p>}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEditMember(member)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteMember(member.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Page Content Blocks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Page Content</CardTitle>
                <p className="text-sm text-muted-foreground">{contentBlocks.length} content block{contentBlocks.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingContent({ display_order: 0 }); setContentDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : contentBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No content blocks yet. Click "Add" to create one.</p>
            ) : (
              <div className="grid gap-3">
                {contentBlocks.map(block => (
                  <div key={block.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{block.title || block.section_key}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{block.content}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingContent(block); setContentDialogOpen(true); }}>
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
      </main>

      {/* Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember?.id ? 'Edit' : 'Add'} {SECTIONS.find(s => s.value === editingMember?.section)?.label || 'Team Member'}</DialogTitle>
          </DialogHeader>
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
            <div>
              <Label>Photo</Label>
              <ImageUploader
                currentUrl={editingMember?.image_url || null}
                onImageChange={(url) => setEditingMember(prev => ({ ...prev, image_url: url }))}
                folder="about"
              />
            </div>
            <div><Label>Display Order</Label><Input type="number" value={editingMember?.display_order || 0} onChange={e => setEditingMember(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
            <Button onClick={saveMember} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingContent?.id ? 'Edit' : 'Add'} Content Block</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Section Key *</Label><Input value={editingContent?.section_key || ''} onChange={e => setEditingContent(prev => ({ ...prev, section_key: e.target.value }))} placeholder="e.g. hero, story, values" disabled={!!editingContent?.id} /></div>
            <div><Label>Title</Label><Input value={editingContent?.title || ''} onChange={e => setEditingContent(prev => ({ ...prev, title: e.target.value }))} /></div>
            <div><Label>Content</Label><Textarea rows={5} value={editingContent?.content || ''} onChange={e => setEditingContent(prev => ({ ...prev, content: e.target.value }))} /></div>
            <div><Label>Display Order</Label><Input type="number" value={editingContent?.display_order || 0} onChange={e => setEditingContent(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
            <div>
              <Label>Image</Label>
              <ImageUploader
                currentUrl={editingContent?.image_url || null}
                onImageChange={(url) => setEditingContent(prev => ({ ...prev, image_url: url }))}
                folder="about"
              />
            </div>
            <Button onClick={saveContent} className="w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
