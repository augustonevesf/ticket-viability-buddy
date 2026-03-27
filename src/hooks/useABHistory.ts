import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ABInputs, ABResults } from "@/hooks/useSimulatorAB";

export interface ABSimulation {
  id: string;
  id_viabilidade: string;
  id_hub: string;
  id_proposta: string;
  user_email: string;
  client_name: string;
  inputs: ABInputs;
  results: ABResults;
  created_at: string;
  updated_at: string;
}

function generateViabilidadeId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VAB-${y}${m}${d}-${rand}`;
}

export function useABHistory() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<ABSimulation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSimulations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ab_simulations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setSimulations(data as any);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSimulations(); }, [fetchSimulations]);

  const saveSimulation = useCallback(async (
    inputs: ABInputs,
    results: ABResults,
    idHub: string,
    idProposta: string,
    existingId?: string,
  ): Promise<string | null> => {
    if (!user) return null;

    if (existingId) {
      await supabase
        .from("ab_simulations")
        .update({
          id_hub: idHub,
          id_proposta: idProposta,
          client_name: inputs.cliente.nome,
          inputs: inputs as any,
          results: results as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id_viabilidade", existingId);
      fetchSimulations();
      return existingId;
    }

    const idViabilidade = generateViabilidadeId();
    const { error } = await supabase
      .from("ab_simulations")
      .insert({
        id_viabilidade: idViabilidade,
        id_hub: idHub,
        id_proposta: idProposta,
        user_id: user.id,
        user_email: user.email || "",
        client_name: inputs.cliente.nome,
        inputs: inputs as any,
        results: results as any,
      });

    if (error) { console.error(error); return null; }
    fetchSimulations();
    return idViabilidade;
  }, [user, fetchSimulations]);

  return { simulations, loading, saveSimulation, fetchSimulations };
}
