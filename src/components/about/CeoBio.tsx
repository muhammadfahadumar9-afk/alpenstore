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
                    src="https://spmnuwaeesqszsxklyxn.supabase.co/storage/v1/object/public/page-images/ceo/saluhu-ceo.jpg"
                    alt="Alhaji Umar Sale, CEO of ALPEN STORE LTD"
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            </div>
          </div>

          {/* Right Column - Bio Content */}
          <div className="bg-card rounded-xl p-8 md:p-10 border-l-[5px] border-luxury-gold shadow-soft">
            <p className="text-xs font-sans uppercase tracking-[0.25em] text-luxury-gold font-semibold mb-3">
              Message from the CEO
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-luxury-charcoal mb-6">
              ALH. UMAR SALE
            </h2>
            <p className="text-sm text-muted-foreground mb-6">CEO, Alpen Store Limited</p>
            <div className="space-y-4 text-luxury-slate leading-relaxed antialiased">
              <blockquote className="border-l-4 border-luxury-gold pl-4 py-2 italic text-luxury-charcoal">
                "At Alpen Store Limited, we are driven by a commitment to excellence, integrity, and continuous growth. What started as a single store has grown into a trusted brand because of our dedication to quality and our respect for the people we serve.
              </blockquote>
              <blockquote className="border-l-4 border-luxury-gold pl-4 py-2 italic text-luxury-charcoal">
                We remain focused on delivering value to our customers, empowering our team, and contributing positively to our community. Our vision is to build Alpen into a globally recognized brand while staying true to our core principles."
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
