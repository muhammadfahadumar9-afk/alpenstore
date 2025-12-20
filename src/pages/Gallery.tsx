import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// Import gallery images (static)
import laYuqawam from "@/assets/gallery/la-yuqawam.png";
import oud24Hours from "@/assets/gallery/oud-24-hours.png";
import samaaAlOud from "@/assets/gallery/samaa-al-oud.jpeg";
import dirhamOud from "@/assets/gallery/dirham-oud.jpeg";
import vitalOud from "@/assets/gallery/vital-oud.png";
import blueMoon from "@/assets/gallery/blue-moon.png";
import storeCollage from "@/assets/gallery/store-collage.jpeg";
import welcomeSign from "@/assets/gallery/welcome-sign.jpeg";
import storeTeam from "@/assets/gallery/store-team.jpeg";
import storeEntrance from "@/assets/gallery/store-entrance.jpeg";
import plazaBuilding from "@/assets/gallery/plaza-building.jpeg";
import plazaSignage from "@/assets/gallery/plaza-signage.jpeg";
import ceoPortrait from "@/assets/gallery/ceo-portrait.jpeg";
import mainBuilding from "@/assets/gallery/main-building.jpeg";
import ceoMeeting from "@/assets/gallery/ceo-meeting.jpeg";
import leadershipMeeting1 from "@/assets/gallery/leadership-meeting-1.png";
import leadershipMeeting2 from "@/assets/gallery/leadership-meeting-2.png";
import teamAwardCeremony from "@/assets/gallery/team-award-ceremony.png";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  description?: string;
}

const staticGalleryImages: GalleryImage[] = [
  { src: storeCollage, alt: "Alpen Stores Collection", category: "Our Store", description: "A beautiful display of our premium perfume collection" },
  { src: welcomeSign, alt: "Welcome to Alpen Stores", category: "Our Store", description: "Welcoming customers to an aromatic experience" },
  { src: storeTeam, alt: "Our Team at Alpen Stores", category: "Our Team", description: "Our dedicated team ready to serve you" },
  { src: storeEntrance, alt: "Alpen Store Entrance", category: "Our Store", description: "The elegant entrance to Alpen Stores" },
  { src: plazaBuilding, alt: "Sale Mai Gwanjo Plaza", category: "Our Locations", description: "Our flagship location at Sale Mai Gwanjo Plaza" },
  { src: plazaSignage, alt: "Alpen Stores Ltd Signage", category: "Our Locations", description: "Proudly displaying the Alpen Stores brand" },
  { src: ceoPortrait, alt: "CEO Portrait", category: "Leadership", description: "Our visionary CEO leading Alpen Stores" },
  { src: mainBuilding, alt: "Alpen Store Ltd Main Building", category: "Our Locations", description: "Our main headquarters and showroom" },
  { src: ceoMeeting, alt: "CEO at Work", category: "Leadership", description: "Strategic planning session with leadership" },
  { src: leadershipMeeting1, alt: "Leadership Board Meeting", category: "Leadership", description: "Board members discussing company growth" },
  { src: leadershipMeeting2, alt: "Leadership Discussion", category: "Leadership", description: "Collaborative decision-making at the highest level" },
  { src: teamAwardCeremony, alt: "Team Award Ceremony", category: "Our Team", description: "Celebrating excellence and dedication" },
  { src: laYuqawam, alt: "La Yuqawam Tobacco Blaze by Rasasi", category: "Arabian Perfumes", description: "A bold blend of tobacco and oriental notes" },
  { src: oud24Hours, alt: "Oud 24 Hours perfume set", category: "Arabian Perfumes", description: "Long-lasting oud fragrance for all occasions" },
  { src: samaaAlOud, alt: "Samaa al Oud by Almas Perfumes", category: "Arabian Perfumes", description: "Pure Arabian oud with heavenly notes" },
  { src: dirhamOud, alt: "Dirham Oud perfume", category: "Arabian Perfumes", description: "Luxurious oud at an accessible price" },
  { src: vitalOud, alt: "Vital Oud Eau de Parfum", category: "Arabian Perfumes", description: "Energizing oud with fresh undertones" },
  { src: blueMoon, alt: "Blue Moon luxury perfume", category: "Arabian Perfumes", description: "A mysterious and captivating fragrance" },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [uploadedImages, setUploadedImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const imageList = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          src: supabase.storage.from('product-images').getPublicUrl(file.name).data.publicUrl,
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

  // Combine static and uploaded images
  const allImages = [...uploadedImages, ...staticGalleryImages];

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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allImages.map((image, index) => (
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

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          style={{ animation: 'fadeIn 300ms ease-out forwards' }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-4xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              style={{ animation: 'scaleIn 300ms ease-out forwards' }}
            />
            <div className="mt-4 text-center text-white max-w-lg">
              <span className="text-xs font-medium bg-primary/80 px-3 py-1 rounded-full mb-2 inline-block">
                {selectedImage.category}
              </span>
              <h3 className="text-xl font-semibold mb-2">{selectedImage.alt}</h3>
              {selectedImage.description && (
                <p className="text-white/80">{selectedImage.description}</p>
              )}
            </div>
          </div>
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
