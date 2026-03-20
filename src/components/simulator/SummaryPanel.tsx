import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulatorResults, SimulatorInputs, DealStatus } from "@/hooks/useSimulator";
import { FileDown, AlertTriangle, Lightbulb, X } from "lucide-react";
import { generateInsights, Insight } from "@/utils/generateInsights";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPercent = (v: number) =>
  (v * 100).toFixed(2) + "%";

const statusConfig: Record<DealStatus, { bg: string; text: string; label: string; frase: string; barColor: string }> = {
  "Negativo": { bg: "bg-black/10", text: "text-black dark:text-white", label: "💀 Negativo", frase: "Operação inviável", barColor: "bg-black" },
  "Ruim": { bg: "bg-[hsl(0,72%,51%)]/10", text: "text-[hsl(0,72%,51%)]", label: "🚨 Ruim", frase: "Prejuízo / crítico", barColor: "bg-[hsl(0,72%,51%)]" },
  "Atenção": { bg: "bg-[hsl(48,97%,53%)]/10", text: "text-[hsl(48,97%,53%)]", label: "⚠️ Atenção", frase: "Não vai ser fácil, mas vai valer a pena 💛", barColor: "bg-[hsl(48,97%,53%)]" },
  "Saudável": { bg: "bg-[hsl(217,91%,60%)]/10", text: "text-[hsl(217,91%,60%)]", label: "🎉 Saudável", frase: "A festa não para 🎉", barColor: "bg-[hsl(217,91%,60%)]" },
  "Boa": { bg: "bg-[hsl(170,100%,22%)]/10", text: "text-[hsl(170,100%,22%)]", label: "💪 Boa", frase: "Joga junto pra ganhar o jogo 💪", barColor: "bg-[hsl(170,100%,22%)]" },
  "Excelente": { bg: "bg-[hsl(110,100%,56%)]/10", text: "text-[hsl(110,100%,56%)]", label: "🚀 Excelente", frase: "Rumo ao IPO 🚀", barColor: "bg-[hsl(110,100%,56%)]" },
};

