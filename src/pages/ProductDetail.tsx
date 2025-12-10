import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
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
  gifts: "Luxury Gift Sets",
};

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate('/shop');
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist.",
          variant: "destructive",
        });
        return;
      }

      setProduct(data);
      fetchRelatedProducts(data.category, data.id);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, currentId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .eq('in_stock', true)
        .limit(4);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
      },
      quantity
    );
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await navigator.share({
        title: product.name,
        text: product.description || `Check out ${product.name} at ALPEN STORE LTD`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard.",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading product...</div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="py-4 bg-muted/50">
        <div className="container-alpen">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
              Shop
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="section-padding">
        <div className="container-alpen">
          <Button
            variant="ghost"
            onClick={() => navigate('/shop')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-32 h-32 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              {product.featured && (
                <Badge className="absolute top-4 left-4">Featured</Badge>
              )}
              {!product.in_stock && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {categoryMap[product.category] || product.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.in_stock && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                      disabled={!product.in_stock}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                      disabled={!product.in_stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1 gap-2"
                    disabled={!product.in_stock}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.in_stock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Button variant="outline" size="lg" className="px-4">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="px-4" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Order via WhatsApp */}
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">
                  Prefer to order directly? Contact us on WhatsApp!
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`https://wa.me/2349168877858?text=Hello%20ALPEN%20STORE%20LTD!%20I%20would%20like%20to%20order%20${encodeURIComponent(product.name)}%20(${formatPrice(product.price)})`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Order via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-alpen">
            <h2 className="text-2xl font-serif font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/shop/${relatedProduct.id}`}
                  className="card-alpen group"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {relatedProduct.image_url ? (
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      {categoryMap[relatedProduct.category] || relatedProduct.category}
                    </p>
                    <h3 className="font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(relatedProduct.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
