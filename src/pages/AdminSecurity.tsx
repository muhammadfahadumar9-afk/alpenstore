import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  KeyRound,
  Database,
  MessageCircle,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  BookOpen,
  Server,
  ScrollText,
  Bug,
  Network,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  label: string;
  status: "ok" | "review";
  detail?: string;
}

const Section = ({
  icon: Icon,
  title,
  description,
  items,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  items: ChecklistItem[];
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-serif">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            {item.status === "ok" ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              {item.detail && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.detail}
                </p>
              )}
            </div>
            <Badge
              variant={item.status === "ok" ? "default" : "secondary"}
              className="shrink-0"
            >
              {item.status === "ok" ? "Active" : "Review"}
            </Badge>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default function AdminSecurity() {
  const { user, isAdmin, isLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdminLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/admin/login");
    }
  }, [user, isAdmin, isLoading, isAdminLoading, navigate]);

  if (isLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold">
                Security & Privacy Checklist
              </h1>
              <p className="text-sm text-muted-foreground">
                How customer data is protected on ALPEN STORE
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Intro */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              At a glance
            </CardTitle>
            <CardDescription>
              This page summarises the security controls protecting customer
              data, the access rules enforced by the database, and the routine
              checks you should perform as an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-2xl font-semibold text-primary">0</p>
              <p className="text-muted-foreground">
                Critical security findings
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">100%</p>
              <p className="text-muted-foreground">
                Tables protected by row-level security
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">WhatsApp</p>
              <p className="text-muted-foreground">
                Only channel used for orders & payments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auth */}
        <Section
          icon={UserCheck}
          title="Authentication"
          description="How customers and admins prove who they are."
          items={[
            {
              label: "Email + password sign-in with strong password rules",
              status: "ok",
              detail:
                "Minimum 8 characters with uppercase, lowercase, number and special character.",
            },
            {
              label: "Leaked-password protection (HIBP) enabled",
              status: "ok",
              detail:
                "Sign-up rejects passwords that have appeared in known data breaches.",
            },
            {
              label: "Phone OTP for password recovery",
              status: "ok",
              detail:
                "Limited to 3 requests per hour per user to block abuse.",
            },
            {
              label: "Email & phone normalised before lookup",
              status: "ok",
              detail:
                "Emails are lowercased & trimmed; phone numbers handle both 0 and +234 prefixes.",
            },
            {
              label: "Admin panel is hidden — no public link to /admin/login",
              status: "ok",
            },
          ]}
        />

        {/* Data access (RLS) */}
        <Section
          icon={Database}
          title="Data access rules (Row-Level Security)"
          description="Every database table enforces these rules at the database level — even if the app code ever had a bug, the database itself would refuse forbidden access."
          items={[
            {
              label: "Customers can only see their OWN orders",
              status: "ok",
              detail:
                "Order list, order details, and real-time updates are all filtered by user ID server-side.",
            },
            {
              label: "Customers can only see their OWN profile",
              status: "ok",
              detail:
                "Phone, address and full name are never exposed to other customers.",
            },
            {
              label: "Pending orders can be cancelled by their owner only",
              status: "ok",
              detail:
                "Once an order moves past 'pending', it can no longer be cancelled by the customer.",
            },
            {
              label: "Reviews require a verified purchase",
              status: "ok",
              detail:
                "A customer can only review a product they have actually bought (status: shipped, delivered or completed).",
            },
            {
              label: "Anonymous visitors cannot read internal user IDs",
              status: "ok",
              detail:
                "Public reads of comments and reviews go through privacy-safe views that omit user IDs.",
            },
            {
              label: "Admin role checked on the server, not in the browser",
              status: "ok",
              detail:
                "Roles live in a separate user_roles table and are verified by a security-definer function — impossible to escalate from the client.",
            },
            {
              label: "Blocked admins lose admin powers but keep customer access",
              status: "ok",
            },
          ]}
        />

        {/* Storage & content */}
        <Section
          icon={Eye}
          title="File storage & published content"
          description="What is public, what is private, and how files are kept tidy."
          items={[
            {
              label: "Product, gallery, page and blog images are kept in separate buckets",
              status: "ok",
              detail:
                "No risk of mixing customer-facing product photos with internal page assets.",
            },
            {
              label: "Anonymous users cannot enumerate uploaded files",
              status: "ok",
              detail:
                "Direct image URLs still load on the site, but listing the bucket contents is restricted to admins.",
            },
            {
              label: "Blog HTML is sanitised before rendering",
              status: "ok",
              detail:
                "Posts pass through DOMPurify with a strict allow-list to prevent stored XSS.",
            },
          ]}
        />

        {/* Secrets & integrations */}
        <Section
          icon={KeyRound}
          title="Secrets & third-party integrations"
          description="Where API keys live and how they are handled."
          items={[
            {
              label: "All third-party API keys stored server-side as secrets",
              status: "ok",
              detail:
                "Twilio (SMS OTP), Resend, and Lovable AI keys never reach the browser.",
            },
            {
              label: "No service-role keys in frontend code",
              status: "ok",
              detail:
                "Only the publishable anon key is shipped to the browser — exactly as designed.",
            },
            {
              label: "Admin account creation requires ADMIN_SETUP_KEY",
              status: "ok",
              detail:
                "Bootstrapping the first admin user requires a server-side secret.",
            },
            {
              label: "Rotate Twilio & Resend keys every 6–12 months",
              status: "review",
              detail:
                "Hygiene practice. Use the Secrets panel in Cloud to update.",
            },
          ]}
        />

        {/* Checkout & payments */}
        <Section
          icon={MessageCircle}
          title="Checkout & payments"
          description="How orders are confirmed and why we never store payment data."
          items={[
            {
              label: "Checkout is finalised exclusively over WhatsApp",
              status: "ok",
              detail:
                "Customers are redirected to wa.me/2349168877858 to confirm their order.",
            },
            {
              label: "No card numbers or payment details are stored anywhere",
              status: "ok",
              detail:
                "Out of PCI scope — payment is arranged manually with the customer.",
            },
            {
              label: "Delivery fee is discussed on WhatsApp before payment",
              status: "ok",
            },
            {
              label: "Order notifications never sent by email",
              status: "ok",
              detail: "WhatsApp is the single source of truth for order updates.",
            },
          ]}
        />

        {/* Manual review */}
        <Section
          icon={FileWarning}
          title="Routine checks for the admin team"
          description="Lightweight tasks to perform on a recurring schedule."
          items={[
            {
              label: "Review the Users page monthly",
              status: "review",
              detail:
                "Confirm only intended people hold the 'admin' role. Block any account that should no longer have access.",
            },
            {
              label: "Check pending orders daily",
              status: "review",
              detail:
                "Process or cancel them so the dashboard reflects current activity.",
            },
            {
              label: "Re-run the Cloud security scan after big changes",
              status: "review",
              detail:
                "Open Lovable Cloud → Security and click Run scan after schema changes or new features.",
            },
            {
              label: "Rotate admin passwords every 6 months",
              status: "review",
            },
          ]}
        />

        {/* Customer rights */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif">
                  What customers can expect
                </CardTitle>
                <CardDescription className="mt-1">
                  Plain-language summary you can share with anyone who asks how
                  their data is handled.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>What we store.</strong> Name, email, phone, delivery
              address, and the products ordered. Nothing more — no card details
              ever.
            </p>
            <p>
              <strong>Who can see it.</strong> Only the customer themselves and
              authorised ALPEN STORE admins. Other customers can never see your
              orders, profile, or contact details.
            </p>
            <p>
              <strong>How orders are confirmed.</strong> Through WhatsApp on{" "}
              <a
                href="https://wa.me/2349168877858"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                +234 916 887 7858
              </a>{" "}
              — never via email or SMS marketing.
            </p>
            <p>
              <strong>How to delete an account.</strong> Customers can delete
              their profile from the Account page; admins can also remove
              accounts on request.
            </p>
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground">
              For the full policy see the{" "}
              <a href="/privacy" className="text-primary underline">
                Privacy page
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* ====================================================== */}
        {/* FULL TECHNICAL DOCUMENTATION                            */}
        {/* ====================================================== */}
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif">
                  Full Technical Documentation
                </CardTitle>
                <CardDescription className="mt-1">
                  A complete reference of every security-relevant piece of the
                  ALPEN STORE platform. Use this as the source of truth when
                  auditing, onboarding a new admin, or responding to a question
                  from a customer.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Architecture overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> 1. Architecture overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>
              ALPEN STORE is a single-page React application (Vite + TypeScript +
              Tailwind) backed by Lovable Cloud. The browser only ever talks to
              the Cloud APIs using a public publishable key. Every privileged
              operation is enforced by Row-Level Security (RLS) in the database
              or by an edge function running with a server-side service key.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Frontend:</strong> React 18, React Router, shadcn/ui, TanStack Query.</li>
              <li><strong>Backend:</strong> Lovable Cloud (managed Postgres, Auth, Storage, Edge Functions).</li>
              <li><strong>Auth:</strong> Email + password (with HIBP), phone OTP for password reset.</li>
              <li><strong>Realtime:</strong> postgres_changes channels filtered by RLS — every subscriber only receives rows they are allowed to read.</li>
              <li><strong>Checkout:</strong> Order is written to the database, then the customer is redirected to WhatsApp to confirm and pay.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Roles & permissions matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> 2. Roles & permissions matrix
            </CardTitle>
            <CardDescription>
              Roles are stored in a dedicated <code>user_roles</code> table.
              They are NEVER stored on profile rows or in browser storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3">Capability</th>
                  <th className="py-2 pr-3">Anonymous</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Admin</th>
                  <th className="py-2">Blocked Admin</th>
                </tr>
              </thead>
              <tbody className="[&_td]:py-2 [&_td]:pr-3 [&_tr]:border-b [&_tr]:border-border/40">
                <tr><td>Browse products / blog / gallery</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
                <tr><td>Add to cart</td><td>❌ (must log in)</td><td>✅</td><td>✅</td><td>✅</td></tr>
                <tr><td>Place an order</td><td>❌</td><td>✅ (own only)</td><td>✅</td><td>✅</td></tr>
                <tr><td>View order history</td><td>❌</td><td>✅ (own only)</td><td>✅ all</td><td>own only</td></tr>
                <tr><td>Cancel an order</td><td>❌</td><td>own & pending only</td><td>✅</td><td>own & pending</td></tr>
                <tr><td>Leave a review</td><td>❌</td><td>only after purchase</td><td>only after purchase</td><td>only after purchase</td></tr>
                <tr><td>Manage products / blog / pages</td><td>❌</td><td>❌</td><td>✅</td><td>❌</td></tr>
                <tr><td>Open the admin dashboard</td><td>❌</td><td>❌</td><td>✅</td><td>❌</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Table-by-table RLS reference */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> 3. Database tables & RLS reference
            </CardTitle>
            <CardDescription>
              Every table below has Row-Level Security enabled. Even with the
              public anon key, the database physically refuses any operation
              that does not match these rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            {[
              { name: "profiles", purpose: "Customer name, phone, address, city.", rules: "Customer reads/writes their own row only. Admins can read all." },
              { name: "user_roles", purpose: "Maps users to roles (admin / user) with a is_blocked flag.", rules: "Self-assignment blocked. Only admins can insert/update/delete. Users can read their own role only." },
              { name: "orders", purpose: "One row per checkout.", rules: "Insert: only by the owner. Read: owner or admin. Update: owner can only flip pending → cancelled; admin can update any field. Delete: nobody (audit trail)." },
              { name: "order_items", purpose: "Line items belonging to an order.", rules: "Linked to the parent order via the same RLS — visible only when the parent order is visible." },
              { name: "products", purpose: "Product catalogue.", rules: "Public read. Insert/update/delete: active admins only." },
              { name: "reviews", purpose: "Customer ratings on products.", rules: "Insert requires has_purchased_product(). Read for authenticated users; anonymous visitors read the reviews_public view." },
              { name: "blog_posts / blog_categories / blog_tags / blog_post_*", purpose: "Editorial content.", rules: "Public read of published posts only. All writes require active admin." },
              { name: "blog_comments", purpose: "Comments on blog posts.", rules: "Insert requires login (auth.uid = user_id). Owner can delete own; admin can delete any. Anonymous visitors read blog_comments_public (no user_id leaked)." },
              { name: "site_content / team_members", purpose: "About/Home page content.", rules: "Public read. All writes admin-only." },
              { name: "password_reset_otps", purpose: "Hashed OTP codes for password recovery.", rules: "FULLY blocked from any client access. Only edge functions (service role) can read/write." },
              { name: "otp_rate_limits / admin_setup_rate_limits", purpose: "Anti-abuse counters.", rules: "FULLY blocked from clients. Edge functions only." },
            ].map((t) => (
              <div key={t.name} className="border-l-2 border-primary/40 pl-3">
                <p className="font-mono text-xs font-semibold">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.purpose}</p>
                <p className="text-xs mt-1">{t.rules}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Database functions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" /> 4. Security-definer database functions
            </CardTitle>
            <CardDescription>
              These are the only functions allowed to bypass RLS. Each one has a
              fixed search_path and is callable only from RLS policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <ul className="space-y-2">
              <li>
                <code className="font-mono text-xs">is_active_admin(uuid)</code> — returns
                true only if the user has the admin role AND is_blocked = false.
                Used by every admin-gated policy.
              </li>
              <li>
                <code className="font-mono text-xs">has_role(uuid, app_role)</code> — generic
                role check used by the auth context.
              </li>
              <li>
                <code className="font-mono text-xs">has_purchased_product(uuid, uuid)</code> — verifies
                the user has an order containing the product with status
                shipped / delivered / completed. Gates review submissions.
              </li>
              <li>
                <code className="font-mono text-xs">handle_new_user()</code> — trigger
                that auto-creates a profile row when a new auth user signs up.
              </li>
              <li>
                <code className="font-mono text-xs">update_updated_at_column()</code> — generic
                trigger maintaining the <code>updated_at</code> timestamp.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Secrets & integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> 5. Secrets inventory
            </CardTitle>
            <CardDescription>
              All secrets live server-side in Lovable Cloud. None of them are
              ever bundled into the React app.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3">Secret</th>
                  <th className="py-2 pr-3">Used by</th>
                  <th className="py-2">Purpose</th>
                </tr>
              </thead>
              <tbody className="[&_td]:py-2 [&_td]:pr-3 [&_tr]:border-b [&_tr]:border-border/40 text-xs">
                <tr><td className="font-mono">TWILIO_ACCOUNT_SID</td><td>Edge functions</td><td>SMS OTP delivery (password reset)</td></tr>
                <tr><td className="font-mono">TWILIO_AUTH_TOKEN</td><td>Edge functions</td><td>SMS OTP authentication</td></tr>
                <tr><td className="font-mono">TWILIO_PHONE_NUMBER</td><td>Edge functions</td><td>Sender phone for OTP messages</td></tr>
                <tr><td className="font-mono">RESEND_API_KEY</td><td>Edge functions (reserved)</td><td>Transactional email if ever needed</td></tr>
                <tr><td className="font-mono">LOVABLE_API_KEY</td><td>Edge functions (reserved)</td><td>Server-side AI calls via Lovable AI Gateway</td></tr>
                <tr><td className="font-mono">SUPABASE_SERVICE_ROLE_KEY</td><td>Edge functions only</td><td>Privileged DB access — never exposed to the browser</td></tr>
                <tr><td className="font-mono">ADMIN_SETUP_KEY</td><td>Admin bootstrap function</td><td>Required to create the first/additional admin account</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> 6. Storage buckets
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground">
              All buckets are public-read by URL (so images load on the site)
              but listing the contents of a bucket is restricted to admins.
              Uploads are gated by RLS so only admins can write.
            </p>
            <ul className="list-disc pl-5">
              <li><code>product-images</code> — product catalogue photos.</li>
              <li><code>gallery-images</code> — homepage / about-us gallery (kept strictly separate from product-images).</li>
              <li><code>page-images</code> — banners and section illustrations on static pages.</li>
              <li><code>blog-images</code> — cover photos and inline imagery for blog posts.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Edge functions / network */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" /> 7. Edge functions & network surface
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Edge functions are the only place where the service-role key is
              used. They validate JWTs, re-fetch ownership from the database,
              and apply rate limiting before performing any privileged action.
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Password reset (request OTP):</strong> normalises phone, applies the 3/hour limit, hashes and stores the OTP, sends it via Twilio.</li>
              <li><strong>Password reset (verify OTP):</strong> compares the hash, enforces expiry and attempt counts, then resets the password.</li>
              <li><strong>Admin setup:</strong> requires <code>ADMIN_SETUP_KEY</code> and is rate-limited per IP.</li>
            </ul>
            <p className="text-muted-foreground text-xs">
              CORS is configured per function. No edge function trusts a
              client-supplied user_id — identity always comes from the verified JWT.
            </p>
          </CardContent>
        </Card>

        {/* Application-layer protections */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" /> 8. Application-layer protections
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc pl-5">
              <li><strong>XSS:</strong> all user-generated HTML (blog content) is sanitised with DOMPurify before rendering.</li>
              <li><strong>Input validation:</strong> Zod schemas validate forms before submitting to the database.</li>
              <li><strong>Auth state:</strong> the React auth context listens to <code>onAuthStateChange</code> and re-checks admin role on every navigation — stale localStorage cannot fake admin access.</li>
              <li><strong>CSRF:</strong> all writes are JWT-bound — no cookie-based session that could be replayed.</li>
              <li><strong>SQL injection:</strong> all queries go through the parameterised Supabase client; no raw string concatenation.</li>
              <li><strong>Click-jacking / referrer:</strong> outbound links use <code>rel="noopener noreferrer"</code>.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Incident response */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" /> 9. Incident response playbook
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Suspected admin compromise:</strong> open the Users page → set <code>is_blocked = true</code> on the suspect admin. They lose access on their next request.</li>
              <li><strong>Suspected leaked secret:</strong> rotate the secret in Lovable Cloud → Secrets, redeploy edge functions, and review edge-function logs for unusual calls.</li>
              <li><strong>Spam reviews / comments:</strong> delete from the admin Reviews / Comments panel. Repeat offenders can be blocked via their user role.</li>
              <li><strong>Order fraud:</strong> mark the order as cancelled, contact the customer on WhatsApp, and consider blocking the account.</li>
              <li><strong>Database anomaly:</strong> use Lovable Cloud → Logs to inspect recent SQL, then run the security scan and fix any new findings.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 10. Compliance & data lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc pl-5">
              <li><strong>PCI:</strong> out of scope — no card data is ever processed or stored.</li>
              <li><strong>NDPR / GDPR-style rights:</strong> customers can view, update, or delete their profile from the Account page. Admins can fulfil deletion requests on demand.</li>
              <li><strong>Data minimisation:</strong> only fields needed to fulfil an order are collected (name, phone, address, city).</li>
              <li><strong>Retention:</strong> orders are kept for accounting purposes; OTP records expire automatically; rate-limit counters reset on a rolling window.</li>
              <li><strong>Transport security:</strong> the published site is served over HTTPS on <code>alpenstore.com.ng</code>; verify the SSL grade periodically with SSL Labs.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick reference */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-serif">Quick reference</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid sm:grid-cols-2 gap-3">
            <div><p className="font-semibold">Admin login</p><p className="text-muted-foreground text-xs">/admin/login (unlinked, hidden)</p></div>
            <div><p className="font-semibold">Support WhatsApp</p><p className="text-muted-foreground text-xs">+234 916 887 7858</p></div>
            <div><p className="font-semibold">OTP rate limit</p><p className="text-muted-foreground text-xs">3 requests / hour / phone</p></div>
            <div><p className="font-semibold">Password rules</p><p className="text-muted-foreground text-xs">8+ chars, mixed case, number, special char, HIBP-checked</p></div>
            <div><p className="font-semibold">Order cancellation</p><p className="text-muted-foreground text-xs">Customer: only while status = pending</p></div>
            <div><p className="font-semibold">Reviews</p><p className="text-muted-foreground text-xs">Verified-purchaser only</p></div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}