import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/blog";

interface Props {
  table: "blog_categories" | "blog_tags";
  label: string;
}

function TaxonomyManager({ table, label }: Props) {
  const { user, isAdmin, isLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdminLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, isLoading, isAdminLoading, navigate]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select("id, name, slug").order("name");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, table]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const slug = slugify(trimmed);
    const { error } = await supabase.from(table).insert({ name: trimmed, slug });
    if (error) return toast.error(error.message);
    setName("");
    toast.success(`${label.slice(0, -1)} added`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(`Delete this ${label.slice(0, -1).toLowerCase()}?`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  if (isLoading || isAdminLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/blog"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <h1 className="text-xl font-serif font-semibold">Blog {label}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={add} className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`New ${label.slice(0, -1).toLowerCase()} name`}
                maxLength={50}
              />
              <Button type="submit"><Plus className="w-4 h-4" /> Add</Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No {label.toLowerCase()} yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">/{item.slug}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(item.id)}
                    className="text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminBlogTaxonomy() {
  const { pathname } = useLocation();
  const isTags = pathname.endsWith("/tags");
  return (
    <TaxonomyManager
      table={isTags ? "blog_tags" : "blog_categories"}
      label={isTags ? "Tags" : "Categories"}
    />
  );
}
