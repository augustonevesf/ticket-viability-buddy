import React from "react";
import { X, Plus, FileText, Loader2, Copy } from "lucide-react";
import { TicketSimulation } from "@/hooks/useTicketHistory";

interface Props {
  simulations: TicketSimulation[];
  loading: boolean;
  onLoad: (sim: TicketSimulation) => void;
  onNew: () => void;
  onDuplicate: (sim: TicketSimulation) => void;
  onClose: () => void;
}

export const TicketHistoryPanel: React.FC<Props> = ({ simulations, loading, onLoad, onNew, onDuplicate, onClose }) => {
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
              <div key={sim.id} className="text-left bg-muted/50 hover:bg-muted rounded-xl p-3 transition-colors border border-border/50">
                <button onClick={() => onLoad(sim)} className="w-full text-left">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
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
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(sim); }}
                  className="mt-2 flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors w-full justify-center"
                >
                  <Copy className="w-3 h-3" /> Duplicar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
