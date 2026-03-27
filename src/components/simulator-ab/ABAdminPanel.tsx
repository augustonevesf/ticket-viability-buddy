import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { AB_CONSTANTS } from "@/hooks/useSimulatorAB";
import { ABConstantsData } from "@/hooks/useABAdmin";
import { toast } from "sonner";

interface Props {
  mergedConstants: Record<string, number>;
  onSave: (data: ABConstantsData) => Promise<void>;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
  onClose: () => void;
}

const LABELS: Record<string, string> = {
  imposto: "Imposto (%)",
  deprec_pdv: "Deprec. PDV (meses)",
  deprec_totem_grande: "Deprec. Totem Grande (meses)",
  deprec_totem_medio: "Deprec. Totem Médio (meses)",
  deprec_totem_preto: "Deprec. Totem Preto (meses)",
  deprec_cartao: "Deprec. Cartão (meses)",
  custo_cartao_cipurse: "Custo Cartão Cipurse (R$)",
  custo_cartao_mifare: "Custo Cartão Mifare (R$)",
  valor_smartpos_mensal_casa: "SmartPOS Mensal Casa (R$)",
  valor_smartpos_mensal_evento: "SmartPOS Mensal Evento (R$)",
  valor_pdv_mensal: "PDV Mensal (R$)",
  valor_internet_4g: "Internet 4G (R$)",
  valor_totem_grande_mensal: "Totem Grande Mensal (R$)",
  valor_totem_medio_mensal: "Totem Médio Mensal (R$)",
  valor_totem_preto_mensal: "Totem Preto Mensal (R$)",
  setup_smart: "Setup Smart (R$)",
  setup_pdv: "Setup PDV (R$)",
};

export const ABAdminPanel: React.FC<Props> = ({ mergedConstants, onSave, lastUpdatedBy, lastUpdatedAt, onClose }) => {
  const [edited, setEdited] = useState<ABConstantsData>(() => {
    const overrides: ABConstantsData = {};
    for (const key of Object.keys(AB_CONSTANTS)) {
      if (mergedConstants[key] !== (AB_CONSTANTS as any)[key]) {
        overrides[key] = mergedConstants[key];
      }
    }
    return overrides;
  });

  const [localValues, setLocalValues] = useState<Record<string, number>>({ ...mergedConstants });

  const handleChange = (key: string, val: number) => {
    setLocalValues(prev => ({ ...prev, [key]: val }));
    if (val !== (AB_CONSTANTS as any)[key]) {
      setEdited(prev => ({ ...prev, [key]: val }));
    } else {
      setEdited(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = async () => {
    await onSave(edited);
    toast.success("Constantes salvas com sucesso!");
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">⚙️ Painel Administrador — Constantes</h2>
            {lastUpdatedBy && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Última alteração por {lastUpdatedBy} em {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString("pt-BR") : "—"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              <Save className="w-3.5 h-3.5" /> Salvar
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.keys(AB_CONSTANTS).map(key => {
            const defaultVal = (AB_CONSTANTS as any)[key];
            const isOverridden = edited[key] !== undefined;
            return (
              <div key={key} className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium tracking-wide ${isOverridden ? "text-primary" : "text-muted-foreground"}`}>
                  {LABELS[key] || key}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={localValues[key] ?? defaultVal}
                    onChange={e => handleChange(key, parseFloat(e.target.value) || 0)}
                    className={`w-full rounded-lg px-3 py-2 text-sm tabular-nums outline-none border transition-all focus:ring-2 focus:ring-primary/20
                      ${isOverridden ? "border-primary/50 bg-primary/5 text-foreground font-medium" : "border-border bg-muted text-foreground"}`}
                  />
                  {isOverridden && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-primary font-semibold">EDITADO</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/60">Padrão: {defaultVal}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
