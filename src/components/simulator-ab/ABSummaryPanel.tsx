import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ABResults, ABInputs } from "@/hooks/useSimulatorAB";
import { AlertTriangle, FileDown, Save } from "lucide-react";
import { MCC_LABELS } from "@/data/mccTable";

type Status = ABResults["status"];

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatPercent = (v: number) => v.toFixed(2) + "%";

const statusConfig: Record<Status, { bg: string; text: string; label: string; frase: string; barColor: string }> = {
  "Negativo": { bg: "bg-black/10", text: "text-black dark:text-white", label: "💀 Negativo", frase: "Operação inviável", barColor: "bg-black" },
  "Ruim": { bg: "bg-[hsl(0,72%,51%)]/10", text: "text-[hsl(0,72%,51%)]", label: "🚨 Ruim", frase: "Precisa melhorar 🔎", barColor: "bg-[hsl(0,72%,51%)]" },
  "Atenção": { bg: "bg-[hsl(48,97%,53%)]/10", text: "text-[hsl(48,97%,53%)]", label: "⚠️ Atenção", frase: "Não vai ser fácil 💛", barColor: "bg-[hsl(48,97%,53%)]" },
  "Saudável": { bg: "bg-[hsl(217,91%,60%)]/10", text: "text-[hsl(217,91%,60%)]", label: "🎉 Saudável", frase: "Bom negócio 🎉", barColor: "bg-[hsl(217,91%,60%)]" },
  "Boa": { bg: "bg-[hsl(170,100%,22%)]/10", text: "text-[hsl(170,100%,22%)]", label: "💪 Boa", frase: "Joga junto 💪", barColor: "bg-[hsl(170,100%,22%)]" },
  "Excelente": { bg: "bg-[hsl(145,63%,42%)]/10", text: "text-[hsl(145,63%,42%)]", label: "🚀 Excelente", frase: "Rumo ao IPO 🚀", barColor: "bg-[hsl(145,63%,42%)]" },
};

const AnimatedValue: React.FC<{ value: string; className?: string }> = ({ value, className }) => (
  <AnimatePresence mode="wait">
    <motion.span key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className={className}>
      {value}
    </motion.span>
  </AnimatePresence>
);

const MetricRow: React.FC<{ label: string; value: string; muted?: boolean; bold?: boolean; destructive?: boolean; success?: boolean }> = ({
  label, value, muted, bold, destructive, success,
}) => {
  const lc = destructive ? "text-destructive" : success ? "text-success" : muted ? "text-muted-foreground" : bold ? "font-semibold text-foreground" : "text-foreground/80";
  const vc = destructive ? "text-destructive font-medium" : success ? "text-success font-medium" : muted ? "text-muted-foreground" : bold ? "font-bold text-foreground" : "font-medium text-foreground";
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={`text-sm ${lc}`}>{label}</span>
      <span className={`text-sm tabular-nums ${vc}`}>{value}</span>
    </div>
  );
};

interface Props {
  results: ABResults;
  inputs: ABInputs;
  onSave?: () => void;
  onExportPDF?: () => void;
  idViabilidade?: string;
}

