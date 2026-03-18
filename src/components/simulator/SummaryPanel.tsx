import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulatorResults, DealStatus } from "@/hooks/useSimulator";
import { FileDown, FileSpreadsheet, AlertTriangle } from "lucide-react";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (v: number) =>
  (v * 100).toFixed(2) + "%";

const statusConfig: Record<DealStatus, { bg: string; text: string; border: string; label: string }> = {
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

const MetricRow: React.FC<{ label: string; value: string; muted?: boolean; bold?: boolean }> = ({ label, value, muted, bold }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className={`text-sm ${muted ? "text-muted-foreground" : bold ? "font-semibold text-foreground" : "text-secondary-foreground"}`}>{label}</span>
    <span className={`text-sm tabular-nums ${muted ? "text-muted-foreground" : bold ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{value}</span>
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
  const barPct = Math.max(0, Math.min(100, results.margem_sobre_tpv * 10));

  const handleExportPDF = async () => {
    const { exportPDF } = await import("@/utils/exportReport");
    exportPDF(results, clientInfo);
  };

  const handleExportCSV = () => {
    import("@/utils/exportReport").then(({ exportCSV }) => exportCSV(results, clientInfo));
  };

  return (
    <div className="sticky top-6 space-y-4">
      {/* Alert */}
      {results.alerta && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Margem próxima de zero ou negativa. Revise as condições comerciais.</span>
        </div>
      )}

      {/* Main Margin Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Margem Final</p>
            <div className="text-4xl font-semibold tracking-tighter text-foreground tabular-nums">
              <AnimatedValue value={formatCurrency(results.margem_final)} />
            </div>
            <div className={`text-lg font-medium tabular-nums mt-1 ${cfg.text}`}>
              <AnimatedValue value={`${results.margem_sobre_tpv.toFixed(2)}% s/ TPV`} className={cfg.text} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label}
            </span>
            <div className="w-3 h-24 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className={`absolute bottom-0 left-0 right-0 rounded-full ${
                  results.margem_sobre_tpv < 4 ? "bg-destructive" : results.margem_sobre_tpv < 7 ? "bg-warning" : "bg-success"
                }`}
                animate={{ height: `${barPct}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Líquida</span>
            <span className="text-lg font-semibold tabular-nums text-primary">
              {formatPercent(results.taxa_liquida)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Margem / TPV</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {results.margem_sobre_tpv.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Absorvida suggestion */}
        {results.taxa_sugerida > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Taxa Absorvida — Sugestão</p>
            <div className="flex gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Mínima</span>
                <p className="text-sm font-semibold tabular-nums text-foreground">{formatPercent(results.taxa_minima_calculada)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Sugerida</span>
                <p className="text-sm font-semibold tabular-nums text-primary">{formatPercent(results.taxa_sugerida)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Demonstrativo</h4>
        <div className="divide-y divide-border">
          <div className="pb-3">
            <MetricRow label="TPV" value={formatCurrency(results.tpv)} bold />
            <MetricRow label="TPV Online" value={formatCurrency(results.tpv_online)} muted />
            <MetricRow label="TPV Offline" value={formatCurrency(results.tpv_offline)} muted />
          </div>
          <div className="py-3">
            <MetricRow label="Taxa Base → Líquida" value={formatPercent(results.taxa_liquida)} />
            <MetricRow label="Receita Take" value={formatCurrency(results.receita_take)} muted />
            {results.receita_minima > 0 && (
              <MetricRow label="Receita Mínima" value={formatCurrency(results.receita_minima)} muted />
            )}
            <MetricRow label="Receita Bruta" value={formatCurrency(results.receita_bruta)} bold />
          </div>
          <div className="py-3">
            <MetricRow label="(−) Impostos (6,55%)" value={formatCurrency(results.impostos_valor)} muted />
            <MetricRow label="Receita Líquida" value={formatCurrency(results.receita_liquida)} bold />
          </div>
          <div className="py-3">
            <MetricRow label="(−) Adquirência Online" value={formatCurrency(results.custo_adquirencia_online)} muted />
            <MetricRow label="(−) Adquirência Offline" value={formatCurrency(results.custo_adquirencia_offline)} muted />
            <MetricRow label="(−) Antifraude" value={formatCurrency(results.custo_antifraude)} muted />
            <MetricRow label="(−) Comissão" value={formatCurrency(results.custo_comissao)} muted />
            <MetricRow label="(−) Servidor" value={formatCurrency(results.custo_servidor)} muted />
            <MetricRow label="(−) Máquinas" value={formatCurrency(results.custo_maquinas)} muted />
            <MetricRow label="(−) Impressão" value={formatCurrency(results.custo_impressao)} muted />
            <MetricRow label="Custos Totais" value={formatCurrency(results.custos_totais)} bold />
          </div>
          <div className="py-3">
            <MetricRow label="Margem Operacional" value={formatCurrency(results.margem_operacional)} bold />
            {results.receita_advance > 0 && (
              <MetricRow label="(+) Receita Advance" value={formatCurrency(results.receita_advance)} muted />
            )}
          </div>
          <div className="pt-3">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm font-semibold text-foreground">Margem Final</span>
              <span className={`text-base font-bold tabular-nums ${cfg.text}`}>{formatCurrency(results.margem_final)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-muted-foreground">Margem / TPV</span>
              <span className={`text-sm font-semibold tabular-nums ${cfg.text}`}>{results.margem_sobre_tpv.toFixed(2)}%</span>
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
