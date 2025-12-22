import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import ZoomableLightbox from "@/components/gallery/ZoomableLightbox";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  description?: string;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('gallery-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const imageList = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          src: supabase.storage.from('gallery-images').getPublicUrl(file.name).data.publicUrl,
          alt: file.name.replace(/^\d+-/, '').replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
          category: "Uploaded"
        }));

      setUploadedImages(imageList);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use only uploaded images
  const allImages = uploadedImages;

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(allImages.map(img => img.category)))];

  // Filter images by category and search query
  const filteredImages = useMemo(() => {
    let images = activeCategory === "All" 
      ? allImages 
      : allImages.filter(img => img.category === activeCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      images = images.filter(img => 
        img.alt.toLowerCase().includes(query) ||
        img.category.toLowerCase().includes(query) ||
        (img.description && img.description.toLowerCase().includes(query))
      );
    }
    
    return images;
  }, [allImages, activeCategory, searchQuery]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-accent to-background">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Our <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-muted-foreground">
              Explore our beautiful collection of Arabian perfumes, wellness products, and store ambiance.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Category Filters */}
      <section className="py-6 border-b border-border">
        <div className="container-alpen space-y-4">
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
                {activeCategory !== category && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({category === "All" ? allImages.length : allImages.filter(img => img.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-alpen">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? `No images found for "${searchQuery}"` : "No images found in this category."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-primary hover:underline text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`card-alpen overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform text-left ${
                    index % 3 === 1 ? "sm:row-span-2" : ""
                  }`}
                >
                  <div className={`relative ${index % 3 === 1 ? "aspect-[4/5]" : "aspect-[4/3]"} overflow-hidden`}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                        <span className="text-xs font-medium bg-primary/80 px-3 py-1 rounded-full mb-2 inline-block">
                          {image.category}
                        </span>
                        <h3 className="font-semibold text-sm mb-1">{image.alt}</h3>
                        {image.description && (
                          <p className="text-xs text-background/80 line-clamp-2">{image.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox with Zoom */}
      {selectedImage && (
        <ZoomableLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Instagram CTA */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container-alpen text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Follow Us on Instagram</h2>
          <p className="text-primary-foreground/80 mb-6">
            Stay updated with our latest products and offers @alpenstores
          </p>
          <a
            href="https://instagram.com/alpenstores"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-full font-medium hover:bg-background/90 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @alpenstores
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
