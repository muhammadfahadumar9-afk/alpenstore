import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, Package, ArrowUpDown, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import RamadanBanner from "@/components/banners/RamadanBanner";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
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
  created_at: string;
}

const categoryMap: Record<string, string> = {
  perfumes: "Arabian Perfumes",
  wellness: "Islamic Wellness",
  cosmetics: "Cosmetics & Beauty",
  dates: "Dates",
};

const categories = ["All", "Arabian Perfumes", "Islamic Wellness", "Cosmetics & Beauty", "Dates"];

const PRODUCTS_PER_PAGE = 24;

type SortOption = "newest" | "price-low" | "price-high";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get total count first
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Fetch products with pagination
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + PRODUCTS_PER_PAGE - 1);

      if (error) throw error;
      
      const newProducts = data || [];
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts(0, false);
  }, [fetchProducts]);

  const loadMoreProducts = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(products.length, true);
    }
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryLabel = categoryMap[product.category] || product.category;
      const matchesCategory = selectedCategory === "All" || categoryLabel === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You must sign up or log in to continue.",
        variant: "destructive",
      });
      sessionStorage.setItem("redirectAfterAuth", `/shop/${product.id}`);
      navigate("/auth");
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
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
      {/* Ramadan Promotion Banner */}
      <RamadanBanner />

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
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    <Link to={`/shop/${product.id}`} className="block">
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
                          onClick={(e) => e.preventDefault()}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                    </Link>
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground mb-1">
                        {categoryMap[product.category] || product.category}
                      </p>
                      <Link to={`/shop/${product.id}`}>
                        <h3 className="font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
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

              {/* Load More Button */}
              {hasMore && filteredProducts.length > 0 && selectedCategory === "All" && !searchQuery && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="min-w-[200px]"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More Products`
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing {products.length} of {totalCount} products
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
