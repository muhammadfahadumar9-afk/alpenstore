import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { formatDate, readingTime } from "@/lib/blog";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  content: string;
  blog_post_categories?: { blog_categories: { name: string; slug: string } | null }[];
}

export default function PostCard({ post }: { post: Post }) {
  const category = post.blog_post_categories?.[0]?.blog_categories;

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-hover transition-all">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-5">
          {category && (
            <Link
              to={`/blog/category/${category.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block text-xs font-semibold uppercase tracking-wide text-primary mb-2 hover:underline"
            >
              {category.name}
            </Link>
          )}
          <h2 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readingTime(post.content)} min read
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
