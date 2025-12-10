import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Settings, Store, Phone, Mail, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function AdminSettings() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  // These would typically come from a settings table in the database
  const [settings, setSettings] = useState({
    storeName: 'ALPEN STORE LTD',
    email: 'info@alpenstore.com.ng',
    phone: '0802371764',
    whatsapp: '09168877858',
    address: 'No CO8 Gwarzo Road, Along Kabuga, behind F.C.E, Kano',
    instagram: '@alpenstores',
    facebook: '@alpenstores',
    tiktok: '@alpenstores',
    aboutText: 'ALPEN STORE LTD is a premium retail brand based in Kano, Nigeria with 10+ years of experience selling Arabian perfumes, Islamic wellness products, and cosmetics.',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSave = async () => {
    setSaving(true);
    // In a real implementation, you would save these to a settings table
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">Site Settings</h1>
              <p className="text-sm text-muted-foreground">Configure your store</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutText">About Text</Label>
                <Textarea
                  id="aboutText"
                  value={settings.aboutText}
                  onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Your social media handles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={settings.tiktok}
                    onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}