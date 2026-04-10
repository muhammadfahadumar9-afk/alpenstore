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
              Alhaji Muhammad Suleiman
            </h2>
            <div className="space-y-4 text-luxury-slate leading-relaxed antialiased">
              <p>
                With a lifelong passion for the art of Arabian perfumery and a deep commitment 
                to excellence, Alhaji Muhammad Suleiman founded ALPEN STORE LTD over a decade 
                ago with a singular vision: to bring the finest authentic fragrances and Islamic 
                wellness products to the people of Kano and beyond.
              </p>
              <p>
                Under his visionary leadership, the company has grown from a single storefront 
                into a respected multi-branch enterprise, earning the trust and loyalty of 
                thousands of customers across Northern Nigeria.
              </p>
              <p>
                His philosophy is simple — quality without compromise, honesty in every 
                transaction, and a relentless pursuit of customer satisfaction. Today, 
                ALPEN STORE LTD stands as a testament to that philosophy.
              </p>
            </div>
            {/* Signature area */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="font-serif text-xl italic text-luxury-charcoal">
                Alhaji M. Suleiman
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
                Founder &amp; Chief Executive Officer
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CeoBio;
