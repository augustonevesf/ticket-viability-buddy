import React, { useState } from "react";
import { SimulatorInputs, CONSTANTS } from "@/hooks/useSimulator";
import { SimulatorInput, SimulatorToggle, SimulatorTextInput } from "./SimulatorInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import copacabanaPattern from "@/assets/copacabana-pattern.png";

interface Props {
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; accent?: boolean }> = ({ title, children, accent }) => (
  <div className={`bg-card rounded-2xl p-5 shadow-card ${accent ? "border-l-4 border-primary" : ""}`}>
    <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

const ReadOnly: React.FC<{ label: React.ReactNode; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-muted-foreground tracking-wide">{label}</span>
    <div className="bg-muted rounded-xl px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
      {value}
    </div>
  </div>
);

const ConstRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium tabular-nums">{value}</span>
  </div>
);

export const InputSections: React.FC<Props> = ({ inputs, setInputs }) => {
  const PDV_DEFAULTS = {
    taxa_credito: 0.0341,
    taxa_debito_pix: 0.0199,
    custo_impressao_ingresso: 1.00,
    custo_impressao_cortesia: 1.00,
    custo_cancelamento: 0.50,
  };

  const [pdvDefaults, setPdvDefaults] = useState(false);

  const isDefault = (field: keyof typeof PDV_DEFAULTS) =>
    pdvDefaults && Math.abs(inputs.pdv[field] - PDV_DEFAULTS[field]) < 0.0001;

  const pdvVariant = (field: keyof typeof PDV_DEFAULTS): "green" | "edited" | "default" =>
    pdvDefaults ? (isDefault(field) ? "green" : "edited") : "default";

  const upd = <K extends "cliente" | "evento" | "distribuicao" | "taxa" | "pdv" | "extras">(section: K) =>
    <F extends keyof SimulatorInputs[K]>(field: F) =>
      (val: SimulatorInputs[K][F]) =>
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const updRoot = <K extends keyof SimulatorInputs>(key: K) =>
    (val: SimulatorInputs[K]) =>
      setInputs((prev) => ({ ...prev, [key]: val }));

  const C = CONSTANTS;
  const offline_percent = 1 - inputs.distribuicao.online_percent;
  const is100Online = inputs.distribuicao.online_percent >= 1;
  const ticket_medio = inputs.evento.publico_estimado > 0
    ? inputs.evento.tpv_total / inputs.evento.publico_estimado
    : 0;

  return (
    <div className="flex flex-col gap-4">

      {/* BLOCO 1 — Cliente / Produtora */}
      <SectionCard title="Cliente / Produtora">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimulatorTextInput
            label="Nome do Cliente *"
            value={inputs.cliente.nome}
            onChange={(v) => upd("cliente")("nome")(v)}
            placeholder="Nome obrigatório"
          />
          <SimulatorTextInput
            label="CNPJ ou CPF"
            value={inputs.cliente.cnpj}
            onChange={(v) => {
              const digits = v.replace(/\D/g, "").slice(0, 14);
              let formatted = digits;
              if (digits.length <= 11) {
                // CPF: 000.000.000-00
                formatted = digits
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
              } else {
                // CNPJ: 00.000.000/0000-00
                formatted = digits
                  .replace(/(\d{2})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d)/, "$1/$2")
                  .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
              }
              upd("cliente")("cnpj")(formatted);
            }}
          />
          <SimulatorTextInput
            label="Nome do Executivo"
            value={inputs.cliente.executivo}
            onChange={(v) => upd("cliente")("executivo")(v)}
            placeholder="Responsável"
          />
        </div>
        {/* Tipo + Contrato + Exclusividade */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => { upd("cliente")("tipo")("pontual"); upd("cliente")("exclusividade")(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                inputs.cliente.tipo === "pontual"
                  ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                  : "bg-muted text-muted-foreground scale-100"
              }`}
            >
              Evento Pontual
            </button>
            <button
              onClick={() => upd("cliente")("tipo")("anual")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                inputs.cliente.tipo === "anual"
                  ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                  : "bg-muted text-muted-foreground scale-100"
              }`}
            >
              Agência Anual
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SimulatorInput
              label="Tempo de Contrato (meses)"
              value={inputs.cliente.tempo_contrato}
              onChange={(v) => upd("cliente")("tempo_contrato")(v)}
              min={0}
              allowEmpty
            />
          </div>

          {inputs.cliente.tipo === "anual" && (
            <div className="mt-4">
              <SimulatorToggle
                label="Exclusividade"
                checked={inputs.cliente.exclusividade}
                onChange={(v) => upd("cliente")("exclusividade")(v)}
              />
            </div>
          )}
        </div>
      </SectionCard>

      {/* BLOCO 2 — Informações Básicas */}
      <SectionCard title={inputs.cliente.tipo === "anual" ? "Informações Básicas Agência" : "Informações Básicas Evento"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorInput label="TPV Estimado Online" value={inputs.evento.tpv_total} onChange={(v) => upd("evento")("tpv_total")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="TPV Estimado PDV" value={inputs.pdv.tpv_pdv} onChange={(v) => upd("pdv")("tpv_pdv")(v)} prefix="R$" min={0} allowEmpty />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <SimulatorInput
            label={inputs.cliente.tipo === "anual" ? "Público Anual Estimado" : "Público Estimado Evento"}
            value={inputs.evento.publico_estimado}
            onChange={(v) => upd("evento")("publico_estimado")(v)}
            min={0}
            allowEmpty
          />
        </div>
        {inputs.cliente.tipo === "pontual" && inputs.evento.tpv_total > 0 && inputs.evento.publico_estimado > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <ReadOnly
              label="Ticket Médio (calculado)"
              value={`R$ ${ticket_medio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </div>
        )}
      </SectionCard>

      {/* BLOCO 3 — Distribuição */}
      <SectionCard title="Distribuição de Vendas">
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Online" value={+(inputs.distribuicao.online_percent * 100).toFixed(2)} onChange={(v) => upd("distribuicao")("online_percent")(Math.min(100, Math.max(0, v)) / 100)} suffix="%" step={0.1} min={0} max={100} />
          <ReadOnly label="PDV (auto)" value={`${(offline_percent * 100).toFixed(2)}%`} />
        </div>
      </SectionCard>

      {/* BLOCO 4 — Negociação Ingresso */}
      <SectionCard title="Negociação Ingresso">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Região:</span>
          <button
            onClick={() => upd("taxa")("regiao")("brasil" as any)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
              inputs.taxa.regiao === "brasil"
                ? "bg-gradient-to-r from-green-500 via-yellow-400 to-green-500 text-blue-900 border-green-600/30 scale-110 shadow-sm"
                : "bg-muted text-muted-foreground/40 border-border scale-90 opacity-50"
            }`}
          >
            🇧🇷 Brasil
          </button>
          <button
            onClick={() => {
              upd("taxa")("regiao")("rj" as any);
              if (inputs.taxa.taxa_administrativa > 0.10) {
                upd("taxa")("taxa_administrativa")(0.10);
              }
            }}
            className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border overflow-hidden ${
              inputs.taxa.regiao === "rj"
                ? "text-white border-stone-900 shadow-lg scale-110 ring-1 ring-stone-700"
                : "text-muted-foreground/40 border-border scale-90 opacity-50"
            }`}
            title="Lei Estadual 6.103/2011 — taxa máxima de 10%"
            style={{
              backgroundImage: `url(${copacabanaPattern})`,
              backgroundSize: "80px",
              backgroundRepeat: "repeat",
            }}
          >
            <span className={`relative z-10 px-1.5 py-0.5 rounded font-extrabold ${inputs.taxa.regiao === "rj" ? "bg-black/80 text-white" : "bg-black/70 text-white"}`}>
              🏖️ RJ — MÁX 10%
            </span>
          </button>
          {inputs.taxa.regiao === "rj" && (
            <span className="text-[10px] text-muted-foreground/60 max-w-xs leading-tight">
              🏖️ Taxa travada em 10% — Lei 6.103/2011. Negocie processamento ou antecipação para aumentar receita.
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorInput label="Taxa Administrativa" value={+(inputs.taxa.taxa_administrativa * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_administrativa")(inputs.taxa.regiao === "rj" ? Math.min(v, 10) / 100 : v / 100)} suffix="%" step={0.1} min={0} max={inputs.taxa.regiao === "rj" ? 10 : undefined} />
          <SimulatorInput label="Rebate (cashback produtor)" value={+(inputs.taxa.rebate * 100).toFixed(2)} onChange={(v) => upd("taxa")("rebate")(v / 100)} suffix="%" step={0.1} min={0} max={+(inputs.taxa.taxa_administrativa * 100).toFixed(2)} />
        </div>
        {inputs.taxa.rebate > 0 && (
          <p className="text-xs text-destructive mt-2 font-medium">
            ⚠ Taxa líquida após rebate: {((inputs.taxa.taxa_administrativa - inputs.taxa.rebate) * 100).toFixed(2)}%
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <SimulatorInput label="Taxa de Antecipação" value={+(inputs.taxa.taxa_antecipacao * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_antecipacao")(v / 100)} suffix="%" step={0.1} min={0} />
          <SimulatorInput label="Taxa de Processamento" value={+(inputs.taxa.taxa_processamento * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_processamento")(v / 100)} suffix="%" step={0.1} min={0} />
        </div>
        {inputs.taxa.taxa_processamento > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            ℹ️ Processamento incide apenas sobre compras em <span className="font-semibold text-foreground">crédito à vista e parcelado online</span>. Não considera crédito PDV.
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-border">
          <SimulatorInput label="Valor Taxa Mínima" value={inputs.taxa.valor_taxa_minima} onChange={(v) => upd("taxa")("valor_taxa_minima")(v)} prefix="R$" step={0.1} min={0} />
          <p className="text-xs text-muted-foreground mt-2">
            Aplicada automaticamente quando ticket médio {"<"} R$ 25,00.
          </p>
          {ticket_medio > 0 && ticket_medio < 25 && (
            <p className="text-xs text-warning mt-1 font-medium">
              ⚠ Ticket médio atual: R$ {ticket_medio.toFixed(2)} — taxa mínima será aplicada
            </p>
          )}
        </div>
      </SectionCard>

      {/* ═══════════════════ VENDAS FÍSICAS — PDV ═══════════════════ */}
      {is100Online ? (
        <div className="mt-2 bg-muted/50 rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground">Vendas físicas desabilitadas — distribuição 100% online.</p>
        </div>
      ) : (
        <>
          <div className="mt-2">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Vendas Físicas — PDV</h2>
          </div>

          <SectionCard title="Volume Financeiro (PDV)" accent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimulatorInput label="Qtd. Máquinas Físicas" value={inputs.pdv.quantidade_maquinas} onChange={(v) => upd("pdv")("quantidade_maquinas")(v)} min={0} allowEmpty />
              <SimulatorInput label="Ingressos Emitidos (Esperados)" value={inputs.pdv.ingressos_esperados} onChange={(v) => upd("pdv")("ingressos_esperados")(v)} min={0} allowEmpty />
            </div>
            {inputs.pdv.tpv_pdv > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-4">
                <ReadOnly
                  label={
                    <span className="inline-flex items-center gap-1">
                      Crédito (70%)
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            Premissa de mercado: ~70% das transações presenciais em eventos são via crédito.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  }
                  value={`R$ ${(inputs.pdv.tpv_pdv * 0.70).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                />
                <ReadOnly
                  label={
                    <span className="inline-flex items-center gap-1">
                      Débito/Pix (30%)
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            Premissa de mercado: ~30% das transações presenciais são via débito ou Pix.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  }
                  value={`R$ ${(inputs.pdv.tpv_pdv * 0.30).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Taxas — Receita Zig (PDV)" accent>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => upd("pdv")("taxa_segmentada")(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  inputs.pdv.taxa_segmentada
                    ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                    : "bg-muted text-muted-foreground scale-100"
                }`}
              >
                Taxa Segmentada
              </button>
              <button
                onClick={() => { upd("pdv")("taxa_segmentada")(false); setPdvDefaults(false); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !inputs.pdv.taxa_segmentada
                    ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                    : "bg-muted text-muted-foreground scale-100"
                }`}
              >
                Taxa Única
              </button>
            </div>
            {inputs.pdv.taxa_segmentada && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setPdvDefaults(true);
                    setInputs((prev) => ({
                      ...prev,
                      pdv: {
                        ...prev.pdv,
                        taxa_segmentada: true,
                        taxa_credito: PDV_DEFAULTS.taxa_credito,
                        taxa_debito_pix: PDV_DEFAULTS.taxa_debito_pix,
                        custo_impressao_ingresso: PDV_DEFAULTS.custo_impressao_ingresso,
                        custo_impressao_cortesia: PDV_DEFAULTS.custo_impressao_cortesia,
                        custo_cancelamento: PDV_DEFAULTS.custo_cancelamento,
                      },
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    pdvDefaults
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  Taxa Padrão
                </button>
              </div>
            )}

            {inputs.pdv.taxa_segmentada ? (
              <div className="grid grid-cols-2 gap-4">
                <SimulatorInput label="Taxa Crédito" value={+(inputs.pdv.taxa_credito * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_credito")(v / 100)} suffix="%" step={0.1} min={0} variant={pdvVariant("taxa_credito")} />
                <SimulatorInput label="Taxa Débito / Pix" value={+(inputs.pdv.taxa_debito_pix * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_debito_pix")(v / 100)} suffix="%" step={0.1} min={0} variant={pdvVariant("taxa_debito_pix")} />
              </div>
            ) : (
              <div>
                <SimulatorInput label="Taxa Única" value={+(inputs.pdv.taxa_unica * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_unica")(v / 100)} suffix="%" step={0.1} min={0} />
                <p className="text-xs text-muted-foreground mt-2">
                  A taxa única será cobrada ao fim do evento sobre o valor bruto faturado, incluindo dinheiro.
                </p>
              </div>
            )}

            {inputs.pdv.taxa_segmentada && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Custos de Impressão</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SimulatorInput label="Impressão / Ingresso" value={inputs.pdv.custo_impressao_ingresso} onChange={(v) => upd("pdv")("custo_impressao_ingresso")(v)} prefix="R$" step={0.01} min={0} variant={pdvDefaults ? pdvVariant("custo_impressao_ingresso") : "cost"} />
                  <SimulatorInput label="Impressão / Cortesia" value={inputs.pdv.custo_impressao_cortesia} onChange={(v) => upd("pdv")("custo_impressao_cortesia")(v)} prefix="R$" step={0.01} min={0} variant={pdvDefaults ? pdvVariant("custo_impressao_cortesia") : "cost"} />
                  <SimulatorInput label="Cancelamento" value={inputs.pdv.custo_cancelamento} onChange={(v) => upd("pdv")("custo_cancelamento")(v)} prefix="R$" step={0.01} min={0} variant={pdvDefaults ? pdvVariant("custo_cancelamento") : "cost"} />
                </div>
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* ═══════════════════ EXTRAS ═══════════════════ */}
      <div className="mt-2">
        <h2 className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Módulos Extras</h2>
      </div>


      {/* Suporte Premium Tickets */}
      <SectionCard title="Suporte Premium Tickets">
        {(() => {
          const isPontual = inputs.cliente.tipo === "pontual";
          const TPV = inputs.evento.tpv_total;
          const elegivel = isPontual
            ? TPV >= 100000
            : TPV >= 300000;

          return (
            <div className="space-y-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                elegivel
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-muted text-muted-foreground border border-border"
              }`}>
                <span>{elegivel ? "✅" : "🔒"}</span>
                <span>
                  {elegivel
                    ? "Cliente elegível para Suporte Premium"
                    : isPontual
                      ? `Elegível a partir de R$ 100k de TPV (atual: R$ ${TPV.toLocaleString("pt-BR")})`
                      : `Elegível com ≥ R$ 300k de TPV anual`
                  }
                </span>
              </div>

              {elegivel && (
                <>
                  <SimulatorToggle
                    label="Ativar Suporte Premium"
                    checked={inputs.extras.suporte_premium_ativo}
                    onChange={(v) => upd("extras")("suporte_premium_ativo")(v)}
                  />

                  {inputs.extras.suporte_premium_ativo && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => upd("extras")("suporte_premium_tipo")("percentual" as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            inputs.extras.suporte_premium_tipo === "percentual"
                              ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                              : "bg-muted text-muted-foreground scale-100"
                          }`}
                        >
                          % sobre Faturamento Bruto
                        </button>
                        <button
                          onClick={() => upd("extras")("suporte_premium_tipo")("setup" as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            inputs.extras.suporte_premium_tipo === "setup"
                              ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                              : "bg-muted text-muted-foreground scale-100"
                          }`}
                        >
                          Valor Fixo (Setup)
                        </button>
                      </div>

                      {inputs.extras.suporte_premium_tipo === "percentual" ? (
                        <SimulatorInput
                          label="% sobre Faturamento Bruto"
                          value={inputs.extras.suporte_premium_percentual}
                          onChange={(v) => upd("extras")("suporte_premium_percentual")(v)}
                          suffix="%"
                          step={0.1}
                          min={0}
                          allowEmpty
                        />
                      ) : (
                        <SimulatorInput
                          label="Valor Fixo do Suporte"
                          value={inputs.extras.suporte_premium_setup}
                          onChange={(v) => upd("extras")("suporte_premium_setup")(v)}
                          prefix="R$"
                          min={0}
                          allowEmpty
                        />
                      )}

                      {((inputs.extras.suporte_premium_tipo === "percentual" && inputs.extras.suporte_premium_percentual > 0) ||
                        (inputs.extras.suporte_premium_tipo === "setup" && inputs.extras.suporte_premium_setup > 0)) && (
                        <p className="text-xs text-success font-medium">
                          💰 Receita adicional estimada com Suporte Premium
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </SectionCard>

      {/* ═══════════════════ ADVANCE ═══════════════════ */}
      {(() => {
        const hasExclusividade = inputs.cliente.exclusividade;
        const TPV = inputs.evento.tpv_total;
        const advanceLimit = TPV * 0.30;
        const advanceExcede = inputs.extras.advance_ativo && inputs.extras.advance_valor > advanceLimit && TPV > 0;

        return (
          <div className={!hasExclusividade ? "opacity-50 pointer-events-none select-none" : ""}>
            <SectionCard title="💰 Advance">
              <p className="text-xs text-muted-foreground mb-3">
                Valor adiantado ao produtor que retorna integralmente à Zig com juros.
                {!hasExclusividade && <span className="font-semibold text-[hsl(48,97%,53%)]"> 🔒 Requer exclusividade.</span>}
              </p>
              {hasExclusividade && (
                <>
                  <SimulatorToggle
                    label="Ativar Advance"
                    checked={inputs.extras.advance_ativo}
                    onChange={(v) => upd("extras")("advance_ativo")(v as any)}
                  />
                  {inputs.extras.advance_ativo && (
                    <div className="mt-4 space-y-3">
                      <SimulatorInput
                        label="Valor emprestado"
                        value={inputs.extras.advance_valor}
                        onChange={(v) => upd("extras")("advance_valor")(v)}
                        prefix="R$"
                        min={0}
                        allowEmpty
                      />
                      {TPV > 0 && (
                        <p className={`text-xs font-medium ${advanceExcede ? "text-[hsl(0,72%,51%)]" : "text-muted-foreground"}`}>
                          {advanceExcede
                            ? `⚠️ Risco: valor excede 30% do faturamento (limite sugerido: ${advanceLimit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
                            : `Limite sugerido (30% do TPV): ${advanceLimit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                        </p>
                      )}
                      <SimulatorInput
                        label="Taxa de juros (a.m.)"
                        value={inputs.extras.advance_juros_am}
                        onChange={(v) => upd("extras")("advance_juros_am")(v)}
                        suffix="%"
                        step={0.1}
                        min={0}
                        allowEmpty
                      />
                      {inputs.extras.advance_valor > 0 && (
                        <div className="bg-muted/60 rounded-xl p-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Receita de juros</span>
                            <span className="font-semibold text-foreground tabular-nums">
                              {(inputs.extras.advance_valor * (inputs.extras.advance_juros_am / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Juros mínimo (R$ 2.500/mês)</span>
                            <span className={`font-semibold tabular-nums ${inputs.extras.advance_valor * (inputs.extras.advance_juros_am / 100) >= 2500 ? "text-emerald-600" : "text-[hsl(0,72%,51%)]"}`}>
                              {inputs.extras.advance_valor * (inputs.extras.advance_juros_am / 100) >= 2500 ? "✓ Acima do mínimo" : "✗ Abaixo do mínimo"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </SectionCard>
          </div>
        );
      })()}

      {/* ═══════════════════ PATROCÍNIO ═══════════════════ */}
      {(() => {
        const hasExclusividade = inputs.cliente.exclusividade;
        return (
          <div className={!hasExclusividade ? "opacity-50 pointer-events-none select-none" : ""}>
            <SectionCard title="🤝 Patrocínio">
              <p className="text-xs text-muted-foreground mb-3">
                Valor pago ao cliente como patrocínio — dedução direta da margem Zig.
                {!hasExclusividade && <span className="font-semibold text-[hsl(48,97%,53%)]"> 🔒 Requer exclusividade.</span>}
              </p>
              {hasExclusividade && (
                <>
                  <SimulatorToggle
                    label="Ativar Patrocínio"
                    checked={inputs.extras.patrocinio_ativo}
                    onChange={(v) => upd("extras")("patrocinio_ativo")(v as any)}
                  />
                  {inputs.extras.patrocinio_ativo && (
                    <div className="mt-4 space-y-3">
                      <SimulatorInput
                        label="Valor do Patrocínio"
                        value={inputs.extras.patrocinio_valor}
                        onChange={(v) => upd("extras")("patrocinio_valor")(v)}
                        prefix="R$"
                        min={0}
                        allowEmpty
                      />
                      {inputs.extras.patrocinio_valor > 0 && (
                        <p className="text-xs text-[hsl(0,72%,51%)] font-medium">
                          ⚠️ Dedução de {inputs.extras.patrocinio_valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} na margem
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </SectionCard>
          </div>
        );
      })()}

      {/* ═══════════════════ ZIG PULSE PAGO ═══════════════════ */}
      <SectionCard title="⚡ Zig Pulse Pago">
        <p className="text-xs text-muted-foreground mb-3">
          Receita adicional Zig para impulsionar o marketing do cliente.
        </p>
        <SimulatorToggle
          label="Ativar Zig Pulse Pago"
          checked={inputs.extras.pulse_pago_ativo}
          onChange={(v) => upd("extras")("pulse_pago_ativo")(v as any)}
        />
        {inputs.extras.pulse_pago_ativo && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => upd("extras")("pulse_pago_tipo" as any)("percentual" as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  (inputs.extras as any).pulse_pago_tipo !== "fixo"
                    ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                    : "bg-muted text-muted-foreground scale-100"
                }`}
              >
                % sobre Faturamento Bruto
              </button>
              <button
                onClick={() => upd("extras")("pulse_pago_tipo" as any)("fixo" as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  (inputs.extras as any).pulse_pago_tipo === "fixo"
                    ? "bg-primary text-primary-foreground scale-105 shadow-sm"
                    : "bg-muted text-muted-foreground scale-100"
                }`}
              >
                Valor Fixo
              </button>
            </div>

            {(inputs.extras as any).pulse_pago_tipo === "fixo" ? (
              <SimulatorInput
                label="Valor Fixo Zig Pulse"
                value={inputs.extras.pulse_pago_valor}
                onChange={(v) => upd("extras")("pulse_pago_valor")(v)}
                prefix="R$"
                min={0}
                allowEmpty
              />
            ) : (
              <>
                <SimulatorInput
                  label="% sobre Faturamento Bruto"
                  value={(inputs.extras as any).pulse_pago_percentual || 0}
                  onChange={(v) => {
                    upd("extras")("pulse_pago_percentual" as any)(v);
                  }}
                  suffix="%"
                  step={0.1}
                  min={0}
                  allowEmpty
                />
              </>
            )}
          </div>
        )}
      </SectionCard>

      {/* Mapa de Assentos */}
      <SectionCard title="🪑 Mapa de Assentos">
        <SimulatorToggle
          label="Lugar Marcado (Seats I/O)"
          checked={inputs.mapa_assentos}
          onChange={(v) => updRoot("mapa_assentos")(v)}
        />
      </SectionCard>


      {/* ═══════════════════ CUSTOS OFICIAIS ═══════════════════ */}
      <div className="mt-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Custos Zig Oficiais</h2>
      </div>

      <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-4">Custos sobre Operação Online</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <ConstRow label="Crédito antecipado" value="1,29%" />
          <ConstRow label="Advance (tomada)" value="1,05%" />
          <ConstRow label="Advance (dinheiro no tempo)" value="0,00%" />
          <ConstRow label="Adquirência" value="2,20%" />
          <ConstRow label="Patrocínio" value="1,05%" />
          <ConstRow label="Antifraude" value="0,30%" />
          <ConstRow label="Comissão" value="5,00%" />
          <ConstRow label="Servidor" value="0,05%" />
          <ConstRow label="Parcelamento (receita)" value="1,90%" />
          <ConstRow label="Parcelamento (custo adq.)" value="1,75% a.m." />
          {inputs.mapa_assentos && (
            <ConstRow label="Lugar Marcado (Seats I/O)" value="R$ 0,80/un" />
          )}
        </div>
      </div>

      <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-4">Custos sobre Operação PDV</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <ConstRow label="Custo de adquirência" value="2,40%" />
          <ConstRow label="Custo de impressão" value="0,00%" />
          <ConstRow label="Custo de máquinas" value="R$ 40,00" />
        </div>
      </div>

      {/* Régua de Comissionamento */}
    </div>
  );
};
