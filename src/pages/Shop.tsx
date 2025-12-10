import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  featured: boolean;
}

const categoryMap: Record<string, string> = {
  perfumes: "Arabian Perfumes",
  wellness: "Islamic Wellness",
  cosmetics: "Cosmetics & Beauty",
  gifts: "Luxury Gift Sets",
};

const categories = ["All", "Arabian Perfumes", "Islamic Wellness", "Cosmetics & Beauty", "Luxury Gift Sets"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const categoryLabel = categoryMap[product.category] || product.category;
    const matchesCategory = selectedCategory === "All" || categoryLabel === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
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

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="card-alpen animate-pulse">
                  <div className="aspect-square bg-muted"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                    <div className="h-5 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-9 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card-alpen group">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                      )}
                      {product.featured && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                      {!product.in_stock && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                          Out of Stock
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
                      <p className="text-xs text-muted-foreground mb-1">
                        {categoryMap[product.category] || product.category}
                      </p>
                      <h3 className="font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product.name)}
                        className="w-full"
                        size="sm"
                        disabled={!product.in_stock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.in_stock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {products.length === 0 
                      ? "No products available yet. Check back soon!"
                      : "No products found matching your criteria."}
                  </p>
                </div>
              )}
            </>
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
