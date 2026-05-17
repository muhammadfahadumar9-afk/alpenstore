import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Globe,
  Trash2,
  RotateCcw,
  Settings as SettingsIcon,
  ScrollText,
  LogIn,
  XCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { logAuditEvent } from "@/lib/auditLog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AuditLog {
  id: string;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  ip_address: string | null;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  email: string | null;
  success: boolean;
  ip_address: string | null;
  failure_reason: string | null;
  user_agent: string | null;
  created_at: string;
}

interface IpRule {
  id: string;
  ip_address: string;
  rule_type: "allow" | "block";
  reason: string | null;
  created_at: string;
}

interface SecuritySettings {
  id: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  session_timeout_minutes: number;
  enforce_ip_allowlist: boolean;
}

interface SoftDeletedItem {
  id: string;
  name?: string | null;
  title?: string | null;
  deleted_at: string;
}

export default function AdminSecurityCenter() {
  const { user, isAdmin, isLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();

  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [logins, setLogins] = useState<LoginAttempt[]>([]);
  const [ipRules, setIpRules] = useState<IpRule[]>([]);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [deletedProducts, setDeletedProducts] = useState<SoftDeletedItem[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<SoftDeletedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // IP rule form
  const [newIp, setNewIp] = useState("");
  const [newIpType, setNewIpType] = useState<"allow" | "block">("block");
  const [newIpReason, setNewIpReason] = useState("");

  useEffect(() => {
    if (!isLoading && !isAdminLoading && (!user || !isAdmin)) {
      toast.error("Access denied");
      navigate("/admin/login");
    }
  }, [user, isAdmin, isLoading, isAdminLoading, navigate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [a, l, r, s, dp, db] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("ip_rules")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("security_settings")
        .select("*")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("products")
        .select("id, name, deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
      supabase
        .from("blog_posts")
        .select("id, title, deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
    ]);
    setAudits((a.data || []) as AuditLog[]);
    setLogins((l.data || []) as LoginAttempt[]);
    setIpRules((r.data || []) as IpRule[]);
    setSettings((s.data as SecuritySettings) || null);
    setDeletedProducts(
      (dp.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        deleted_at: p.deleted_at as string,
      }))
    );
    setDeletedPosts(
      (db.data || []).map((p) => ({
        id: p.id,
        title: p.title,
        deleted_at: p.deleted_at as string,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin, fetchAll]);

  // Realtime subscriptions for live dashboard
  useEffect(() => {
    if (!user || !isAdmin) return;
    const channel = supabase
      .channel("security_center_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "login_attempts" },
        (payload) => {
          setLogins((prev) => [payload.new as LoginAttempt, ...prev].slice(0, 100));
          if (!(payload.new as LoginAttempt).success) {
            toast.warning(
              `Failed login attempt: ${(payload.new as LoginAttempt).email ?? "unknown"}`
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs" },
        (payload) => {
          setAudits((prev) => [payload.new as AuditLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const addIpRule = async () => {
    const ip = newIp.trim();
    if (!ip) {
      toast.error("Enter an IP address");
      return;
    }
    const { error } = await supabase.from("ip_rules").insert([
      {
        ip_address: ip,
        rule_type: newIpType,
        reason: newIpReason.trim() || null,
        created_by: user?.id,
      },
    ]);
    if (error) {
      toast.error(error.message);
      return;
    }
    await logAuditEvent({
      action: "ip_rule_added",
      targetType: "ip_rule",
      targetId: ip,
      metadata: { rule_type: newIpType, reason: newIpReason },
    });
    toast.success(`${newIpType === "block" ? "Blocked" : "Allowed"} ${ip}`);
    setNewIp("");
    setNewIpReason("");
    fetchAll();
  };

  const removeIpRule = async (rule: IpRule) => {
    const { error } = await supabase.from("ip_rules").delete().eq("id", rule.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await logAuditEvent({
      action: "ip_rule_removed",
      targetType: "ip_rule",
      targetId: rule.ip_address,
    });
    toast.success("Rule removed");
    fetchAll();
  };

  const updateSetting = async (patch: Partial<SecuritySettings>) => {
    if (!settings) return;
    const { error } = await supabase
      .from("security_settings")
      .update({ ...patch, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSettings({ ...settings, ...patch } as SecuritySettings);
    await logAuditEvent({
      action: "security_setting_updated",
      targetType: "security_settings",
      metadata: patch as Record<string, unknown>,
    });
    toast.success("Settings updated");
  };

  const restoreProduct = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await logAuditEvent({ action: "product_restored", targetType: "product", targetId: id });
    toast.success("Product restored");
    fetchAll();
  };

  const permanentlyDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAuditEvent({
      action: "product_permanently_deleted",
      targetType: "product",
      targetId: id,
    });
    toast.success("Permanently deleted");
    fetchAll();
  };

  const restorePost = async (id: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await logAuditEvent({ action: "post_restored", targetType: "blog_post", targetId: id });
    toast.success("Post restored");
    fetchAll();
  };

  if (isLoading || isAdminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  // Stats
  const failed24h = logins.filter(
    (l) =>
      !l.success &&
      Date.now() - new Date(l.created_at).getTime() < 24 * 60 * 60 * 1000
  ).length;
  const success24h = logins.filter(
    (l) =>
      l.success &&
      Date.now() - new Date(l.created_at).getTime() < 24 * 60 * 60 * 1000
  ).length;
  const blockedIps = ipRules.filter((r) => r.rule_type === "block").length;

  // Suspicious: IPs with >=3 failures in last 24h
  const failureByIp = new Map<string, number>();
  logins
    .filter(
      (l) =>
        !l.success &&
        Date.now() - new Date(l.created_at).getTime() < 24 * 60 * 60 * 1000
    )
    .forEach((l) => {
      const ip = l.ip_address || "unknown";
      failureByIp.set(ip, (failureByIp.get(ip) || 0) + 1);
    });
  const suspicious = Array.from(failureByIp.entries())
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1]);

  // Chart: failed attempts by hour for last 24h
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const hourAgo = 23 - i;
    const start = Date.now() - (hourAgo + 1) * 60 * 60 * 1000;
    const end = Date.now() - hourAgo * 60 * 60 * 1000;
    const count = logins.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return !l.success && t >= start && t < end;
    }).length;
    return { hour: `${hourAgo}h`, failed: count };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-semibold">Security Center</h1>
                <p className="text-xs text-muted-foreground">Live monitoring & controls</p>
              </div>
            </div>
          </div>
          {settings?.maintenance_mode && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" /> Maintenance mode ON
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={LogIn}
            label="Logins (24h)"
            value={success24h}
            color="text-emerald-600 bg-emerald-100"
          />
          <StatCard
            icon={XCircle}
            label="Failed logins (24h)"
            value={failed24h}
            color="text-red-600 bg-red-100"
          />
          <StatCard
            icon={Ban}
            label="Blocked IPs"
            value={blockedIps}
            color="text-orange-600 bg-orange-100"
          />
          <StatCard
            icon={AlertTriangle}
            label="Suspicious IPs"
            value={suspicious.length}
            color="text-amber-600 bg-amber-100"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="audit">
              <ScrollText className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="logins">
              <LogIn className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logins</span>
            </TabsTrigger>
            <TabsTrigger value="ip">
              <Globe className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">IP Rules</span>
            </TabsTrigger>
            <TabsTrigger value="trash">
              <Trash2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Trash</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Failed logins (last 24h)</CardTitle>
                <CardDescription>Realtime updates as events occur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Suspicious IPs
                </CardTitle>
                <CardDescription>
                  IPs with 3+ failed logins in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suspicious.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No suspicious activity detected.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {suspicious.map(([ip, count]) => (
                      <div
                        key={ip}
                        className="flex items-center justify-between p-3 rounded-md border bg-card"
                      >
                        <div>
                          <div className="font-mono text-sm">{ip}</div>
                          <div className="text-xs text-muted-foreground">
                            {count} failed attempts
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            const { error } = await supabase.from("ip_rules").upsert(
                              [
                                {
                                  ip_address: ip,
                                  rule_type: "block",
                                  reason: `Auto-flagged: ${count} failures in 24h`,
                                  created_by: user.id,
                                },
                              ],
                              { onConflict: "ip_address" }
                            );
                            if (error) return toast.error(error.message);
                            await logAuditEvent({
                              action: "ip_rule_added",
                              targetType: "ip_rule",
                              targetId: ip,
                              metadata: { source: "suspicious_auto", count },
                            });
                            toast.success(`Blocked ${ip}`);
                            fetchAll();
                          }}
                        >
                          <Ban className="w-3 h-3 mr-1" /> Block
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin audit log</CardTitle>
                <CardDescription>Last 100 admin actions</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          No audit events yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      audits.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(a.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs">{a.actor_email ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {a.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {a.target_type ? `${a.target_type}: ${a.target_id ?? ""}` : "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{a.ip_address ?? "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logins">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Login attempts</CardTitle>
                <CardDescription>Last 100 attempts, newest first</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          No login attempts logged yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      logins.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(l.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs">{l.email ?? "—"}</TableCell>
                          <TableCell>
                            {l.success ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="w-3 h-3" /> Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{l.ip_address ?? "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {l.failure_reason ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add IP rule</CardTitle>
                <CardDescription>
                  Block or allow specific IP addresses. Blocked IPs are flagged in
                  monitoring; full edge-level enforcement requires a WAF/proxy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-[1fr_140px_1fr_auto]">
                  <Input
                    placeholder="e.g. 203.0.113.42"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                  <Select value={newIpType} onValueChange={(v) => setNewIpType(v as "allow" | "block")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="allow">Allow</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Reason (optional)"
                    value={newIpReason}
                    onChange={(e) => setNewIpReason(e.target.value)}
                  />
                  <Button onClick={addIpRule} className="gap-2">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active rules</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          No IP rules configured.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ipRules.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-sm">{r.ip_address}</TableCell>
                          <TableCell>
                            <Badge variant={r.rule_type === "block" ? "destructive" : "secondary"}>
                              {r.rule_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.reason ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeIpRule(r)}
                              aria-label="Remove rule"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trash" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deleted products</CardTitle>
                <CardDescription>Restore or permanently remove</CardDescription>
              </CardHeader>
              <CardContent>
                {deletedProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Trash is empty.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {deletedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-card"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Deleted {new Date(p.deleted_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => restoreProduct(p.id)} className="gap-1">
                            <RotateCcw className="w-3 h-3" /> Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Permanently delete this product?")) {
                                permanentlyDeleteProduct(p.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deleted blog posts</CardTitle>
              </CardHeader>
              <CardContent>
                {deletedPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Trash is empty.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {deletedPosts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-card"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{p.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Deleted {new Date(p.deleted_at).toLocaleString()}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => restorePost(p.id)} className="gap-1">
                          <RotateCcw className="w-3 h-3" /> Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Maintenance mode</CardTitle>
                <CardDescription>
                  Show a maintenance page to all non-admin visitors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Enable maintenance mode</Label>
                  <Switch
                    checked={!!settings?.maintenance_mode}
                    onCheckedChange={(v) => updateSetting({ maintenance_mode: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Message shown to visitors</Label>
                  <Textarea
                    rows={3}
                    defaultValue={settings?.maintenance_message ?? ""}
                    onBlur={(e) =>
                      e.target.value !== settings?.maintenance_message &&
                      updateSetting({ maintenance_message: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session</CardTitle>
                <CardDescription>How long admin sessions stay valid (informational; enforce via auth provider).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-w-xs">
                  <Label className="text-xs">Session timeout (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={1440}
                    defaultValue={settings?.session_timeout_minutes ?? 60}
                    onBlur={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!Number.isNaN(n) && n !== settings?.session_timeout_minutes) {
                        updateSetting({ session_timeout_minutes: n });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enforce IP allowlist for admin</Label>
                    <p className="text-xs text-muted-foreground">
                      When ON, only allowlisted IPs can sign into admin (enforced client-side in admin login).
                    </p>
                  </div>
                  <Switch
                    checked={!!settings?.enforce_ip_allowlist}
                    onCheckedChange={(v) => updateSetting({ enforce_ip_allowlist: v })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold leading-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}