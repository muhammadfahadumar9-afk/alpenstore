import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, MessageCircle, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setFormData({
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        notes: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart first.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryMethod === "delivery" && (!formData.phone || !formData.address)) {
      toast({
        title: "Missing information",
        description: "Please provide your phone number and delivery address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let orderId: string | undefined;

      if (user) {
        // Save order to database for logged-in users
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            total_amount: totalPrice,
            delivery_method: deliveryMethod,
            delivery_address: deliveryMethod === "delivery" ? formData.address : null,
            phone: formData.phone,
            notes: formData.notes,
            status: "pending",
          })
          .select()
          .single();

        if (orderError) throw orderError;

        orderId = order.id;

        // Save order items
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Generate WhatsApp message
      let message = user 
        ? `Hello ALPEN STORE LTD! I've placed an order through your website.\n\n`
        : `Hello ALPEN STORE LTD! I would like to place an order:\n\n`;

      message += `📦 ORDER DETAILS:\n`;
      items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n`;
      });

      message += `\n─────────────────\n`;
      message += `💰 Total: ${formatPrice(totalPrice)}\n\n`;

      if (deliveryMethod === "delivery") {
        message += `🚚 DELIVERY DETAILS:\n`;
        message += `📞 Phone: ${formData.phone}\n`;
        message += `📍 Address: ${formData.address}\n`;
        if (formData.city) message += `🏙️ City: ${formData.city}\n`;
      } else {
        message += `🏪 PICKUP at branch\n`;
        if (formData.phone) message += `📞 Phone: ${formData.phone}\n`;
      }

      if (formData.notes) {
        message += `\n📝 Notes: ${formData.notes}\n`;
      }

      message += `\nPlease confirm my order. Thank you!`;

      // Prepare order data for confirmation page
      const orderConfirmationData = {
        orderId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
        })),
        totalPrice,
        deliveryMethod,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        notes: formData.notes,
        whatsappMessage: message,
        isGuest: !user,
      };

      clearCart();
      toast({
        title: "Order placed!",
        description: "Redirecting to order confirmation...",
      });

      // Navigate to confirmation page with order data
      navigate("/order-confirmation", { state: orderConfirmationData });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-padding min-h-[60vh] flex items-center">
          <div className="container-alpen text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some products to checkout</p>
            <Button asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-alpen max-w-4xl">
          <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

          {!user && (
            <div className="bg-accent/50 rounded-xl p-4 mb-8 flex items-center justify-between">
              <p className="text-sm">
                <span className="font-medium">Have an account?</span>{" "}
                Sign in to save your order history.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Order Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Method */}
              <div className="card-alpen p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Method</h2>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={setDeliveryMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Home Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Free on orders above ₦20,000
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Store className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Branch Pickup</p>
                        <p className="text-sm text-muted-foreground">
                          Pick up from any of our 4 branches
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Contact & Address */}
              <div className="card-alpen p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+234..."
                      required
                    />
                  </div>

                  {deliveryMethod === "delivery" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, city: e.target.value }))
                          }
                          placeholder="e.g., Kano"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, address: e.target.value }))
                          }
                          placeholder="Full address for delivery"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={loading}
              >
                <MessageCircle className="h-5 w-5" />
                {loading ? "Processing..." : "Place Order via WhatsApp"}
              </Button>
            </form>

            {/* Order Summary */}
            <div className="card-alpen p-6 h-fit lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-muted-foreground">
                    {deliveryMethod === "pickup"
                      ? "Free (Pickup)"
                      : totalPrice >= 20000
                      ? "Free"
                      : "TBD"}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your order will be confirmed via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
