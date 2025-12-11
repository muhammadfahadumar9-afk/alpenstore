import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, ShieldCheck, ShieldX, ShieldAlert, User, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  role?: string;
  is_blocked?: boolean;
}

export default function AdminUsers() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role, is_blocked')
            .eq('user_id', profile.user_id)
            .single();
          
          return {
            ...profile,
            role: roleData?.role || 'user',
            is_blocked: roleData?.is_blocked || false
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, userName: string | null) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_blocked: true })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, is_blocked: true } : u
      ));
      
      toast.success(`${userName || 'User'} has been blocked from admin access`);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId: string, userName: string | null) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_blocked: false })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, is_blocked: false } : u
      ));
      
      toast.success(`${userName || 'User'} has been unblocked`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteToAdmin = async (userId: string, userName: string | null) => {
    setActionLoading(userId);
    try {
      // Check if user already has a role entry
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: 'admin', is_blocked: false })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin', is_blocked: false });
        if (error) throw error;
      }

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, role: 'admin', is_blocked: false } : u
      ));
      
      toast.success(`${userName || 'User'} has been promoted to admin`);
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemoteToUser = async (userId: string, userName: string | null) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user', is_blocked: false })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, role: 'user', is_blocked: false } : u
      ));
      
      toast.success(`${userName || 'User'} has been demoted to regular user`);
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error('Failed to demote user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (role: string, isBlocked: boolean) => {
    if (isBlocked) return 'outline';
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Filter users by role and status
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'moderator');
  const activeAdmins = adminUsers.filter(u => !u.is_blocked);
  const blockedAdmins = adminUsers.filter(u => u.is_blocked);
  const regularUsers = users.filter(u => u.role === 'user' || !u.role);

  const renderUserTable = (userList: UserProfile[], isAdminTable: boolean = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.map((userProfile) => (
          <TableRow key={userProfile.id} className={userProfile.is_blocked ? 'opacity-60' : ''}>
            <TableCell className="font-medium">
              {userProfile.full_name || 'No name'}
            </TableCell>
            <TableCell>{userProfile.phone || '-'}</TableCell>
            <TableCell>{userProfile.city || '-'}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(userProfile.role || 'user', userProfile.is_blocked || false)}>
                {userProfile.is_blocked ? (
                  <ShieldX className="w-3 h-3 mr-1" />
                ) : userProfile.role === 'admin' ? (
                  <ShieldCheck className="w-3 h-3 mr-1" />
                ) : null}
                {userProfile.role || 'user'}
              </Badge>
            </TableCell>
            <TableCell>
              {userProfile.is_blocked ? (
                <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
                  <UserX className="w-3 h-3 mr-1" />
                  Blocked
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </TableCell>
            <TableCell>{formatDate(userProfile.created_at)}</TableCell>
            <TableCell className="text-right">
              {userProfile.user_id === user?.id ? (
                <span className="text-sm text-muted-foreground">You</span>
              ) : isAdminTable ? (
                <div className="flex items-center justify-end gap-2">
                  {userProfile.is_blocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-primary hover:text-primary"
                      onClick={() => handleUnblockUser(userProfile.user_id, userProfile.full_name)}
                      disabled={actionLoading === userProfile.user_id}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      {actionLoading === userProfile.user_id ? '...' : 'Unblock'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBlockUser(userProfile.user_id, userProfile.full_name)}
                      disabled={actionLoading === userProfile.user_id}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      {actionLoading === userProfile.user_id ? '...' : 'Block'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDemoteToUser(userProfile.user_id, userProfile.full_name)}
                    disabled={actionLoading === userProfile.user_id}
                  >
                    <ShieldX className="w-4 h-4 mr-1" />
                    Demote
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handlePromoteToAdmin(userProfile.user_id, userProfile.full_name)}
                  disabled={actionLoading === userProfile.user_id}
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  {actionLoading === userProfile.user_id ? '...' : 'Make Admin'}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (authLoading || loading) {
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
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">User Management</h1>
              <p className="text-sm text-muted-foreground">{users.length} registered users</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Admin Access Control Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Admin Access Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Active Admins ({activeAdmins.length})
                </TabsTrigger>
                <TabsTrigger value="blocked" className="flex items-center gap-2">
                  <ShieldX className="w-4 h-4" />
                  Blocked Admins ({blockedAdmins.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-4">
                {activeAdmins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active admin users</p>
                ) : (
                  renderUserTable(activeAdmins, true)
                )}
              </TabsContent>
              
              <TabsContent value="blocked" className="mt-4">
                {blockedAdmins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No blocked admin users</p>
                ) : (
                  renderUserTable(blockedAdmins, true)
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Regular Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Accounts ({regularUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regularUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No customer accounts found</p>
            ) : (
              renderUserTable(regularUsers, false)
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
