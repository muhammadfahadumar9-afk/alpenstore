import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Star, Sparkles } from "lucide-react";

const RamadanBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-alpen-950 via-alpen-900 to-alpen-950 py-12 md:py-16">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Crescent moon */}
        <div className="absolute top-4 right-8 md:right-16 text-amber-400/30">
          <Moon className="w-16 h-16 md:w-24 md:h-24 fill-current" />
        </div>
        
        {/* Stars scattered */}
        <Star className="absolute top-8 left-[10%] w-4 h-4 text-amber-300/40 fill-current animate-pulse" />
        <Star className="absolute top-16 left-[25%] w-3 h-3 text-amber-200/30 fill-current animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute bottom-12 left-[15%] w-5 h-5 text-amber-300/35 fill-current animate-pulse" style={{ animationDelay: '1s' }} />
        <Star className="absolute top-12 right-[30%] w-4 h-4 text-amber-200/40 fill-current animate-pulse" style={{ animationDelay: '0.3s' }} />
        <Star className="absolute bottom-8 right-[20%] w-3 h-3 text-amber-300/30 fill-current animate-pulse" style={{ animationDelay: '0.7s' }} />
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-amber-600/10 to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-600/10 to-transparent" />
      </div>
      
      <div className="container-alpen relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Text content */}
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Ramadan Special</span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight">
              Blessed Dates for
              <span className="block text-amber-400">Ramadan</span>
            </h2>
            
            <p className="text-alpen-100/80 text-base md:text-lg max-w-md mb-6">
              Break your fast with our premium selection of authentic Arabian dates. 
              From Ajwa to Medjool, experience the blessed tradition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button 
                asChild
                className="bg-amber-500 hover:bg-amber-600 text-alpen-950 font-semibold px-6"
              >
                <Link to="/shop?category=dates">
                  Shop Dates Collection
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-amber-400/50 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              >
                <Link to="/shop?category=dates">
                  View All Varieties
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">8+</div>
              <div className="text-alpen-100/70 text-sm">Premium Varieties</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">100%</div>
              <div className="text-alpen-100/70 text-sm">Authentic Quality</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">Fresh</div>
              <div className="text-alpen-100/70 text-sm">Direct Import</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">Gift</div>
              <div className="text-alpen-100/70 text-sm">Ready Packaging</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RamadanBanner;
