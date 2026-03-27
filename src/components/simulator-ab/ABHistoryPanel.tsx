import React from "react";
import { X, Plus, FileText, Loader2 } from "lucide-react";
import { ABSimulation } from "@/hooks/useABHistory";

interface Props {
  simulations: ABSimulation[];
  loading: boolean;
  onLoad: (sim: ABSimulation) => void;
  onNew: () => void;
  onClose: () => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const ABHistoryPanel: React.FC<Props> = ({ simulations, loading, onLoad, onNew, onClose }) => {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Histórico de Simulações</h2>
          <div className="flex items-center gap-2">
            <button onClick={onNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nova
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : simulations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma simulação salva ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {simulations.map(sim => (
              <button
                key={sim.id}
                onClick={() => onLoad(sim)}
                className="text-left bg-muted/50 hover:bg-muted rounded-xl p-3 transition-colors border border-border/50"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{sim.client_name || "Sem nome"}</p>
                    <p className="text-[11px] text-primary font-mono">{sim.id_viabilidade}</p>
                    <div className="flex gap-2 mt-1">
                      {sim.id_hub && <span className="text-[10px] text-muted-foreground">Hub: {sim.id_hub}</span>}
                      {sim.id_proposta && <span className="text-[10px] text-muted-foreground">Prop: {sim.id_proposta}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(sim.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{sim.user_email}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
