import Layout from "@/components/layout/Layout";

const Privacy = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-accent to-background">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-alpen">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="card-alpen p-8 md:p-12 space-y-8">
              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At ALPEN STORE LTD, we collect information you provide directly to us, including:
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>Name and contact information (phone number, email address)</li>
                  <li>Delivery address for order fulfillment</li>
                  <li>Payment information for transactions</li>
                  <li>Communication preferences and feedback</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about products, services, and promotions</li>
                  <li>Provide customer support via phone, email, or WhatsApp</li>
                  <li>Improve our services and customer experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">3. Payment Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use secure payment gateways (Paystack/Flutterwave) to process online transactions. 
                  Your payment information is encrypted and we do not store your full card details on our servers. 
                  Cash on delivery is also available for your convenience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">4. WhatsApp Communication</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By contacting us via WhatsApp or providing your phone number, you consent to receive 
                  order updates, promotional messages, and customer service communications through WhatsApp. 
                  You can opt out at any time by messaging us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">5. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website uses cookies to enhance your browsing experience, analyze site traffic, 
                  and personalize content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">6. Return & Refund Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We accept returns within 7 days of purchase for unused products in original packaging. 
                  Perfumes and personal care items can only be returned if sealed. Refunds are processed 
                  within 5-7 business days after inspection. Please contact us via WhatsApp or email 
                  to initiate a return.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">7. Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information. 
                  We do not sell, trade, or share your personal data with third parties except as 
                  necessary to fulfill orders (e.g., delivery partners).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li><strong>Email:</strong> info@alpenstore.com.ng</li>
                  <li><strong>Phone/WhatsApp:</strong> 09168877858</li>
                  <li><strong>Address:</strong> No CO8 Gwarzo Road, Along Kabuga, behind F.C.E, Kano.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
