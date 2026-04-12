import { Link } from "react-router-dom";
import { Award, Users, Heart, Target, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Layout from "@/components/layout/Layout";
import CeoBio from "@/components/about/CeoBio";
import BoardOfDirectors from "@/components/about/BoardOfDirectors";
import ManagementTeam from "@/components/about/ManagementTeam";
import OurLocations from "@/components/about/OurLocations";
import ahmadImg from "@/assets/managers/ahmad-kabiru.jpg";
import mukhtarImg from "@/assets/managers/mukhtar-jibril.jpg";
import umarImg from "@/assets/managers/umar-abdullahi.jpg";

const branchManagers = [
  {
    name: "Ahmad Kabiru Sani",
    branch: "Hajj Camp Market",
    image: ahmadImg,
    bio: "Manages our Hajj Camp Market branch with dedication and expertise in premium fragrances.",
  },
  {
    name: "Mukhtar Jibril Hassan",
    branch: "Zoo Road Branch",
    image: mukhtarImg,
    bio: "Leads our Zoo Road branch with a focus on customer satisfaction and quality service.",
  },
  {
    name: "Umar Abdullahi Hassan",
    branch: "Audu Bako Way Branch",
    image: umarImg,
    bio: "Oversees our Audu Bako Way branch with deep knowledge of Arabian perfumes and cosmetics.",
  },
];

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
              About <span className="text-primary">ALPEN STORE LTD</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A decade of excellence in Arabian perfumes, Islamic wellness, and premium beauty products.
            </p>
          </div>
        </div>
      </section>

      {/* CEO Biography */}
      <CeoBio />

      {/* Board of Directors */}
      <BoardOfDirectors />

      {/* Management Team */}
      <ManagementTeam />


      {/* Values Section */}
      <section className="section-padding bg-muted">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our <span className="text-primary">Values</span>
            </h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do at ALPEN STORE LTD.
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

      {/* Branch Managers Section */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Our <span className="text-primary">Branch Managers</span>
            </h2>
            <p className="text-muted-foreground">
              Meet the dedicated leaders managing our branches across Kano.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {branchManagers.map((manager) => (
              <div
                key={manager.name}
                className="card-alpen p-6 text-center group hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                  <AvatarImage src={manager.image} alt={manager.name} />
                  <AvatarFallback className="text-lg font-serif bg-primary/10 text-primary">
                    {manager.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-serif text-lg font-semibold mb-1">{manager.name}</h3>
                <div className="flex items-center justify-center gap-1 text-primary text-sm font-medium mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {manager.branch}
                </div>
                <p className="text-sm text-muted-foreground">{manager.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Locations */}
      <OurLocations />


      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-alpen text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Experience the ALPEN STORE LTD Difference
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
