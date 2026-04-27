import { useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " — " + url)}`,
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: description || title, url });
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error("Share failed:", err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "The article link is on your clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy the URL manually.", variant: "destructive" });
    }
  };

  const openShare = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer,width=620,height=520");

  return (
    <div className="flex flex-wrap items-center gap-2 my-8 py-4 border-y border-border">
      <span className="text-sm font-medium text-muted-foreground mr-1">Share this article:</span>

      {hasNativeShare && (
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={handleNativeShare} title="Share" aria-label="Share">
          <Share2 className="h-4 w-4" />
        </Button>
      )}

      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]" onClick={() => openShare(shareLinks.facebook)} title="Share on Facebook" aria-label="Share on Facebook">
        <Facebook className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-foreground hover:text-background hover:border-foreground" onClick={() => openShare(shareLinks.twitter)} title="Share on X (Twitter)" aria-label="Share on X">
        <Twitter className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]" onClick={() => openShare(shareLinks.linkedin)} title="Share on LinkedIn" aria-label="Share on LinkedIn">
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-[#25D366] hover:text-white hover:border-[#25D366]" onClick={() => openShare(shareLinks.whatsapp)} title="Share on WhatsApp" aria-label="Share on WhatsApp">
        <MessageCircle className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={handleCopy} title={copied ? "Link copied!" : "Copy link"} aria-label="Copy link">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
      </Button>
    </div>
  );
}