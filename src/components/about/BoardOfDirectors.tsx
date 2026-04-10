const boardMembers = [
  {
    name: "Alhaji Yusuf Ibrahim",
    title: "Chief Operations Officer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    bio: "Oversees daily operations across all branches with premium service delivery.",
  },
  {
    name: "Hajiya Fatima Abdullahi",
    title: "Director of Finance",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=face",
    bio: "Manages financial strategy and sustainable growth with prudence.",
  },
  {
    name: "Malam Abubakar Sadiq",
    title: "Director of Procurement",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
    bio: "Sources authentic products from trusted suppliers across the Middle East.",
  },
  {
    name: "Hajiya Amina Bello",
    title: "Director of Marketing",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face",
    bio: "Drives brand growth and customer engagement across all channels.",
  },
  {
    name: "Alhaji Kabiru Danladi",
    title: "Director of Strategy",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
    bio: "Leads long-term planning and business expansion initiatives.",
  },
];

const BoardOfDirectors = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-alpen">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-luxury-gold font-semibold mb-3">
            Leadership
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-luxury-charcoal mb-4">
            Board of <span className="text-primary">Directors</span>
          </h2>
          <p className="text-luxury-slate">
            The experienced leaders steering ALPEN STORE LTD toward continued excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {boardMembers.map((member) => (
            <div
              key={member.name}
              className="group bg-card rounded-xl overflow-hidden shadow-soft border border-border hover:-translate-y-2 hover:shadow-card transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="font-serif text-lg font-bold text-luxury-charcoal mb-1">
                  {member.name}
                </h3>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-2">
                  {member.title}
                </p>
                <p className="text-sm text-luxury-slate leading-relaxed font-light">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardOfDirectors;
