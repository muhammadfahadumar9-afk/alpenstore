import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SeoHead from "@/components/blog/SeoHead";
import CommentsSection from "@/components/blog/CommentsSection";
import { sanitizeHtml, formatDate, readingTime } from "@/lib/blog";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  updated_at: string;
  blog_post_categories: { blog_categories: { name: string; slug: string } | null }[];
  blog_post_tags: { blog_tags: { name: string; slug: string } | null }[];
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, content, cover_image_url, meta_title, meta_description, published_at, updated_at, blog_post_categories(blog_categories(name, slug)), blog_post_tags(blog_tags(name, slug))"
        )
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();
      setPost(data as any);
      setLoading(false);

      if (data) {
        const { data: rel } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, cover_image_url, published_at, content, blog_post_categories(blog_categories(name, slug))")
          .eq("status", "published")
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated(rel || []);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container-alpen py-20 text-center text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container-alpen py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-3">Article not found</h1>
          <p className="text-muted-foreground mb-6">This article may have been moved or unpublished.</p>
          <Button asChild><Link to="/blog">Back to Blog</Link></Button>
        </div>
      </Layout>
    );
  }

  const category = post.blog_post_categories?.[0]?.blog_categories;
  const tags = post.blog_post_tags?.map((t) => t.blog_tags).filter(Boolean) as { name: string; slug: string }[];
  const url = typeof window !== "undefined" ? window.location.href : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "ALPEN STORE LTD" },
    publisher: {
      "@type": "Organization",
      name: "ALPEN STORE LTD",
      logo: { "@type": "ImageObject", url: `${window.location.origin}/favicon.ico` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <Layout>
      <SeoHead
        title={post.meta_title || `${post.title} | ALPEN STORE Blog`}
        description={post.meta_description || post.excerpt || undefined}
        image={post.cover_image_url}
        type="article"
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
        jsonLd={jsonLd}
      />

      <article className="container-alpen py-8 md:py-12 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {category && (
          <Link
            to={`/blog/category/${category.slug}`}
            className="inline-block text-xs font-semibold uppercase tracking-wide text-primary mb-3 hover:underline"
          >
            {category.name}
          </Link>
        )}

        <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.published_at || ""}>{formatDate(post.published_at)}</time>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readingTime(post.content)} min read
          </span>
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full rounded-lg mb-8 aspect-[16/9] object-cover"
          />
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-a:text-primary prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
            <span className="text-sm text-muted-foreground mr-2">Tags:</span>
            {tags.map((t) => (
              <Link
                key={t.slug}
                to={`/blog/tag/${t.slug}`}
                className="text-xs px-3 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        <CommentsSection postId={post.id} />

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-serif text-2xl font-semibold mb-6">Continue reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="block group"
                >
                  {r.cover_image_url && (
                    <img
                      src={r.cover_image_url}
                      alt={r.title}
                      loading="lazy"
                      className="w-full aspect-video object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-serif font-semibold text-sm group-hover:text-primary line-clamp-2">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}
