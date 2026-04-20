import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ArrowLeft, Tag, Folder, Eye, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/blog";

export default function AdminBlog() {
  const { user, isAdmin, isLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdminLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, isLoading, isAdminLoading, navigate]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, status, published_at, created_at, cover_image_url")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) load();
  }, [user, isAdmin]);

  const togglePublish = async (post: any) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? post.published_at || new Date().toISOString() : post.published_at,
      })
      .eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success(newStatus === "published" ? "Post published" : "Post unpublished");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    load();
  };

  if (isLoading || isAdminLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-serif font-semibold">Blog Posts</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild size="sm">
              <Link to="/admin/blog/categories"><Folder className="w-4 h-4" /> Categories</Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/admin/blog/tags"><Tag className="w-4 h-4" /> Tags</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/blog/new"><Plus className="w-4 h-4" /> New Post</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center py-12 text-muted-foreground">Loading…</p>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No blog posts yet.</p>
              <Button asChild><Link to="/admin/blog/new">Create your first post</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-20 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                    {post.cover_image_url && (
                      <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                      {post.published_at && (
                        <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
                      )}
                    </div>
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">/blog/{post.slug}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => togglePublish(post)} aria-label="Toggle publish">
                      {post.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" asChild>
                      <Link to={`/admin/blog/${post.id}/edit`} aria-label="Edit"><Edit className="w-4 h-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(post.id)} aria-label="Delete" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
