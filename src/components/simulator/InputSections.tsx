import React from "react";
import { SimulatorInputs, CONSTANTS } from "@/hooks/useSimulator";
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

export const InputSections: React.FC<Props> = ({ inputs, setInputs }) => {
  const upd = <K extends keyof SimulatorInputs>(section: K) =>
    <F extends keyof SimulatorInputs[K]>(field: F) =>
      (val: SimulatorInputs[K][F]) =>
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const C = CONSTANTS;
  const offline_percent = 1 - inputs.distribuicao.online_percent;

  const pdvTpvTotal = inputs.pdv.tpv_credito + inputs.pdv.tpv_debito_pix;
  const pdvPctCredito = pdvTpvTotal > 0 ? ((inputs.pdv.tpv_credito / pdvTpvTotal) * 100).toFixed(0) : "—";
  const pdvPctDebito = pdvTpvTotal > 0 ? ((inputs.pdv.tpv_debito_pix / pdvTpvTotal) * 100).toFixed(0) : "—";

  return (
    <div className="flex flex-col gap-4">
      {/* Cliente */}
      <SectionCard title="Cliente / Produtora">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="Opcional"
          />
        </div>
      </SectionCard>

      {/* Evento (Online) */}
      <SectionCard title="Evento (Online)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimulatorInput label="TPV Total" value={inputs.evento.tpv_total} onChange={(v) => upd("evento")("tpv_total")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="Ticket Médio" value={inputs.evento.ticket_medio} onChange={(v) => upd("evento")("ticket_medio")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="Qtd. Ingressos" value={inputs.evento.quantidade_ingressos} onChange={(v) => upd("evento")("quantidade_ingressos")(v)} min={0} allowEmpty />
        </div>
      </SectionCard>

      {/* Distribuição */}
      <SectionCard title="Distribuição">
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Online" value={+(inputs.distribuicao.online_percent * 100).toFixed(2)} onChange={(v) => upd("distribuicao")("online_percent")(Math.min(100, Math.max(0, v)) / 100)} suffix="%" step={0.1} min={0} max={100} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground tracking-wide">Offline (auto)</label>
            <div className="bg-muted rounded-xl px-3 py-2.5 text-sm tabular-nums text-muted-foreground">
              {(offline_percent * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Taxa Administrativa */}
      <SectionCard title="Taxa Administrativa">
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Taxa Base" value={+(inputs.taxa.taxa_base * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_base")(v / 100)} suffix="%" step={0.1} min={0} />
          <SimulatorInput label="Rebate" value={+(inputs.taxa.rebate * 100).toFixed(2)} onChange={(v) => upd("taxa")("rebate")(v / 100)} suffix="%" step={0.1} min={0} />
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 mb-3">
            <SimulatorToggle label="Taxa Mínima" checked={inputs.taxa.taxa_minima_ativa} onChange={(v) => upd("taxa")("taxa_minima_ativa")(v)} />
          </div>
          {inputs.taxa.taxa_minima_ativa && (
            <SimulatorInput label="Valor Taxa Mínima" value={inputs.taxa.valor_taxa_minima} onChange={(v) => upd("taxa")("valor_taxa_minima")(v)} prefix="R$" step={0.1} min={0} />
          )}
        </div>
      </SectionCard>

      {/* Operação */}
      <SectionCard title="Operação (Online)">
        <SimulatorInput label="Qtd. Máquinas" value={inputs.operacao.quantidade_maquinas} onChange={(v) => upd("operacao")("quantidade_maquinas")(v)} min={0} />
      </SectionCard>

      {/* ═══════════════════ VENDAS FÍSICAS — PDV ═══════════════════ */}
      <div className="mt-2">
        <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Vendas Físicas — PDV</h2>
      </div>

      {/* Volume Financeiro PDV */}
      <SectionCard title="Volume Financeiro (TPV)" accent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorInput label="TPV Crédito" value={inputs.pdv.tpv_credito} onChange={(v) => upd("pdv")("tpv_credito")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="TPV Débito / Pix" value={inputs.pdv.tpv_debito_pix} onChange={(v) => upd("pdv")("tpv_debito_pix")(v)} prefix="R$" min={0} allowEmpty />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <ReadOnly label="TPV Total" value={`R$ ${pdvTpvTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
          <ReadOnly label="% Crédito" value={`${pdvPctCredito}%`} />
          <ReadOnly label="% Débito/Pix" value={`${pdvPctDebito}%`} />
        </div>
      </SectionCard>

      {/* Operação PDV */}
      <SectionCard title="Operação (Evento PDV)" accent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimulatorInput label="Qtd. Máquinas" value={inputs.pdv.quantidade_maquinas} onChange={(v) => upd("pdv")("quantidade_maquinas")(v)} min={0} allowEmpty />
          <SimulatorInput label="Ingressos Esperados" value={inputs.pdv.ingressos_esperados} onChange={(v) => upd("pdv")("ingressos_esperados")(v)} min={0} allowEmpty />
          <SimulatorInput label="Ticket Médio" value={inputs.pdv.ticket_medio} onChange={(v) => upd("pdv")("ticket_medio")(v)} prefix="R$" min={0} allowEmpty />
        </div>
        {inputs.pdv.ingressos_esperados > 0 && inputs.pdv.ticket_medio > 0 && (
          <div className="mt-3">
            <ReadOnly label="TPV Estimado (validação)" value={`R$ ${(inputs.pdv.ingressos_esperados * inputs.pdv.ticket_medio).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
          </div>
        )}
      </SectionCard>

      {/* Impressões PDV */}
      <SectionCard title="Impressões" accent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorInput label="Mín. Impressões / Máquina" value={inputs.pdv.impressao_minima_por_maquina} onChange={(v) => upd("pdv")("impressao_minima_por_maquina")(v)} min={0} allowEmpty />
          <SimulatorInput label="Preço por Impressão" value={inputs.pdv.preco_impressao} onChange={(v) => upd("pdv")("preco_impressao")(v)} prefix="R$" step={0.01} min={0} allowEmpty />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <ReadOnly label="Esperadas" value={String(inputs.pdv.ingressos_esperados)} />
          <ReadOnly label="Mínimas" value={String(inputs.pdv.quantidade_maquinas * inputs.pdv.impressao_minima_por_maquina)} />
          <ReadOnly label="Consideradas" value={String(Math.max(inputs.pdv.ingressos_esperados, inputs.pdv.quantidade_maquinas * inputs.pdv.impressao_minima_por_maquina))} />
        </div>
      </SectionCard>

      {/* Taxas PDV */}
      <SectionCard title="Taxas (Receita Zig — PDV)" accent>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Taxa Crédito" value={+(inputs.pdv.taxa_credito * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_credito")(v / 100)} suffix="%" step={0.1} min={0} />
          <SimulatorInput label="Taxa Débito / Pix" value={+(inputs.pdv.taxa_debito_pix * 100).toFixed(2)} onChange={(v) => upd("pdv")("taxa_debito_pix")(v / 100)} suffix="%" step={0.1} min={0} />
        </div>
      </SectionCard>

      {/* Mínimo Garantido PDV */}
      <SectionCard title="Mínimo Garantido (MG)" accent>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="MG por Máquina" value={inputs.pdv.mg_por_maquina} onChange={(v) => upd("pdv")("mg_por_maquina")(v)} prefix="R$" min={0} allowEmpty />
          <ReadOnly label="MG Total" value={`R$ ${(inputs.pdv.quantidade_maquinas * inputs.pdv.mg_por_maquina).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
        </div>
      </SectionCard>

      {/* Constantes (somente leitura) */}
      <SectionCard title="Constantes (não editáveis)">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <ConstRow label="Imposto" value={`${(C.imposto * 100).toFixed(2)}%`} />
          <ConstRow label="Antifraude" value={`${(C.antifraude * 100).toFixed(1)}%`} />
          <ConstRow label="Comissão" value={`${(C.comissao * 100).toFixed(0)}%`} />
          <ConstRow label="Servidor" value={`${(C.servidor * 100).toFixed(2)}%`} />
          <ConstRow label="Custo/Máquina" value={`R$ ${C.custo_maquina}`} />
          <ConstRow label="Impressão (default)" value={`R$ ${C.custo_impressao_default.toFixed(2)}`} />
          <div className="col-span-full mt-2 space-y-2">
            <ConstGroup title="Adquirência Online" items={[
              `Crédito: ${(C.adquirencia_online.credito * 100).toFixed(1)}%`,
              `Déb/Pix: ${(C.adquirencia_online.debito_pix * 100).toFixed(1)}%`,
              `PicPay: ${(C.adquirencia_online.picpay * 100).toFixed(1)}%`,
            ]} />
            <ConstGroup title="Adquirência Offline" items={[
              `Crédito: ${(C.adquirencia_offline.credito * 100).toFixed(1)}%`,
              `Déb/Pix: ${(C.adquirencia_offline.debito_pix * 100).toFixed(2)}%`,
            ]} />
            <ConstGroup title="Split Online" items={[
              `Crédito: ${(C.split_online.credito * 100)}%`,
              `Déb/Pix: ${(C.split_online.debito_pix * 100)}%`,
              `PicPay: ${(C.split_online.picpay * 100)}%`,
            ]} />
            <ConstGroup title="Split Offline" items={[
              `Crédito: ${(C.split_offline.credito * 100)}%`,
              `Déb/Pix: ${(C.split_offline.debito_pix * 100)}%`,
            ]} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

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

const ConstGroup: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground tracking-wide mb-1">{title}</p>
    <div className="flex gap-4 text-xs text-muted-foreground">
      {items.map((item) => <span key={item}>{item}</span>)}
    </div>
  </div>
);
