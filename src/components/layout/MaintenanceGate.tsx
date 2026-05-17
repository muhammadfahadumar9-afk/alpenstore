import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

interface Settings {
  maintenance_mode: boolean;
  maintenance_message: string | null;
}

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    supabase
      .from("security_settings")
      .select("maintenance_mode, maintenance_message")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setSettings(data as Settings);
      });

    const channel = supabase
      .channel("security_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "security_settings" },
        (payload) => {
          if (active && payload.new) setSettings(payload.new as Settings);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const onAdminRoute = pathname.startsWith("/admin");

  if (settings?.maintenance_mode && !isAdmin && !onAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
        <div className="max-w-lg text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-serif">Under maintenance</h1>
          <p className="text-muted-foreground">
            {settings.maintenance_message ||
              "We are currently performing scheduled maintenance. Please check back shortly."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}