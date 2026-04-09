import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  ShieldCheck,
  ShoppingBag,
  BookOpen,
  TrendingUp,
  Eye,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export default function Admin() {
  const { user, isAdmin, isLoading, isAdminLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdminLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, isAdminLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);

      const [ordersRes, productsRes, usersRes, recentRes] = await Promise.all([
        supabase.from('orders').select('status, total_amount'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, status, total_amount, created_at').order('created_at', { ascending: false }).limit(7),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
      });

      setRecentOrders(recentRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/admin/login');
  };

  if (isLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const chartData = recentOrders.map(order => ({
    date: new Date(order.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    amount: Number(order.total_amount),
  })).reverse();

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
    { title: 'Pending Orders', value: stats.pendingOrders.toString(), icon: TrendingUp, color: 'text-yellow-600 bg-yellow-100' },
    { title: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-purple-600 bg-purple-100' },
    { title: 'Registered Users', value: stats.totalUsers.toString(), icon: UserCheck, color: 'text-indigo-600 bg-indigo-100' },
  ];

  const adminModules = [
    { title: 'Products', description: 'Manage your product catalog', icon: Package, href: '/admin/products' },
    { title: 'Orders', description: 'View and manage orders', icon: ShoppingBag, href: '/admin/orders' },
    { title: 'Users', description: 'Manage user accounts', icon: Users, href: '/admin/users' },
    { title: 'Pages', description: 'Edit website pages', icon: FileText, href: '/admin/pages' },
    { title: 'Gallery', description: 'Manage product images', icon: Image, href: '/admin/gallery' },
    { title: 'Settings', description: 'Configure site settings', icon: Settings, href: '/admin/settings' },
    { title: 'Documentation', description: 'Private admin guide', icon: BookOpen, href: '/admin/documentation' },
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
          <h2 className="text-2xl font-serif font-semibold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Your store performance at a glance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-base font-bold break-all leading-tight">
                      {loadingStats ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Recent Order Revenue
              </CardTitle>
              <CardDescription>Revenue from your last {chartData.length} orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Modules */}
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Card 
              key={module.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(module.href)}
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
                <Button variant="secondary" className="w-full">
                  Open {module.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
