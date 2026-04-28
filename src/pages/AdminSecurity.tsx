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
      </main>
    </div>
  );
}