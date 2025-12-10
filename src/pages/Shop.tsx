import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Arabian Perfumes", "Islamic Wellness", "Cosmetics", "Gift Sets"];

const products = [
  {
    id: 1,
    name: "Royal Oud Perfume",
    category: "Arabian Perfumes",
    price: 25000,
    originalPrice: 30000,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Amber Musk Collection",
    category: "Arabian Perfumes",
    price: 18000,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Black Seed Oil",
    category: "Islamic Wellness",
    price: 5000,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    badge: "Popular",
  },
  {
    id: 4,
    name: "Luxury Gift Set",
    category: "Gift Sets",
    price: 45000,
    originalPrice: 55000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    badge: "Limited",
  },
  {
    id: 5,
    name: "Rose Face Serum",
    category: "Cosmetics",
    price: 12000,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
  },
  {
    id: 6,
    name: "Arabian Nights Attar",
    category: "Arabian Perfumes",
    price: 32000,
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400&h=400&fit=crop",
  },
  {
    id: 7,
    name: "Honey & Herbs Set",
    category: "Islamic Wellness",
    price: 8500,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
  },
  {
    id: 8,
    name: "Premium Skincare Kit",
    category: "Cosmetics",
    price: 22000,
    originalPrice: 28000,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    badge: "Sale",
  },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (productName: string) => {
    toast({
      title: "Added to Cart",
      description: `${productName} has been added to your cart.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-accent to-background">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Shop <span className="text-primary">Our Collection</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Discover authentic Arabian perfumes, wellness products, and premium cosmetics.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full border-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding">
        <div className="container-alpen">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card-alpen group">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <button
                    className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                  <h3 className="font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product.name)}
                    className="w-full"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Payment Info */}
      <section className="py-12 bg-muted">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif font-bold mb-4">Secure Payment & Delivery</h2>
            <p className="text-muted-foreground mb-6">
              Pay securely online or choose cash on delivery. Free shipping on orders above ₦20,000.
              Pickup available at all our 4 branches.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <a href="https://wa.me/2349168877858?text=Hello%20ALPEN%20STORE%20LTD!%20I%20would%20like%20to%20place%20an%20order." target="_blank" rel="noopener noreferrer">
                  Order via WhatsApp
                </a>
              </Button>
              <Button asChild>
                <Link to="/contact">Find a Branch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
