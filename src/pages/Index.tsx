import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-perfumes.jpg";

const categories = [
  {
    title: "Arabian Perfumes",
    description: "Authentic oud, musk, and exotic fragrances",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
  },
  {
    title: "Islamic Wellness",
    description: "Halal wellness and spiritual care products",
    image: "https://images.unsplash.com/photo-1600428877878-1a0fd85beda8?w=400&h=400&fit=crop",
  },
  {
    title: "Cosmetics & Beauty",
    description: "Premium skincare and beauty essentials",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
  },
  {
    title: "Luxury Gift Sets",
    description: "Curated collections for special occasions",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
  },
];

const features = [
  { icon: Star, title: "10+ Years Trusted", description: "Serving Kano with authentic products" },
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
              10+ Years of Excellence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-background leading-tight">
              Alpenstore
              <span className="block text-primary mt-2">Arabian Perfumes & Islamic Wellness</span>
            </h1>
            <p className="text-lg text-background/80 leading-relaxed">
              Discover authentic Arabian scents, halal wellness products, and premium cosmetics. 
              Serving Kano with quality and trust for over a decade.
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

      {/* Categories Section */}
      <section className="section-padding bg-muted">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Explore Our <span className="text-primary">Collections</span>
            </h2>
            <p className="text-muted-foreground">
              From rare Arabian oud to premium beauty products, discover our carefully curated selection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.title}
                to="/shop"
                className="card-alpen group hover:scale-[1.02] transition-transform"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Why Choose <span className="text-primary">Alpenstore?</span>
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
