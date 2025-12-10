import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .eq("in_stock", true)
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="section-padding bg-muted">
        <div className="container-alpen">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Featured <span className="text-primary">Products</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-muted">
      <div className="container-alpen">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Featured <span className="text-primary">Products</span>
          </h2>
          <p className="text-muted-foreground">
            Discover our handpicked selection of premium products loved by our customers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
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
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-primary">
                  ₦{Number(product.price).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="default" size="lg">
            <Link to="/shop">
              View All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
