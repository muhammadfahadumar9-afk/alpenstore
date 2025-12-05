import { Link } from "react-router-dom";
import { Award, Users, Heart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const values = [
  {
    icon: Award,
    title: "Quality First",
    description: "We source only authentic, premium products from trusted suppliers worldwide.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We go above and beyond to serve you.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "Honest business practices and transparent pricing in everything we do.",
  },
  {
    icon: Target,
    title: "Excellence",
    description: "Continuous improvement in our products, services, and customer experience.",
  },
];

const milestones = [
  { year: "2014", title: "Foundation", description: "Started our journey in Kano with a passion for authentic fragrances" },
  { year: "2016", title: "First Expansion", description: "Opened our second branch at Hajj Camp Market" },
  { year: "2019", title: "Growth", description: "Expanded to Zoo Road and Audu Bako Way locations" },
  { year: "2024", title: "Digital Era", description: "Launched online shopping to serve customers nationwide" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-accent to-background">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              About <span className="text-primary">Alpenstore</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A decade of excellence in Arabian perfumes, Islamic wellness, and premium beauty products.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                From Humble Beginnings to <span className="text-primary">4 Branches</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Alpenstore is a premium retail brand in Kano, Nigeria with over 10 years of experience 
                  in Arabian perfumes, Islamic wellness, and high-quality cosmetics.
                </p>
                <p>
                  From a small shop to four branches across Kano, we have built our name on originality, 
                  premium fragrance collections, and excellent customer care.
                </p>
                <p>
                  Whether you visit us in-store or order online, Alpenstore ensures quality, honesty, 
                  and a premium shopping experience that keeps our customers coming back.
                </p>
              </div>
              <Button asChild size="lg">
                <Link to="/contact">Visit Our Stores</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-card">
                <img
                  src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=600&fit=crop"
                  alt="Alpenstore premium products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                <p className="text-4xl font-serif font-bold">10+</p>
                <p className="text-sm">Years of Trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-muted">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our <span className="text-primary">Values</span>
            </h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do at Alpenstore.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="card-alpen p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our <span className="text-primary">Journey</span>
            </h2>
            <p className="text-muted-foreground">
              Key milestones in our growth story.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="font-serif text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-alpen text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Experience the Alpenstore Difference
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Visit any of our branches or shop online to discover our premium collection.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link to="/shop">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
