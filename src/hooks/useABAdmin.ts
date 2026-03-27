import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AB_CONSTANTS } from "@/hooks/useSimulatorAB";

export interface ABConstantsData {
  [key: string]: number;
}

export function useABAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [constants, setConstants] = useState<ABConstantsData>({});
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setIsAdmin(false); setLoading(false); return; }
    
    const check = async () => {
      const { data } = await supabase
        .from("ab_admin_emails")
        .select("email")
        .eq("email", user.email!)
        .maybeSingle();
      setIsAdmin(!!data);
    };

    const loadConstants = async () => {
      const { data } = await supabase
        .from("ab_constants")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setConstants((data as any).data || {});
        setLastUpdatedBy((data as any).updated_by || null);
        setLastUpdatedAt((data as any).updated_at || null);
      }
      setLoading(false);
    };

    check();
    loadConstants();
  }, [user]);

  const mergedConstants = { ...AB_CONSTANTS, ...constants };

  const saveConstants = useCallback(async (newData: ABConstantsData) => {
    if (!isAdmin || !user?.email) return;

    const { data: existing } = await supabase
      .from("ab_constants")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("ab_constants")
        .update({ data: newData as any, updated_by: user.email, updated_at: new Date().toISOString() })
        .eq("id", (existing as any).id);
    } else {
      await supabase
        .from("ab_constants")
        .insert({ data: newData as any, updated_by: user.email, updated_at: new Date().toISOString() });
    }
    setConstants(newData);
    setLastUpdatedBy(user.email!);
    setLastUpdatedAt(new Date().toISOString());
  }, [isAdmin, user]);

  return { isAdmin, mergedConstants, constants, saveConstants, lastUpdatedBy, lastUpdatedAt, loading };
}
