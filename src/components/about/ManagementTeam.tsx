import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const staticMembers = [
  {
    name: "Alhaji Muhammad Suleiman",
    title: "Chief Executive Officer",
    image: "",
    bio: "Visionary founder leading ALPEN STORE LTD with over two decades of excellence.",
  },
  {
    name: "Yakubu Ibrahim",
    title: "Operations Manager",
    image: "",
    bio: "Ensures seamless day-to-day operations across all branches.",
  },
  {
    name: "Fatima Abubakar",
    title: "Sales Director",
    image: "",
    bio: "Drives revenue growth and builds lasting customer relationships.",
  },
  {
    name: "Suleiman Garba",
    title: "Procurement Manager",
    image: "",
    bio: "Sources premium authentic products from trusted global suppliers.",
  },
  {
    name: "Aisha Bello",
    title: "Marketing Manager",
    image: "",
    bio: "Leads brand strategy and digital marketing initiatives across all channels.",
  },
  {
    name: "Ibrahim Musa",
    title: "Finance Manager",
    image: "",
    bio: "Oversees financial planning, budgeting, and fiscal growth strategies.",
  },
];

const ManagementTeam = () => {
  const [dbMembers, setDbMembers] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("team_members")
      .select("*")
      .eq("section", "management")
      .order("display_order")
      .then(({ data }) => {
        if (data) setDbMembers(data);
      });
  }, []);

  const allMembers = [
    ...staticMembers.map((m) => ({ ...m, source: "static" })),
    ...dbMembers.map((m) => ({
      name: m.name,
      title: m.title || m.role || "",
      image: m.image_url || "",
      bio: m.bio || "",
      source: "db",
    })),
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-alpen">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-luxury-gold font-semibold mb-3">
            Leadership
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Our <span className="text-primary">Management Team</span>
          </h2>
          <p className="text-muted-foreground">
            Meet the leadership guiding our vision and growth.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allMembers.map((member) => (
            <div
              key={member.name}
              className="card-alpen p-6 text-center group hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                {member.image && <AvatarImage src={member.image} alt={member.name} />}
                <AvatarFallback className="text-lg font-serif bg-primary/10 text-primary">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-serif text-lg font-semibold mb-1">{member.name}</h3>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-3">
                {member.title}
              </p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManagementTeam;
