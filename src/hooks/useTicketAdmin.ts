import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CONSTANTS } from "@/hooks/useSimulator";

export interface TicketConstantsData {
  [key: string]: number;
}

export function useTicketAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [constants, setConstants] = useState<TicketConstantsData>({});
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
        .from("ticket_constants")
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

  const flatConstants: Record<string, number> = {};
  // Flatten CONSTANTS for admin editing
  flatConstants["imposto"] = CONSTANTS.imposto;
  flatConstants["comissao"] = CONSTANTS.comissao;
  flatConstants["custo_maquina"] = CONSTANTS.custo_maquina;
  flatConstants["custo_impressao_default"] = CONSTANTS.custo_impressao_default;
  flatConstants["lugar_marcado_seats_io"] = CONSTANTS.lugar_marcado_seats_io;
  flatConstants["parcelamento_receita"] = CONSTANTS.parcelamento_receita;
  flatConstants["parcelamento_custo_adquirencia_am"] = CONSTANTS.parcelamento_custo_adquirencia_am;
  flatConstants["adquirencia_online_credito"] = CONSTANTS.adquirencia_online.credito;
  flatConstants["adquirencia_online_debito_pix"] = CONSTANTS.adquirencia_online.debito_pix;
  flatConstants["adquirencia_offline_credito"] = CONSTANTS.adquirencia_offline.credito;
  flatConstants["adquirencia_offline_debito_pix"] = CONSTANTS.adquirencia_offline.debito_pix;
  flatConstants["online_custos_antifraude"] = CONSTANTS.online_custos.antifraude;
  flatConstants["online_custos_servidor"] = CONSTANTS.online_custos.servidor;

  const mergedConstants = { ...flatConstants, ...constants };

  const saveConstants = useCallback(async (newData: TicketConstantsData) => {
    if (!isAdmin || !user?.email) return;

    const { data: existing } = await supabase
      .from("ticket_constants")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("ticket_constants")
        .update({ data: newData as any, updated_by: user.email, updated_at: new Date().toISOString() })
        .eq("id", (existing as any).id);
    } else {
      await supabase
        .from("ticket_constants")
        .insert({ data: newData as any, updated_by: user.email, updated_at: new Date().toISOString() });
    }
    setConstants(newData);
    setLastUpdatedBy(user.email!);
    setLastUpdatedAt(new Date().toISOString());
  }, [isAdmin, user]);

  return { isAdmin, mergedConstants, flatConstants, saveConstants, lastUpdatedBy, lastUpdatedAt, loading };
}
