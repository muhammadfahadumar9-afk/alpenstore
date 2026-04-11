import { MapPin } from "lucide-react";

const branches = [
  {
    name: "Head Office",
    address: "C18 Gwarzo Road, Kabuga, Kano",
    mapsUrl: "https://maps.google.com/?q=C18+Gwarzo+Road+Kabuga+Kano+Nigeria",
  },
  {
    name: "Branch 1",
    address: "Hajj Camp Market, Kano",
    mapsUrl: "https://maps.google.com/?q=Hajj+Camp+Market+Kano",
  },
  {
    name: "Branch 2",
    address: "Ado Bayero Mall, Kano",
    mapsUrl: "https://maps.google.com/?q=Ado+Bayero+Mall+Kano",
  },
  {
    name: "Branch 3",
    address: "Audu Baki Way, Kano",
    mapsUrl: "https://maps.google.com/?q=Audu+Baki+Way+Kano",
  },
];

const OurLocations = () => {
  return (
    <section className="section-padding bg-luxury-cream">
      <div className="container-alpen">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-luxury-charcoal">
            Our <span className="text-luxury-gold">Locations</span>
          </h2>
          <p className="text-luxury-slate">
            Visit any of our branches across Kano.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className="bg-background rounded-xl p-6 text-center border-2 border-transparent hover:border-luxury-gold/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-gold/10 text-luxury-gold mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-luxury-charcoal mb-1">
                {branch.name}
              </h3>
              <p className="text-sm text-luxury-slate mb-3">{branch.address}</p>
              <a
                href={branch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-luxury-gold hover:underline"
              >
                Open in Google Maps
              </a>
            </div>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden shadow-lg border border-luxury-gold/20">
          <iframe
            src="https://maps.google.com/maps?q=C18%20Gwarzo%20Road%20Kabuga%20Kano%20Nigeria&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="ALPEN STORE LTD Head Office Location"
          />
        </div>
      </div>
    </section>
  );
};

export default OurLocations;
