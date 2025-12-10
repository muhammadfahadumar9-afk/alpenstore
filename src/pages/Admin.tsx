import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  FileText, 
  Image, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const adminModules = [
    { title: 'Dashboard', description: 'Overview and analytics', icon: LayoutDashboard, href: '/admin' },
    { title: 'Products', description: 'Manage your product catalog', icon: Package, href: '/admin/products' },
    { title: 'Users', description: 'Manage user accounts', icon: Users, href: '#' },
    { title: 'Pages', description: 'Edit website pages', icon: FileText, href: '#' },
    { title: 'Gallery', description: 'Manage product images', icon: Image, href: '#' },
    { title: 'Settings', description: 'Configure site settings', icon: Settings, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">ALPEN STORE LTD Admin</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-2">Welcome, Administrator</h2>
          <p className="text-muted-foreground">
            Manage your website, products, and settings from this dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Card 
              key={module.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => module.href !== '#' && navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <module.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  disabled={module.href === '#'}
                >
                  {module.href === '#' ? 'Coming Soon' : `Open ${module.title}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
