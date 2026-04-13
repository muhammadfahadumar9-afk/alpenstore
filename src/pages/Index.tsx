import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Star, Truck, Shield, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import FeaturedProducts from "@/components/FeaturedProducts";
import heroImage from "@/assets/hero-perfumes.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  { icon: Star, title: "20+ Years Trusted", description: "Serving Kano with authentic products" },
  { icon: Shield, title: "100% Original", description: "Guaranteed authentic products" },
  { icon: MapPin, title: "4 Branches", description: "Convenient locations across Kano" },
  { icon: Truck, title: "Nationwide Delivery", description: "We deliver across Nigeria" },
  { icon: Clock, title: "Cash on Delivery", description: "Pay when you receive your order" },
];

const testimonials = [
  { name: "Amina Ibrahim", text: "The best Arabian perfumes in Kano! I've been a loyal customer for 5 years.", rating: 5 },
  { name: "Yusuf Mohammed", text: "Quality products and excellent customer service. Highly recommended!", rating: 5 },
  { name: "Fatima Abubakar", text: "Their gift sets are perfect for every occasion. Always my first choice.", rating: 5 },
];

const Index = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fade, setFade] = useState(true);

  const { data: collectionProducts, isLoading: collectionsLoading } = useQuery({
    queryKey: ["collection-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const totalPages = collectionProducts ? Math.ceil(collectionProducts.length / 4) : 1;

  const rotateProducts = useCallback(() => {
    if (totalPages <= 1) return;
    setFade(false);
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setFade(true);
    }, 400);
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(rotateProducts, 12000);
    return () => clearInterval(interval);
  }, [rotateProducts, totalPages]);

  const visibleProducts = collectionProducts?.slice(currentPage * 4, currentPage * 4 + 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Luxurious Arabian perfumes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container-alpen relative z-10 py-20">
          <div className="max-w-2xl space-y-6 animate-slide-up">
            <span className="inline-block px-4 py-2 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium backdrop-blur-sm border border-primary/30">
              20+ Years of Excellence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-background leading-tight">
              ALPEN STORE LTD
              <span className="block text-primary mt-2">Arabian Perfumes & Islamic Wellness</span>
            </h1>
            <p className="text-lg text-background/80 leading-relaxed">
              Discover authentic Arabian scents, halal wellness products, and premium cosmetics. 
              Serving Kano with quality and trust for over two decades.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/shop">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/contact">Visit a Branch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Collection - Real Products */}
      <section className="section-padding bg-muted">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Explore Our <span className="text-primary">Collection</span>
            </h2>
            <p className="text-muted-foreground">
              From rare Arabian oud to premium beauty products, discover our carefully curated selection.
            </p>
          </div>

          {collectionsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-alpen">
                  <Skeleton className="aspect-square" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProducts.length > 0 ? (
            <>
              <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-400 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                {visibleProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="card-alpen group hover:scale-[1.02] transition-transform"
                  >
                    <div className="aspect-square overflow-hidden bg-accent">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-serif text-sm sm:text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base font-bold text-primary">
                        ₦{Number(product.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setFade(false); setTimeout(() => { setCurrentPage(i); setFade(true); }, 400); }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentPage ? 'bg-primary w-6' : 'bg-primary/30'}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No products available yet.</p>
          )}

          <div className="text-center mt-10">
            <Button asChild variant="default" size="lg">
              <Link to="/shop">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Why Choose <span className="text-primary">ALPEN STORE LTD?</span>
            </h2>
            <p className="text-muted-foreground">
              We are committed to providing the best products and shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-primary-foreground/80">
              Join thousands of satisfied customers across Kano and Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-background/20"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-alpen-gold" />
                  ))}
                </div>
                <p className="text-primary-foreground/90 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="bg-gradient-to-r from-primary to-alpen-green-light rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Ready to Experience Luxury?
            </h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Visit any of our 4 branches in Kano or shop online with free delivery on orders above ₦20,000.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="secondary" size="lg">
                <Link to="/shop">Browse Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/contact">Find a Store</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
