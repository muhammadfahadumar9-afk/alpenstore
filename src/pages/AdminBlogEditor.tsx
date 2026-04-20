import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import RichTextEditor from "@/components/blog/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/blog";

export default function AdminBlogEditor() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const { user, isAdmin, isLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isLoading && !isAdminLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, isLoading, isAdminLoading, navigate]);

  useEffect(() => {
    Promise.all([
      supabase.from("blog_categories").select("id, name").order("name"),
      supabase.from("blog_tags").select("id, name").order("name"),
    ]).then(([c, t]) => {
      setAllCategories(c.data || []);
      setAllTags(t.data || []);
    });
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const { data: post } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!post) {
          toast.error("Post not found");
          navigate("/admin/blog");
          return;
        }
        setTitle(post.title);
        setSlug(post.slug);
        setSlugTouched(true);
        setExcerpt(post.excerpt || "");
        setContent(post.content || "");
        setCoverImage(post.cover_image_url);
        setMetaTitle(post.meta_title || "");
        setMetaDescription(post.meta_description || "");
        setStatus(post.status as any);

        const [cats, tags] = await Promise.all([
          supabase.from("blog_post_categories").select("category_id").eq("post_id", id),
          supabase.from("blog_post_tags").select("tag_id").eq("post_id", id),
        ]);
        setSelectedCategories((cats.data || []).map((c) => c.category_id));
        setSelectedTags((tags.data || []).map((t) => t.tag_id));
        setLoading(false);
      })();
    }
  }, [id, isNew, navigate]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const ensureUniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
    let candidate = base || `post-${Date.now()}`;
    let i = 1;
    // up to 20 tries
    while (i < 20) {
      let q = supabase.from("blog_posts").select("id").eq("slug", candidate);
      if (excludeId) q = q.neq("id", excludeId);
      const { data } = await q.maybeSingle();
      if (!data) return candidate;
      i++;
      candidate = `${base}-${i}`;
    }
    return `${base}-${Date.now()}`;
  };

  const save = async (publishNow?: boolean) => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content.trim() || content === "<p></p>") return toast.error("Content is required");
    if (!user) return;

    setSaving(true);
    const finalStatus = publishNow ? "published" : status;
    const finalSlug = await ensureUniqueSlug(slug || slugify(title), id);

    const payload: any = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      content,
      cover_image_url: coverImage,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      status: finalStatus,
    };

    let postId = id;

    if (isNew) {
      payload.author_id = user.id;
      payload.published_at = finalStatus === "published" ? new Date().toISOString() : null;
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
      postId = data.id;
    } else {
      // set published_at first time it goes live
      if (finalStatus === "published") {
        const { data: existing } = await supabase
          .from("blog_posts").select("published_at").eq("id", id!).maybeSingle();
        if (!existing?.published_at) payload.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", id!);
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
    }

    // Sync category & tag links
    if (postId) {
      await Promise.all([
        supabase.from("blog_post_categories").delete().eq("post_id", postId),
        supabase.from("blog_post_tags").delete().eq("post_id", postId),
      ]);
      if (selectedCategories.length) {
        await supabase.from("blog_post_categories").insert(
          selectedCategories.map((cid) => ({ post_id: postId!, category_id: cid }))
        );
      }
      if (selectedTags.length) {
        await supabase.from("blog_post_tags").insert(
          selectedTags.map((tid) => ({ post_id: postId!, tag_id: tid }))
        );
      }
    }

    setSaving(false);
    toast.success(isNew ? "Post created" : "Post saved");
    navigate("/admin/blog");
  };

  const toggleId = (arr: string[], setArr: (v: string[]) => void, idVal: string) => {
    setArr(arr.includes(idVal) ? arr.filter((x) => x !== idVal) : [...arr, idVal]);
  };

  if (isLoading || isAdminLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/blog"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <h1 className="text-xl font-serif font-semibold">
              {isNew ? "New Post" : "Edit Post"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false)} disabled={saving}>
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button onClick={() => save(true)} disabled={saving}>
              {status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Post title"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/blog/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlug(slugify(e.target.value));
                      }}
                      placeholder="auto-generated-from-title"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary shown in lists and search results"
                    rows={2}
                    maxLength={300}
                  />
                </div>
                <div>
                  <Label>Content *</Label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>Cover image</Label>
                <ImageUploader
                  currentUrl={coverImage}
                  onImageChange={setCoverImage}
                  bucket="blog-images"
                  folder="covers"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>Categories</Label>
                {allCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No categories. <Link to="/admin/blog/categories" className="text-primary">Add one</Link>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleId(selectedCategories, setSelectedCategories, c.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border ${
                          selectedCategories.includes(c.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>Tags</Label>
                {allTags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No tags. <Link to="/admin/blog/tags" className="text-primary">Add one</Link>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleId(selectedTags, setSelectedTags, t.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border ${
                          selectedTags.includes(t.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>SEO</Label>
                <div>
                  <Label htmlFor="meta_title" className="text-xs text-muted-foreground">Meta title (≤60 chars)</Label>
                  <Input
                    id="meta_title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    maxLength={60}
                    placeholder={title}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_desc" className="text-xs text-muted-foreground">Meta description (≤160 chars)</Label>
                  <Textarea
                    id="meta_desc"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={160}
                    rows={3}
                    placeholder={excerpt}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