export const ABSummaryPanel: React.FC<Props> = ({ results, inputs, onSave, onExportPDF, idViabilidade }) => {
  const cfg = statusConfig[results.status];
  const barPct = Math.max(0, Math.min(100, results.margem_estimada * (100 / 60)));
  const mccLabel = MCC_LABELS[inputs.cliente.mcc] || inputs.cliente.mcc;

  return (
    <div className="sticky top-6 space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          {idViabilidade ? "Atualizar" : "Salvar"}
        </button>
        <button
          onClick={onExportPDF}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>
      </div>

      {/* Client info */}
      {inputs.cliente.nome && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Cliente</p>
          <p className="text-sm font-semibold text-foreground">{inputs.cliente.nome}</p>
          <p className="text-xs text-muted-foreground mt-1">MCC: {mccLabel}</p>
          {inputs.cliente.comercial && (
            <>
              <p className="text-xs text-muted-foreground mt-1">Comercial</p>
              <p className="text-sm font-medium text-foreground">{inputs.cliente.comercial}</p>
            </>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {inputs.configuracao.tipo === "casa" ? "Casa" : "Evento"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {inputs.configuracao.cashless_ficha === "cashless" ? "Cashless" : "Ficha"}
            </span>
            {inputs.configuracao.antecipado_100 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">100% Antecipado</span>
            )}
          </div>
        </div>
      )}

      {results.alerta && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Margem baixa ou resultado negativo.</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide mb-1">Resultado Recorrente</p>
            <div className="text-4xl font-semibold tracking-tighter text-foreground tabular-nums">
              <AnimatedValue value={formatCurrency(results.resultado_recorrente)} />
            </div>
            <div className={`text-lg font-medium tabular-nums mt-1 ${cfg.text}`}>
              <AnimatedValue value={`Margem: ${formatPercent(results.margem_estimada)}`} className={cfg.text} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
            <p className={`text-[10px] italic ${cfg.text} text-center max-w-[140px] leading-tight`}>{cfg.frase}</p>
            <div className="w-2.5 h-24 bg-muted rounded-full overflow-hidden relative">
              <motion.div className={`absolute bottom-0 left-0 right-0 rounded-full ${cfg.barColor}`} animate={{ height: `${barPct}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Take Rate Recorrente</span>
            <span className="text-lg font-semibold tabular-nums text-primary">{formatPercent(results.take_rate_recorrente)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Take Rate 1º Mês</span>
            <span className="text-sm font-medium tabular-nums text-foreground">{formatPercent(results.take_rate_primeiro_mes)}</span>
          </div>
        </div>
      </div>

      {/* Faturamento Breakdown */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">Faturamento</h4>
        <div className="divide-y divide-border">
          <div className="pb-3">
            <MetricRow label="Faturamento Bruto" value={formatCurrency(results.faturamento_bruto)} bold />
            <MetricRow label="Dinheiro" value={formatCurrency(results.faturamento_dinheiro)} muted />
            <MetricRow label="Débito" value={formatCurrency(results.faturamento_debito)} muted />
            <MetricRow label="Pix" value={formatCurrency(results.faturamento_pix)} muted />
            <MetricRow label="Crédito" value={formatCurrency(results.faturamento_credito)} muted />
            {results.faturamento_app > 0 && <MetricRow label="App" value={formatCurrency(results.faturamento_app)} muted />}
            {results.faturamento_qr > 0 && <MetricRow label="QR Auto Atend." value={formatCurrency(results.faturamento_qr)} muted />}
          </div>
        </div>
      </div>

      {/* Receitas */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">Receitas</h4>
        <div className="divide-y divide-border">
          <div className="pb-3">
            <MetricRow label="Taxa ADM (Software)" value={formatCurrency(results.receita_taxa_adm)} success />
            <MetricRow label="Débito" value={formatCurrency(results.receita_debito)} success />
            <MetricRow label="Pix" value={formatCurrency(results.receita_pix)} success />
            <MetricRow label="Crédito" value={formatCurrency(results.receita_credito)} success />
            {results.receita_antecipacao > 0 && <MetricRow label="Antecipação" value={formatCurrency(results.receita_antecipacao)} success />}
            {results.receita_app > 0 && <MetricRow label="App" value={formatCurrency(results.receita_app)} success />}
            {results.receita_qr > 0 && <MetricRow label="QR Auto Atend." value={formatCurrency(results.receita_qr)} success />}
            <MetricRow label="Total Receita Taxas" value={formatCurrency(results.total_receita_taxas)} bold />
          </div>
          <div className="py-3">
            <MetricRow label="MG Calculado Mínimo" value={formatCurrency(results.mg_calculado_min)} muted />
            <MetricRow label="MG Calculado Máximo" value={formatCurrency(results.mg_calculado_max)} muted />
          </div>
          {results.total_receitas_diversas > 0 && (
            <div className="py-3">
              <MetricRow label="Receitas Diversas" value={formatCurrency(results.total_receitas_diversas)} success />
            </div>
          )}
          {results.total_receitas_setup > 0 && (
            <div className="py-3">
              <MetricRow label="Receitas Setup" value={formatCurrency(results.total_receitas_setup)} success />
            </div>
          )}
          <div className="pt-3">
            <MetricRow label="Total Geral Receitas" value={formatCurrency(results.total_geral_receitas)} bold />
          </div>
        </div>
      </div>

      {/* Custos & Redutores */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">Custos & Redutores</h4>
        <div className="divide-y divide-border">
          <div className="pb-3">
            {results.total_custos_equipamentos !== 0 && <MetricRow label="(−) Custos Equipamentos" value={formatCurrency(Math.abs(results.total_custos_equipamentos))} muted />}
            {results.total_custos_zig !== 0 && <MetricRow label="(−) Custos/Despesas Zig" value={formatCurrency(Math.abs(results.total_custos_zig))} muted />}
          </div>
          <div className="py-3">
            <MetricRow label="(−) Adquirência Débito" value={formatCurrency(results.custo_adq_debito)} muted />
            {results.custo_adq_credito_d30 > 0 && <MetricRow label="(−) Crédito D+30" value={formatCurrency(results.custo_adq_credito_d30)} muted />}
            {results.custo_adq_credito_d2 > 0 && <MetricRow label="(−) Crédito D+2" value={formatCurrency(results.custo_adq_credito_d2)} muted />}
            <MetricRow label="Total Adquirência" value={formatCurrency(Math.abs(results.total_custos_adquirencia))} bold />
          </div>
          <div className="py-3">
            <MetricRow label="(−) Impostos Setup (6,55%)" value={formatCurrency(results.impostos_setup)} muted />
            <MetricRow label="(−) Impostos Recorrente (6,55%)" value={formatCurrency(results.impostos_recorrente)} muted />
            <MetricRow label="Total Impostos" value={formatCurrency(Math.abs(results.total_impostos))} bold />
          </div>
          <div className="pt-3">
            <MetricRow label="Redutores Total" value={formatCurrency(Math.abs(results.redutores_total))} destructive />
          </div>
        </div>
      </div>

      {/* Fechamento */}
      <div className="bg-card rounded-2xl p-5 shadow-card border-l-4 border-primary">
        <h4 className="text-xs font-semibold text-primary tracking-wide mb-3">Fechamento</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-semibold text-foreground">Resultado Recorrente</span>
            <span className={`text-base font-bold tabular-nums ${cfg.text}`}>{formatCurrency(results.resultado_recorrente)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-semibold text-foreground">Resultado 1º Mês</span>
            <span className="text-base font-bold tabular-nums text-foreground">{formatCurrency(results.resultado_primeiro_mes)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Margem Estimada</span>
            <span className={`text-lg font-bold tabular-nums ${cfg.text}`}>{formatPercent(results.margem_estimada)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
