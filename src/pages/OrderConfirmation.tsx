import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, MessageCircle, Package, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderData {
  orderId?: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryMethod: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  whatsappMessage: string;
  isGuest: boolean;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const state = location.state as OrderData | null;
    if (!state || !state.items || state.items.length === 0) {
      navigate("/shop");
      return;
    }
    setOrderData(state);
  }, [location.state, navigate]);

  useEffect(() => {
    if (!orderData) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto redirect to WhatsApp
          window.open(
            `https://wa.me/2349168877858?text=${encodeURIComponent(orderData.whatsappMessage)}`,
            "_blank"
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppRedirect = () => {
    if (orderData) {
      window.open(
        `https://wa.me/2349168877858?text=${encodeURIComponent(orderData.whatsappMessage)}`,
        "_blank"
      );
    }
  };

  if (!orderData) {
    return null;
  }

  return (
    <Layout>
      <section className="section-padding min-h-[70vh]">
        <div className="container-alpen max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              {orderData.isGuest
                ? "Your order details are ready. Please confirm via WhatsApp."
                : "Your order has been saved. Please confirm via WhatsApp to complete."}
            </p>
            {orderData.orderId && (
              <p className="mt-2 text-sm">
                Order ID: <span className="font-mono font-medium">#{orderData.orderId.slice(0, 8)}</span>
              </p>
            )}
          </div>

          {/* Order Details Card */}
          <div className="card-alpen p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>

            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(orderData.totalPrice)}</span>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="card-alpen p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {orderData.deliveryMethod === "delivery" ? "Delivery Details" : "Pickup Details"}
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{orderData.phone}</span>
              </div>
              {orderData.deliveryMethod === "delivery" && orderData.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {orderData.address}
                    {orderData.city && `, ${orderData.city}`}
                  </span>
                </div>
              )}
              {orderData.deliveryMethod === "pickup" && (
                <p className="text-muted-foreground">
                  You will pick up your order from one of our branches
                </p>
              )}
              {orderData.notes && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">Notes:</p>
                  <p>{orderData.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Action */}
          <div className="card-alpen p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Complete Your Order</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to send your order details to us via WhatsApp. 
              We'll confirm your order and arrange delivery.
            </p>
            
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleWhatsAppRedirect}
            >
              <MessageCircle className="h-5 w-5" />
              Confirm on WhatsApp {countdown > 0 && `(${countdown}s)`}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Auto-redirecting in {countdown} seconds...
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            {!orderData.isGuest && (
              <Button asChild variant="outline" className="flex-1">
                <Link to="/orders">View Order History</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderConfirmation;