const AnimatedValue: React.FC<{ value: string; className?: string }> = ({ value, className }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className={className}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const MetricRow: React.FC<{ label: string; value: string; muted?: boolean; bold?: boolean; destructive?: boolean; success?: boolean }> = ({ label, value, muted, bold, destructive, success }) => {
  const labelClass = destructive ? "text-destructive" : success ? "text-success" : muted ? "text-muted-foreground" : bold ? "font-semibold text-foreground" : "text-foreground/80";
  const valueClass = destructive ? "text-destructive font-medium" : success ? "text-success font-medium" : muted ? "text-muted-foreground" : bold ? "font-bold text-foreground" : "font-medium text-foreground";
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={`text-sm ${labelClass}`}>{label}</span>
      <span className={`text-sm tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
};

interface Props {
  results: SimulatorResults;
  inputs: SimulatorInputs;
  clienteName?: string;
  executivoName?: string;
  tipoContrato?: "pontual" | "anual";
  tempoContrato?: number;
  exclusividade?: boolean;
  taxaAdministrativa?: number;
}

export const SummaryPanel: React.FC<Props> = ({ results, inputs, clienteName, executivoName, tipoContrato, tempoContrato, exclusividade, taxaAdministrativa }) => {
  const [showInsights, setShowInsights] = useState(false);
  const cfg = { ...statusConfig[results.status] };

  // Se tem produtos extras que aumentam margem, troca a frase
  const temProdutosExtras = inputs.taxa.taxa_processamento > 0 || inputs.taxa.taxa_antecipacao > 0;
  if (temProdutosExtras && (results.status === "Boa" || results.status === "Excelente")) {
    cfg.frase = "Ouse sonhar, ouse inovar! 🌟";
  }
  const barPct = Math.max(0, Math.min(100, results.margem_sobre_tpv * (100 / 10)));
  const pdv = results.pdv;

  const regiao = taxaAdministrativa !== undefined && taxaAdministrativa <= 0.10 ? "RJ (Lei 6.103/2011)" : "Brasil";

  const camposObrigatorios = [
    { campo: "Nome do Cliente", valido: !!inputs.cliente.nome.trim() },
    { campo: "CNPJ ou CPF", valido: !!inputs.cliente.cnpj.trim() },
    { campo: "Nome do Executivo", valido: !!inputs.cliente.executivo.trim() },
    { campo: "Tipo de Contrato", valido: !!inputs.cliente.tipo },
    { campo: "Tempo de Contrato", valido: inputs.cliente.tempo_contrato > 0 },
  ];
  const camposFaltando = camposObrigatorios.filter((c) => !c.valido);
  const podeExportar = camposFaltando.length === 0;

  const handleExportPDF = async () => {
    if (!podeExportar) return;
    const { exportPDF } = await import("@/utils/exportReport");
    exportPDF(results, inputs, regiao);
  };

  return (
    <div className="sticky top-6 space-y-4">
      {clienteName && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Cliente</p>
          <p className="text-sm font-semibold text-foreground">{clienteName}</p>
          {executivoName && (
            <>
              <p className="text-xs text-muted-foreground mt-1">Executivo</p>
              <p className="text-sm font-medium text-foreground">{executivoName}</p>
            </>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {tipoContrato && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tipoContrato === "pontual" ? "Evento Pontual" : "Agência Anual"}
              </span>
            )}
            {tempoContrato !== undefined && tempoContrato > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {tempoContrato} {tempoContrato === 1 ? "mês" : "meses"}
              </span>
            )}
            {exclusividade && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Exclusividade
              </span>
            )}
          </div>
        </div>
      )}

      {results.alerta && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Margem próxima de zero ou negativa.</span>
        </div>
      )}

      {/* Main Margin Card */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground tracking-wide mb-1">Margem Final</p>
            <div className="text-4xl font-semibold tracking-tighter text-foreground tabular-nums">
              <AnimatedValue value={formatCurrency(results.margem)} />
            </div>
            <div className={`text-lg font-medium tabular-nums mt-1 ${cfg.text}`}>
              <AnimatedValue value={`${results.margem_sobre_tpv.toFixed(2)}% s/ TPV`} className={cfg.text} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
            <p className={`text-[10px] italic ${cfg.text} text-center max-w-[140px] leading-tight`}>
              {cfg.frase}
            </p>
            <div className="w-2.5 h-24 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className={`absolute bottom-0 left-0 right-0 rounded-full ${
                  results.margem_sobre_tpv < 3 ? "bg-warning" : results.margem_sobre_tpv < 5 ? "bg-blue-500" : results.margem_sobre_tpv < 7 ? "bg-success" : "bg-purple-500"
                }`}
                animate={{ height: `${barPct}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Taxa Adm. Plataforma</span>
            <span className="text-lg font-semibold tabular-nums text-primary">
              {formatPercent(results.taxa_liquida)}
            </span>
          </div>
          {results.rebate_valor > 0 && (
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-destructive">Rebate concedido</span>
              <span className="text-xs font-medium tabular-nums text-destructive">{formatCurrency(results.rebate_valor)}</span>
            </div>
          )}
          {results.ticket_medio > 0 && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs font-medium text-muted-foreground tracking-wide">Ticket Médio</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(results.ticket_medio)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Online Breakdown */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">Demonstrativo Online</h4>
        <div className="divide-y divide-border">
          <div className="pb-3">
            <MetricRow label="TPV" value={formatCurrency(results.tpv)} bold />
            <MetricRow label="TPV Online" value={formatCurrency(results.tpv_online)} muted />
            <MetricRow label="TPV Offline" value={formatCurrency(results.tpv_offline)} muted />
          </div>
          <div className="py-3">
            <MetricRow label="Taxa Adm. Plataforma (após rebate)" value={formatPercent(results.taxa_liquida)} />
            {results.rebate_valor > 0 && (
              <MetricRow label="(−) Rebate concedido" value={formatCurrency(results.rebate_valor)} destructive />
            )}
            <MetricRow label="Receita Take" value={formatCurrency(results.receita_take)} success />
            {results.receita_antecipacao > 0 && (
              <MetricRow label="(+) Receita Antecipação" value={formatCurrency(results.receita_antecipacao)} success />
            )}
            {results.receita_processamento > 0 && (
              <MetricRow label="(+) Processamento (crédito online)" value={formatCurrency(results.receita_processamento)} success />
            )}
            {results.receita_minima > 0 && (
              <MetricRow label="Receita Mínima (MG Ingresso)" value={formatCurrency(results.receita_minima)} success />
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
            <MetricRow label="(−) Impressão" value={formatCurrency(results.custo_impressao)} muted />
            <MetricRow label="Custos Totais" value={formatCurrency(results.custos_totais)} bold />
          </div>
          {(results.advance_receita_juros > 0 || results.patrocinio_valor > 0 || results.pulse_pago_valor > 0 || results.suporte_premium_receita > 0) && (
            <div className="py-3">
              {results.advance_receita_juros > 0 && (
                <MetricRow label="(+) Advance — Juros" value={formatCurrency(results.advance_receita_juros)} success />
              )}
              {results.pulse_pago_valor > 0 && (
                <MetricRow label="(+) Zig Pulse Pago" value={formatCurrency(results.pulse_pago_valor)} success />
              )}
              {results.suporte_premium_receita > 0 && (
                <MetricRow label="(+) Suporte Premium Tickets" value={formatCurrency(results.suporte_premium_receita)} success />
              )}
              {results.patrocinio_valor > 0 && (
                <MetricRow label="(−) Patrocínio" value={formatCurrency(results.patrocinio_valor)} destructive />
              )}
            </div>
          )}
          <div className="pt-3">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm font-semibold text-foreground">Margem Online</span>
              <span className={`text-base font-bold tabular-nums ${cfg.text}`}>{formatCurrency(results.margem)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PDV Breakdown */}
      {pdv.tpv_total > 0 && (
        <div className="bg-card rounded-2xl p-5 shadow-card border-l-4 border-primary">
          <h4 className="text-xs font-semibold text-primary tracking-wide mb-3">Demonstrativo PDV</h4>
          <div className="divide-y divide-border">
            <div className="pb-3">
              <MetricRow label="TPV Total PDV" value={formatCurrency(pdv.tpv_total)} bold />
              <MetricRow label="Crédito (70%)" value={formatCurrency(pdv.tpv_credito)} muted />
              <MetricRow label="Débito/Pix (30%)" value={formatCurrency(pdv.tpv_debito_pix)} muted />
            </div>
            <div className="py-3">
              <MetricRow label="Receita Crédito" value={formatCurrency(pdv.receita_credito)} success />
              <MetricRow label="Receita Débito/Pix" value={formatCurrency(pdv.receita_debito_pix)} success />
              <MetricRow label="Receita Total Zig" value={formatCurrency(pdv.receita_total)} bold />
            </div>
            <div className="py-3">
              <MetricRow label="(−) Impressão" value={formatCurrency(pdv.custo_impressao)} muted />
              <MetricRow label="(−) Máquinas" value={formatCurrency(pdv.custo_maquinas)} muted />
              <MetricRow label="Receita Líq. Operacional" value={formatCurrency(pdv.receita_liquida_operacional)} bold />
            </div>
            <div className="pt-3">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm font-semibold text-foreground">Resultado Final PDV</span>
                <span className="text-base font-bold tabular-nums text-primary">{formatCurrency(pdv.receita_liquida_operacional)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-5 shadow-card border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  Insights para vender mais
                </h4>
                <button onClick={() => setShowInsights(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                {generateInsights(inputs, results).map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <span className="text-lg flex-shrink-0">{insight.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{insight.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          insight.impact === "alto" ? "bg-destructive/10 text-destructive" :
                          insight.impact === "medio" ? "bg-warning/10 text-warning" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </motion.div>
                ))}
                {generateInsights(inputs, results).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    ✅ Nenhuma sugestão no momento. A operação está bem configurada!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="flex items-center justify-center gap-2 bg-warning/10 text-warning border border-warning/20 rounded-xl px-4 py-3 text-sm font-medium hover:bg-warning/20 transition-colors active:scale-[0.97]"
        >
          <Lightbulb className="w-4 h-4" />
          Insight
        </button>
        <button
          onClick={handleExportPDF}
          disabled={!podeExportar}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
            podeExportar
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          }`}
          title={!podeExportar ? `Preencha: ${camposFaltando.map(c => c.campo).join(", ")}` : ""}
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
      {!podeExportar && (
        <p className="text-xs text-destructive mt-1">
          Campos obrigatórios: {camposFaltando.map(c => c.campo).join(", ")}
        </p>
      )}

    </div>
  );
};
