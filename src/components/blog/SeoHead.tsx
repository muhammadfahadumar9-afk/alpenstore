import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  type?: "website" | "article";
  publishedAt?: string | null;
  updatedAt?: string | null;
  jsonLd?: Record<string, any>;
}

export default function SeoHead({
  title,
  description,
  canonical,
  image,
  type = "website",
  publishedAt,
  updatedAt,
  jsonLd,
}: Props) {
  const url = canonical || (typeof window !== "undefined" ? window.location.href : "");
  const safeTitle = title.length > 60 ? title.slice(0, 57) + "…" : title;
  const safeDesc = description ? (description.length > 160 ? description.slice(0, 157) + "…" : description) : undefined;

  return (
    <Helmet>
      <title>{safeTitle}</title>
      {safeDesc && <meta name="description" content={safeDesc} />}
      {url && <link rel="canonical" href={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={safeTitle} />
      {safeDesc && <meta property="og:description" content={safeDesc} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={safeTitle} />
      {safeDesc && <meta name="twitter:description" content={safeDesc} />}
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
