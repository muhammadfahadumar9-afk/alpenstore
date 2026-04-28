import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/blog";

interface Comment {
  id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export default function CommentsSection({ postId }: { postId: string }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    // Anonymous visitors read from a privacy-safe public view (no user_id).
    // Logged-in users read from the base table so we can show "delete own" controls.
    if (user) {
      const { data } = await supabase
        .from("blog_comments")
        .select("id, user_id, author_name, content, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      setComments((data || []) as Comment[]);
    } else {
      const { data } = await supabase
        .from("blog_comments_public" as any)
        .select("id, author_name, content, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      setComments(
        (data || []).map((c: any) => ({ ...c, user_id: null })) as Comment[]
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = text.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      toast.error("Comment must be 1–2000 characters");
      return;
    }
    setSubmitting(true);
    const authorName =
      (user.user_metadata?.full_name as string) ||
      user.email?.split("@")[0] ||
      "Anonymous";
    const { error } = await supabase.from("blog_comments").insert({
      post_id: postId,
      user_id: user.id,
      author_name: authorName,
      content: trimmed,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
    toast.success("Comment posted");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Comment deleted");
    load();
  };

  return (
    <section className="mt-12 pt-8 border-t border-border" aria-label="Comments">
      <h2 className="font-serif text-2xl font-semibold mb-6">
        Comments {comments.length > 0 && <span className="text-muted-foreground text-base">({comments.length})</span>}
      </h2>

      {user ? (
        <form onSubmit={submit} className="mb-8 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts…"
            maxLength={2000}
            rows={4}
            required
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length}/2000</span>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-muted rounded-lg text-sm">
          <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link> to leave a comment.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm">{c.author_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                </div>
                {(isAdmin || user?.id === c.user_id) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(c.id)}
                    aria-label="Delete comment"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
