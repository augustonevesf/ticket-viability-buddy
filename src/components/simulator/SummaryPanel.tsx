import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulatorResults, DealStatus } from "@/hooks/useSimulator";
import { FileDown, FileSpreadsheet } from "lucide-react";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (v: number) =>
  (v * 100).toFixed(2) + "%";

const statusConfig: Record<DealStatus, { bg: string; text: string; border: string; label: string }> = {
  "Prejuízo": { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", label: "Prejuízo" },
  "Ruim": { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", label: "Ruim" },
  "Média": { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Média" },
  "Boa": { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Boa" },
};

const AnimatedValue: React.FC<{ value: string; className?: string }> = ({ value, className }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const MetricRow: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className={`text-sm ${muted ? "text-muted-foreground" : "text-secondary-foreground"}`}>{label}</span>
    <span className={`text-sm tabular-nums font-medium ${muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</span>
  </div>
);

interface ClientInfo {
  cnpj: string;
  executivo: string;
  faturamento_estimado: number;
  anual: boolean;
}

interface Props {
  results: SimulatorResults;
  clientInfo: ClientInfo;
}

export const SummaryPanel: React.FC<Props> = ({ results, clientInfo }) => {
  const cfg = statusConfig[results.status];
  const marginBarHeight = Math.max(0, Math.min(100, results.margem_percentual * 250));

  const handleExportPDF = async () => {
    const { exportPDF } = await import("@/utils/exportReport");
    exportPDF(results, clientInfo);
  };

  const handleExportCSV = () => {
    import("@/utils/exportReport").then(({ exportCSV }) => exportCSV(results, clientInfo));
  };

  return (
    <div className="sticky top-6 space-y-4">
      {/* Main Margin Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Margem Projetada</p>
            <div className="text-4xl font-semibold tracking-tighter text-foreground tabular-nums">
              <AnimatedValue value={formatCurrency(results.margem)} />
            </div>
            <div className={`text-lg font-medium tabular-nums mt-1 ${cfg.text}`}>
              <AnimatedValue value={formatPercent(results.margem_percentual)} className={cfg.text} />
            </div>
          </div>

          {/* Thermometer */}
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label}
            </span>
            <div className="w-3 h-24 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className={`absolute bottom-0 left-0 right-0 rounded-full ${results.margem_percentual < 0 ? "bg-destructive" : results.margem_percentual < 0.2 ? "bg-destructive" : results.margem_percentual < 0.4 ? "bg-warning" : "bg-success"}`}
                animate={{ height: `${marginBarHeight}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Take Rate</span>
            <span className="text-lg font-semibold tabular-nums text-primary">
              {formatPercent(results.take_rate)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Margem / TPV</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {formatPercent(results.margem_tpv)}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Demonstrativo</h4>
        <div className="divide-y divide-border">
          <div className="pb-3">
            <MetricRow label="TPV" value={formatCurrency(results.tpv)} />
            <MetricRow label="TPV Online" value={formatCurrency(results.tpv_online)} muted />
            <MetricRow label="TPV Offline (PDV)" value={formatCurrency(results.tpv_offline)} muted />
          </div>
          <div className="py-3">
            <MetricRow label="Receita Bruta" value={formatCurrency(results.receita_bruta)} />
            <MetricRow label="  Administrativa" value={formatCurrency(results.receita_administrativa)} muted />
            <MetricRow label="  Processamento" value={formatCurrency(results.receita_processamento)} muted />
            <MetricRow label="  PDV" value={formatCurrency(results.receita_pdv)} muted />
            {results.receita_produtor_pdv > 0 && (
              <MetricRow label="  Custo Produtor PDV" value={formatCurrency(results.receita_produtor_pdv)} muted />
            )}
          </div>
          <div className="py-3">
            <MetricRow label="(−) Rebate" value={formatCurrency(results.rebate_valor)} muted />
            <MetricRow label="(−) Impostos" value={formatCurrency(results.impostos_valor)} muted />
            <MetricRow label="Receita Líquida" value={formatCurrency(results.receita_liquida)} />
          </div>
          <div className="py-3">
            <MetricRow label="(−) Adquirência" value={formatCurrency(results.custo_adquirencia)} muted />
            <MetricRow label="(−) Antifraude" value={formatCurrency(results.custo_antifraude)} muted />
            <MetricRow label="(−) Comissão" value={formatCurrency(results.custo_comissao)} muted />
            <MetricRow label="(−) Servidor" value={formatCurrency(results.custo_servidor)} muted />
            <MetricRow label="(−) Máquinas" value={formatCurrency(results.custo_maquinas)} muted />
            {results.custo_advance > 0 && (
              <MetricRow label="(−) Advance" value={formatCurrency(results.custo_advance)} muted />
            )}
            {results.receita_advance > 0 && (
              <MetricRow label="(+) Receita Advance" value={formatCurrency(results.receita_advance)} muted />
            )}
            <MetricRow label="Custos Totais" value={formatCurrency(results.custos_totais)} />
          </div>
          <div className="pt-3">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm font-semibold text-foreground">Margem Final</span>
              <span className={`text-base font-bold tabular-nums ${cfg.text}`}>{formatCurrency(results.margem)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportPDF}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </button>
        <button
          onClick={handleExportCSV}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>
    </div>
  );
};
