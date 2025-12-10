import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Home, Info, ShoppingBag, Image, Phone, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const pages = [
  { 
    title: 'Home Page', 
    description: 'Main landing page with hero and featured products', 
    icon: Home, 
    href: '/',
    editable: true
  },
  { 
    title: 'About Us', 
    description: 'Company story and values', 
    icon: Info, 
    href: '/about',
    editable: true
  },
  { 
    title: 'Shop', 
    description: 'Product catalog with filters', 
    icon: ShoppingBag, 
    href: '/shop',
    editable: true
  },
  { 
    title: 'Gallery', 
    description: 'Product image showcase', 
    icon: Image, 
    href: '/gallery',
    editable: true
  },
  { 
    title: 'Contact', 
    description: 'Contact form and branch locations', 
    icon: Phone, 
    href: '/contact',
    editable: true
  },
  { 
    title: 'Privacy Policy', 
    description: 'Data handling and refund policy', 
    icon: Shield, 
    href: '/privacy',
    editable: true
  },
];

export default function AdminPages() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

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
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">Page Management</h1>
              <p className="text-sm text-muted-foreground">{pages.length} website pages</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
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
              <CardContent className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={page.href} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Page
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Page Editing</CardTitle>
            <CardDescription>
              To edit page content, use the chat to describe the changes you want to make. 
              For example: "Update the About page hero text" or "Change the contact form email address".
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}