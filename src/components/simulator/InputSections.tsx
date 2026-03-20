import React from "react";
import { SimulatorInputs, CONSTANTS, COMMISSION_TIERS } from "@/hooks/useSimulator";
import { SimulatorInput, SimulatorToggle, SimulatorTextInput } from "./SimulatorInput";

interface Props {
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; accent?: boolean }> = ({ title, children, accent }) => (
  <div className={`bg-card rounded-2xl p-5 shadow-card ${accent ? "border-l-4 border-primary" : ""}`}>
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

const ReadOnly: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-muted-foreground tracking-wide">{label}</label>
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
  const upd = <K extends keyof SimulatorInputs>(section: K) =>
    <F extends keyof SimulatorInputs[K]>(field: F) =>
      (val: SimulatorInputs[K][F]) =>
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const C = CONSTANTS;
  const offline_percent = 1 - inputs.distribuicao.online_percent;
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
            label="CNPJ"
            value={inputs.cliente.cnpj}
            onChange={(v) => upd("cliente")("cnpj")(v)}
          />
          <SimulatorTextInput
            label="Nome do Executivo"
            value={inputs.cliente.executivo}
            onChange={(v) => upd("cliente")("executivo")(v)}
            placeholder="Responsável"
          />
        </div>
      </SectionCard>

      {/* BLOCO 2 — Informações Básicas */}
      <SectionCard title="Informações Básicas Evento / Agência">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorInput label="TPV Estimado" value={inputs.evento.tpv_total} onChange={(v) => upd("evento")("tpv_total")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="Quantidade de Público Estimado" value={inputs.evento.publico_estimado} onChange={(v) => upd("evento")("publico_estimado")(v)} min={0} allowEmpty />
        </div>
        {inputs.evento.tpv_total > 0 && inputs.evento.publico_estimado > 0 && (
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
          <ReadOnly label="Offline (auto)" value={`${(offline_percent * 100).toFixed(2)}%`} />
        </div>
      </SectionCard>

      {/* BLOCO 4 — Negociação Ingresso */}
      <SectionCard title="Negociação Ingresso">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimulatorInput label="Taxa Administrativa" value={+(inputs.taxa.taxa_administrativa * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_administrativa")(v / 100)} suffix="%" step={0.1} min={0} />
          <SimulatorInput label="Taxa de Antecipação" value={+(inputs.taxa.taxa_antecipacao * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_antecipacao")(v / 100)} suffix="%" step={0.1} min={0} />
          <SimulatorInput label="Taxa de Processamento" value={+(inputs.taxa.taxa_processamento * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_processamento")(v / 100)} suffix="%" step={0.1} min={0} />
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 mb-3">
            <SimulatorToggle label="Taxa Mínima de Ingresso" checked={inputs.taxa.taxa_minima_ativa} onChange={(v) => upd("taxa")("taxa_minima_ativa")(v)} />
          </div>
          {inputs.taxa.taxa_minima_ativa && (
            <div>
              <SimulatorInput label="Valor Taxa Mínima" value={inputs.taxa.valor_taxa_minima} onChange={(v) => upd("taxa")("valor_taxa_minima")(v)} prefix="R$" step={0.1} min={0} />
              <p className="text-xs text-muted-foreground mt-2">
                Aplicada quando ticket médio {"<"} R$ 25,00 — funciona como mínimo garantido.
              </p>
              {ticket_medio > 0 && ticket_medio < 25 && (
                <p className="text-xs text-warning mt-1 font-medium">
                  ⚠ Ticket médio atual: R$ {ticket_medio.toFixed(2)} — taxa mínima será aplicada
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ═══════════════════ VENDAS FÍSICAS — PDV ═══════════════════ */}
      <div className="mt-2">
        <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Vendas Físicas — PDV</h2>
      </div>

      {/* Volume PDV */}
      <SectionCard title="Volume Financeiro (PDV)" accent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimulatorInput label="TPV Vendas Físicas" value={inputs.pdv.tpv_pdv} onChange={(v) => upd("pdv")("tpv_pdv")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="Qtd. Máquinas Físicas" value={inputs.pdv.quantidade_maquinas} onChange={(v) => upd("pdv")("quantidade_maquinas")(v)} min={0} allowEmpty />
          <SimulatorInput label="Ingressos Emitidos (Esperados)" value={inputs.pdv.ingressos_esperados} onChange={(v) => upd("pdv")("ingressos_esperados")(v)} min={0} allowEmpty />
        </div>
        {inputs.pdv.tpv_pdv > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <ReadOnly label="Crédito (70%)" value={`R$ ${(inputs.pdv.tpv_pdv * 0.70).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
            <ReadOnly label="Débito/Pix (30%)" value={`R$ ${(inputs.pdv.tpv_pdv * 0.30).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
          </div>
        )}
      </SectionCard>

      {/* Taxas PDV */}
      <SectionCard title="Taxas — Receita Zig (PDV)" accent>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => upd("pdv")("taxa_segmentada")(true)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              inputs.pdv.taxa_segmentada
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Taxa Segmentada
          </button>
          <button
            onClick={() => upd("pdv")("taxa_segmentada")(false)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              !inputs.pdv.taxa_segmentada
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Taxa Única
          </button>
        </div>

        {inputs.pdv.taxa_segmentada ? (
          <div className="grid grid-cols-2 gap-4">
            <SimulatorInput label="Taxa Crédito" value={+(inputs.pdv.taxa_credito * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_credito")(v / 100)} suffix="%" step={0.1} min={0} />
            <SimulatorInput label="Taxa Débito / Pix" value={+(inputs.pdv.taxa_debito_pix * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_debito_pix")(v / 100)} suffix="%" step={0.1} min={0} />
          </div>
        ) : (
          <SimulatorInput label="Taxa Única" value={+(inputs.pdv.taxa_unica * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_unica")(v / 100)} suffix="%" step={0.1} min={0} />
        )}

        {inputs.pdv.taxa_segmentada && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custos de Impressão</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SimulatorInput label="Impressão / Ingresso" value={inputs.pdv.custo_impressao_ingresso} onChange={(v) => upd("pdv")("custo_impressao_ingresso")(v)} prefix="R$" step={0.01} min={0} />
              <SimulatorInput label="Impressão / Cortesia" value={inputs.pdv.custo_impressao_cortesia} onChange={(v) => upd("pdv")("custo_impressao_cortesia")(v)} prefix="R$" step={0.01} min={0} />
              <SimulatorInput label="Cancelamento" value={inputs.pdv.custo_cancelamento} onChange={(v) => upd("pdv")("custo_cancelamento")(v)} prefix="R$" step={0.01} min={0} />
            </div>
          </div>
        )}
      </SectionCard>




      {/* ═══════════════════ CUSTOS OFICIAIS ═══════════════════ */}
      <div className="mt-2">
        <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Custos Zig Oficiais</h2>
      </div>

      <SectionCard title="Custos sobre Operação Online">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <ConstRow label="Crédito antecipado" value="1,29%" />
          <ConstRow label="Advance (tomada)" value="1,05%" />
          <ConstRow label="Advance (dinheiro no tempo)" value="0,00%" />
          <ConstRow label="Adquirência" value="2,20%" />
          <ConstRow label="Patrocínio" value="1,05%" />
          <ConstRow label="Antifraude" value="0,30%" />
          <ConstRow label="Comissão" value="5,00%" />
          <ConstRow label="Servidor" value="0,05%" />
        </div>
      </SectionCard>

      <SectionCard title="Custos sobre Operação Offline">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <ConstRow label="Custo de adquirência" value="2,40%" />
          <ConstRow label="Custo de impressão" value="0,00%" />
          <ConstRow label="Custo de máquinas" value="R$ 40,00" />
        </div>
      </SectionCard>

      {/* Régua de Comissionamento */}
      <SectionCard title="Régua de Comissionamento do Executivo">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Atingimento meta</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Fator</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_TIERS.map((tier) => (
                <tr key={tier.label} className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">
                    <span className="font-medium text-foreground">{tier.label}</span> — {tier.range}
                  </td>
                  <td className="py-2 tabular-nums font-medium text-foreground">{(tier.fator * 100).toFixed(0)}%</td>
                  <td className="py-2 tabular-nums font-medium text-foreground">R$ {tier.comissao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};
