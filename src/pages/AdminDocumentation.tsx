import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  ShieldCheck,
  LogIn,
  Package,
  ShoppingBag,
  Users,
  Image,
  Settings,
  FileText,
  Key,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDocumentation() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">Admin Documentation</h1>
              <p className="text-sm text-muted-foreground">Private guide for administrators</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-lg">Confidential Information</CardTitle>
                <CardDescription>
                  This documentation contains sensitive credentials. Do not share this page or its contents.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="access" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-primary" />
                  <CardTitle>Admin Panel Access</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Login Credentials</span>
                  </div>
                  <div className="grid gap-3 pl-6">
                    <div>
                      <span className="text-sm text-muted-foreground">Admin URL:</span>
                      <code className="ml-2 px-2 py-1 bg-background rounded text-sm">
                        /admin/login
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <code className="ml-2 px-2 py-1 bg-background rounded text-sm font-mono">
                        info@alpenstore.com.ng
                      </code>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Password:</span>
                      <code className="ml-2 px-2 py-1 bg-background rounded text-sm font-mono">
                        [Contact system administrator]
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">How to Access:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Navigate to the admin login page at <code className="px-1 bg-muted rounded">/admin/login</code></li>
                    <li>Enter the admin email address</li>
                    <li>Enter the admin password</li>
                    <li>Click "Sign In" to access the dashboard</li>
                  </ol>
                </div>

                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">⚠️ Security Notice</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Never share your admin credentials. If you suspect unauthorized access, 
                    change your password immediately through Settings → Update Password.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle>Product Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Adding Products:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to Admin → Products</li>
                    <li>Click "Add Product" button</li>
                    <li>Fill in product name, price, category, and description</li>
                    <li>Upload a product image (recommended: 800x800px)</li>
                    <li>Set stock status and featured flag</li>
                    <li>Click "Save" to publish</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Editing Products:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Find the product in the products list</li>
                    <li>Click the "Edit" button</li>
                    <li>Modify any fields as needed</li>
                    <li>Click "Save" to update</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Deleting Products:</h4>
                  <p className="text-muted-foreground">
                    Click the "Delete" button next to any product. This action cannot be undone.
                    Products with existing orders will be preserved in order history.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <CardTitle>Order Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Order Statuses:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><span className="font-medium text-foreground">Pending:</span> New order awaiting processing</li>
                    <li><span className="font-medium text-foreground">Processing:</span> Order is being prepared</li>
                    <li><span className="font-medium text-foreground">Shipped:</span> Order has been dispatched</li>
                    <li><span className="font-medium text-foreground">Delivered:</span> Order completed successfully</li>
                    <li><span className="font-medium text-foreground">Cancelled:</span> Order was cancelled</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Updating Order Status:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to Admin → Orders</li>
                    <li>Find the order by ID or customer</li>
                    <li>Click on the order to view details</li>
                    <li>Select new status from dropdown</li>
                    <li>Customer receives email notification automatically</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-primary" />
                  <CardTitle>System Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">User Management:</h4>
                  <p className="text-muted-foreground">
                    Access Admin → Users to view all registered users, manage admin roles, 
                    and block/unblock accounts as needed.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Gallery Management:</h4>
                  <p className="text-muted-foreground">
                    Upload and organize store images through Admin → Gallery. 
                    These images appear on the public gallery page.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Password Reset:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to Admin → Settings</li>
                    <li>Enter current password</li>
                    <li>Enter and confirm new password</li>
                    <li>Click "Update Password"</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
