import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SeoHead from "@/components/blog/SeoHead";
import PostCard from "@/components/blog/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const PAGE_SIZE = 9;

export default function Blog() {
  const { slug: catSlug } = useParams<{ slug?: string }>();
  const path = window.location.pathname;
  const isCategory = path.startsWith("/blog/category/");
  const isTag = path.startsWith("/blog/tag/");

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterTitle, setFilterTitle] = useState<string>("All articles");

  useEffect(() => {
    supabase
      .from("blog_categories")
      .select("name, slug")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let postIds: string[] | null = null;

      if (isCategory && catSlug) {
        const { data: cat } = await supabase
          .from("blog_categories")
          .select("id, name")
          .eq("slug", catSlug)
          .maybeSingle();
        if (cat) {
          setFilterTitle(`Category: ${cat.name}`);
          const { data: links } = await supabase
            .from("blog_post_categories")
            .select("post_id")
            .eq("category_id", cat.id);
          postIds = (links || []).map((l) => l.post_id);
        } else {
          postIds = [];
        }
      } else if (isTag && catSlug) {
        const { data: tag } = await supabase
          .from("blog_tags")
          .select("id, name")
          .eq("slug", catSlug)
          .maybeSingle();
        if (tag) {
          setFilterTitle(`Tag: ${tag.name}`);
          const { data: links } = await supabase
            .from("blog_post_tags")
            .select("post_id")
            .eq("tag_id", tag.id);
          postIds = (links || []).map((l) => l.post_id);
        } else {
          postIds = [];
        }
      } else {
        setFilterTitle("All articles");
      }

      let query = supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, cover_image_url, published_at, content, blog_post_categories(blog_categories(name, slug))",
          { count: "exact" }
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (postIds !== null) {
        if (postIds.length === 0) {
          setPosts([]);
          setTotal(0);
          setLoading(false);
          return;
        }
        query = query.in("id", postIds);
      }
      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, count } = await query;
      setPosts(data || []);
      setTotal(count || 0);
      setLoading(false);
    };
    load();
  }, [page, search, catSlug, isCategory, isTag]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout>
      <SeoHead
        title={`${filterTitle} | ALPEN STORE Blog`}
        description="Articles, stories and updates from ALPEN STORE LTD — perfumes, dates, gifting and more."
      />

      <section className="bg-secondary py-12 md:py-16">
        <div className="container-alpen text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-3">
            ALPEN Journal
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stories, guides and behind-the-scenes from our family of brands.
          </p>
        </div>
      </section>

      <section className="container-alpen py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="font-serif text-2xl font-semibold">{filterTitle}</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              to="/blog"
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !isCategory && !isTag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/blog/category/${c.slug}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  isCategory && catSlug === c.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center py-16 text-muted-foreground">Loading articles…</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No articles found.</p>
            {(isCategory || isTag || search) && (
              <Button asChild variant="outline">
                <Link to="/blog">View all articles</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  disabled={page + 1 >= pageCount}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
}
