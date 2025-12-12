import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  delivery_method: string;
  delivery_address: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string; step: number }> = {
  pending: { icon: Clock, color: "bg-yellow-500", label: "Pending", step: 1 },
  processing: { icon: Package, color: "bg-blue-500", label: "Processing", step: 2 },
  shipped: { icon: Truck, color: "bg-purple-500", label: "Shipped", step: 3 },
  delivered: { icon: CheckCircle, color: "bg-green-500", label: "Delivered", step: 4 },
  cancelled: { icon: XCircle, color: "bg-red-500", label: "Cancelled", step: 0 },
};

const OrderHistory = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from("order_items")
            .select("id, product_name, product_price, quantity")
            .eq("order_id", order.id);

          return { ...order, order_items: items || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} text-white`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderStatusTracker = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    const currentStep = config.step;
    const steps = [
      { step: 1, label: "Pending" },
      { step: 2, label: "Processing" },
      { step: 3, label: "Shipped" },
      { step: 4, label: "Delivered" },
    ];

    if (status === "cancelled") {
      return (
        <div className="flex items-center justify-center py-4 text-destructive">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>

          {steps.map(({ step, label }) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  step <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 ${
                  step <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-accent to-background">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              Order <span className="text-primary">History</span>
            </h1>
            <p className="text-muted-foreground">
              Track and manage all your orders in one place
            </p>
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section className="section-padding">
        <div className="container-alpen max-w-4xl">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Start shopping to see your orders here
              </p>
              <Button asChild>
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-left">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                        <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="text-sm">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total</p>
                        <p className="font-semibold text-primary">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>
                    <div className="ml-4">
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-border p-4 sm:p-6 space-y-6 animate-fade-in">
                      {/* Status Tracker */}
                      <div>
                        <h4 className="font-medium mb-2">Order Status</h4>
                        {renderStatusTracker(order.status)}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-3">Items</h4>
                        <div className="space-y-3">
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × {formatPrice(item.product_price)}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {formatPrice(item.product_price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Delivery Method</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {order.delivery_method}
                          </p>
                        </div>
                        {order.delivery_address && (
                          <div>
                            <h4 className="font-medium mb-2">Delivery Address</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.delivery_address}
                            </p>
                          </div>
                        )}
                        {order.phone && (
                          <div>
                            <h4 className="font-medium mb-2">Phone</h4>
                            <p className="text-sm text-muted-foreground">{order.phone}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div>
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={`https://wa.me/2349168877858?text=Hello!%20I%20have%20a%20question%20about%20my%20order%20${order.id.slice(0, 8)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Contact Support
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OrderHistory;
