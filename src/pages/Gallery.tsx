import { useState } from "react";
import { X } from "lucide-react";
import Layout from "@/components/layout/Layout";

// Import gallery images
import laYuqawam from "@/assets/gallery/la-yuqawam.png";
import oud24Hours from "@/assets/gallery/oud-24-hours.png";
import samaaAlOud from "@/assets/gallery/samaa-al-oud.jpeg";
import dirhamOud from "@/assets/gallery/dirham-oud.jpeg";
import vitalOud from "@/assets/gallery/vital-oud.png";
import blueMoon from "@/assets/gallery/blue-moon.png";

const galleryImages = [
  {
    src: laYuqawam,
    alt: "La Yuqawam Tobacco Blaze by Rasasi",
    category: "Arabian Perfumes",
  },
  {
    src: oud24Hours,
    alt: "Oud 24 Hours perfume set",
    category: "Arabian Perfumes",
  },
  {
    src: samaaAlOud,
    alt: "Samaa al Oud by Almas Perfumes",
    category: "Arabian Perfumes",
  },
  {
    src: dirhamOud,
    alt: "Dirham Oud perfume",
    category: "Arabian Perfumes",
  },
  {
    src: vitalOud,
    alt: "Vital Oud Eau de Parfum",
    category: "Arabian Perfumes",
  },
  {
    src: blueMoon,
    alt: "Blue Moon luxury perfume",
    category: "Arabian Perfumes",
  },
  {
    src: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
    alt: "Arabian perfume collection display",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=800&fit=crop",
    alt: "Premium oud perfume bottles",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&h=600&fit=crop",
    alt: "Store interior display",
    category: "Store",
  },
  {
    src: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=800&fit=crop",
    alt: "Luxury fragrance bottles",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
    alt: "Beauty and cosmetics selection",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop",
    alt: "Wellness products display",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=600&fit=crop",
    alt: "Skincare essentials",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&h=800&fit=crop",
    alt: "Traditional attar collection",
    category: "Products",
  },
  {
    src: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop",
    alt: "Natural wellness ingredients",
    category: "Products",
  },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image.src)}
                className={`card-alpen overflow-hidden cursor-pointer animate-scale-in ${
                  index % 3 === 1 ? "sm:row-span-2" : ""
                }`}
                style={{ opacity: 0, animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative ${index % 3 === 1 ? "aspect-[4/5]" : "aspect-[4/3]"} overflow-hidden`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 text-background">
                      <span className="text-xs font-medium bg-primary/80 px-3 py-1 rounded-full">
                        {image.category}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-background/10 rounded-full text-background hover:bg-background/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt="Gallery image"
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
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
