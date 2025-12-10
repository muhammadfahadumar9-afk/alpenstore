import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  totalAmount: number;
}

const statusMessages: Record<string, { subject: string; heading: string; message: string }> = {
  pending: {
    subject: "Order Received - ALPEN STORE LTD",
    heading: "We've Received Your Order!",
    message: "Thank you for your order. We're processing it and will update you soon.",
  },
  confirmed: {
    subject: "Order Confirmed - ALPEN STORE LTD",
    heading: "Your Order is Confirmed!",
    message: "Great news! Your order has been confirmed and is being prepared.",
  },
  processing: {
    subject: "Order Being Prepared - ALPEN STORE LTD",
    heading: "Your Order is Being Prepared",
    message: "Our team is carefully preparing your items for dispatch.",
  },
  shipped: {
    subject: "Order Shipped - ALPEN STORE LTD",
    heading: "Your Order is On Its Way!",
    message: "Exciting news! Your order has been shipped and is on its way to you.",
  },
  delivered: {
    subject: "Order Delivered - ALPEN STORE LTD",
    heading: "Your Order Has Been Delivered!",
    message: "Your order has been delivered. We hope you love your purchase!",
  },
  cancelled: {
    subject: "Order Cancelled - ALPEN STORE LTD",
    heading: "Your Order Has Been Cancelled",
    message: "Your order has been cancelled. If you have any questions, please contact us.",
  },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, customerName, newStatus, totalAmount }: OrderStatusEmailRequest = await req.json();

    console.log(`Sending order status email to ${customerEmail} for order ${orderId}, status: ${newStatus}`);

    if (!customerEmail) {
      console.log("No customer email provided, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email to send to" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusInfo = statusMessages[newStatus] || {
      subject: `Order Update - ALPEN STORE LTD`,
      heading: "Order Status Update",
      message: `Your order status has been updated to: ${newStatus}`,
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A8A3A 0%, #0d9d43 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ALPEN STORE LTD</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Arabian Perfumes & Islamic Wellness</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #0A8A3A; margin-top: 0;">${statusInfo.heading}</h2>
            
            <p>Dear ${customerName || "Valued Customer"},</p>
            
            <p>${statusInfo.message}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
              <p style="margin: 0 0 10px;"><strong>Status:</strong> <span style="background: #0A8A3A; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase;">${newStatus}</span></p>
              <p style="margin: 0;"><strong>Total:</strong> ${formatPrice(totalAmount)}</p>
            </div>
            
            <p style="margin-bottom: 0;">If you have any questions, please don't hesitate to contact us:</p>
            <ul style="margin-top: 10px;">
              <li>WhatsApp: <a href="https://wa.me/2349168877858" style="color: #0A8A3A;">+234 916 887 7858</a></li>
              <li>Email: <a href="mailto:info@alpenstore.com.ng" style="color: #0A8A3A;">info@alpenstore.com.ng</a></li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              © ${new Date().getFullYear()} ALPEN STORE LTD. All rights reserved.<br>
              Kano, Nigeria
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ALPEN STORE LTD <onboarding@resend.dev>",
      to: [customerEmail],
      subject: statusInfo.subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
