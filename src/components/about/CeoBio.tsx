import { AspectRatio } from "@/components/ui/aspect-ratio";

const CeoBio = () => {
  return (
    <section className="section-padding bg-luxury-cream">
      <div className="container-alpen">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Portrait with framed layer effect */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Gold border frame offset behind image */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 border-2 border-luxury-gold rounded-lg" />
              <div className="relative rounded-lg overflow-hidden shadow-card">
                <AspectRatio ratio={3 / 4}>
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&crop=face"
                    alt="CEO of ALPEN STORE LTD"
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            </div>
          </div>

          {/* Right Column - Bio Content */}
          <div className="bg-card rounded-xl p-8 md:p-10 border-l-[5px] border-luxury-gold shadow-soft">
            <p className="text-xs font-sans uppercase tracking-[0.25em] text-luxury-gold font-semibold mb-3">
              Founder &amp; CEO
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-luxury-charcoal mb-6">
              ALH. UMAR SALE
            </h2>
            <p className="text-sm text-muted-foreground mb-6">CEO, Alpen Store Limited</p>
            <div className="space-y-4 text-luxury-slate leading-relaxed antialiased">
              <p>
                With over two decades of experience in the retail and fragrance industry, Alhaji Umar Sale founded Alpen Store Limited with a clear vision: to make quality perfumes and lifestyle essentials accessible, while maintaining the highest standards of trust, authenticity, and customer experience.
              </p>
              <p>
                His journey began in Kano, Nigeria, where he built the foundation of the business from a single store in 2000. Through consistency, discipline, and a deep understanding of customer needs, he expanded Alpen into a growing retail brand with multiple branches, known for reliability and excellence.
              </p>
              <p>
                Today, he continues to guide the company's direction, ensuring that every product reflects quality, every space reflects cleanliness, and every customer interaction reflects respect and care.
              </p>
              <blockquote className="border-l-4 border-luxury-gold pl-4 py-2 italic text-luxury-charcoal mt-6">
                "We don't just sell perfumes; we deliver confidence, identity, and lasting impressions."
              </blockquote>
            </div>
            {/* Signature area */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="font-serif text-xl italic text-luxury-charcoal">
                Alhaji Umar Sale
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
                Founder &amp; CEO, Alpen Store Limited
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CeoBio;
