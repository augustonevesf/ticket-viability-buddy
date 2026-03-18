import React from "react";
import { SimulatorInputs, CONSTANTS } from "@/hooks/useSimulator";
import { SimulatorInput, SimulatorToggle, SimulatorTextInput } from "./SimulatorInput";

interface ClientInfo {
  cnpj: string;
  executivo: string;
  faturamento_estimado: number;
  anual: boolean;
}

interface Props {
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
  clientInfo: ClientInfo;
  setClientInfo: React.Dispatch<React.SetStateAction<ClientInfo>>;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{children}</h3>
);

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-card border border-border rounded-xl p-5 shadow-card">{children}</div>
);

export const InputSections: React.FC<Props> = ({ inputs, setInputs, clientInfo, setClientInfo }) => {
  const upd = <K extends keyof SimulatorInputs>(section: K) =>
    <F extends keyof SimulatorInputs[K]>(field: F) =>
      (val: SimulatorInputs[K][F]) =>
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const C = CONSTANTS;
  const offline_percent = 1 - inputs.distribuicao.online_percent;

  return (
    <div className="flex flex-col gap-6">
      {/* Identificação do Cliente */}
      <SectionCard>
        <SectionTitle>Identificação</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorTextInput label="CNPJ do Cliente" value={clientInfo.cnpj} onChange={(v) => setClientInfo((p) => ({ ...p, cnpj: v }))} placeholder="00.000.000/0000-00" mask="cnpj" />
          <SimulatorTextInput label="Nome do Executivo" value={clientInfo.executivo} onChange={(v) => setClientInfo((p) => ({ ...p, executivo: v }))} placeholder="Nome completo" />
          <SimulatorInput label="Faturamento Estimado" value={clientInfo.faturamento_estimado} onChange={(v) => setClientInfo((p) => ({ ...p, faturamento_estimado: v }))} prefix="R$" min={0} allowEmpty />
          <div className="flex items-end pb-2">
            <SimulatorToggle label="Anual" checked={clientInfo.anual} onChange={(v) => setClientInfo((p) => ({ ...p, anual: v }))} />
            <span className="text-xs text-muted-foreground ml-2">{clientInfo.anual ? "(Anual)" : "(Pontual)"}</span>
          </div>
        </div>
      </SectionCard>

      {/* Evento */}
      <SectionCard>
        <SectionTitle>Evento</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SimulatorInput label="TPV Total" value={inputs.evento.tpv_total} onChange={(v) => upd("evento")("tpv_total")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="Ticket Médio" value={inputs.evento.ticket_medio} onChange={(v) => upd("evento")("ticket_medio")(v)} prefix="R$" min={0} allowEmpty />
          <SimulatorInput label="Qtd. Ingressos" value={inputs.evento.quantidade_ingressos} onChange={(v) => upd("evento")("quantidade_ingressos")(v)} min={0} allowEmpty />
        </div>
      </SectionCard>

      {/* Distribuição */}
      <SectionCard>
        <SectionTitle>Distribuição</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Online" value={+(inputs.distribuicao.online_percent * 100).toFixed(2)} onChange={(v) => upd("distribuicao")("online_percent")(Math.min(100, Math.max(0, v)) / 100)} suffix="%" step={0.1} min={0} max={100} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offline (auto)</label>
            <div className="bg-muted border border-border rounded-md px-3 py-2 text-sm tabular-nums text-muted-foreground">
              {(offline_percent * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Taxa Administrativa */}
      <SectionCard>
        <SectionTitle>Taxa Administrativa</SectionTitle>
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Modelo</label>
          <div className="flex gap-2">
            {(["repassada", "absorvida"] as const).map((m) => (
              <button
                key={m}
                onClick={() => upd("taxa")("modelo")(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  inputs.taxa.modelo === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"
                }`}
              >
                {m === "repassada" ? "Repassada" : "Absorvida"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Taxa Base" value={+(inputs.taxa.taxa_base * 100).toFixed(2)} onChange={(v) => upd("taxa")("taxa_base")(v / 100)} suffix="%" step={0.1} min={0} />
          <SimulatorInput label="Rebate" value={+(inputs.taxa.rebate * 100).toFixed(2)} onChange={(v) => upd("taxa")("rebate")(v / 100)} suffix="%" step={0.1} min={0} />
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 mb-3">
            <SimulatorToggle label="Taxa Mínima" checked={inputs.taxa.taxa_minima_ativa} onChange={(v) => upd("taxa")("taxa_minima_ativa")(v)} />
          </div>
          {inputs.taxa.taxa_minima_ativa && (
            <div className="grid grid-cols-2 gap-4">
              <SimulatorInput label="Valor Taxa Mínima" value={inputs.taxa.valor_taxa_minima} onChange={(v) => upd("taxa")("valor_taxa_minima")(v)} prefix="R$" step={0.1} min={0} />
              <SimulatorInput label="Limite Ticket Médio" value={inputs.taxa.limite_ticket_medio} onChange={(v) => upd("taxa")("limite_ticket_medio")(v)} prefix="R$" step={1} min={0} />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Operação */}
      <SectionCard>
        <SectionTitle>Operação</SectionTitle>
        <div className="grid grid-cols-1 gap-4">
          <SimulatorInput label="Qtd. Máquinas" value={inputs.operacao.quantidade_maquinas} onChange={(v) => upd("operacao")("quantidade_maquinas")(v)} min={0} />
        </div>
      </SectionCard>

      {/* Advance */}
      <SectionCard>
        <SectionTitle>Advance</SectionTitle>
        <div className="mb-4">
          <SimulatorToggle label="Usar Advance" checked={inputs.advance.ativo} onChange={(v) => upd("advance")("ativo")(v)} />
        </div>
        {inputs.advance.ativo && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <SimulatorInput label="Valor do Advance" value={inputs.advance.valor} onChange={(v) => upd("advance")("valor")(v)} prefix="R$" min={0} allowEmpty />
              <SimulatorInput label="Taxa Juros Mensal" value={+(inputs.advance.taxa_juros_mensal * 100).toFixed(2)} onChange={(v) => upd("advance")("taxa_juros_mensal")(v / 100)} suffix="%" step={0.1} min={2.5} />
              <SimulatorInput label="Prazo (meses)" value={inputs.advance.prazo_meses} onChange={(v) => upd("advance")("prazo_meses")(v)} min={1} />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Tipo</label>
              <div className="flex gap-2">
                {(["parcelado", "performado"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => upd("advance")("tipo")(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      inputs.advance.tipo === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {t === "parcelado" ? "Parcelado" : "Performado"}
                  </button>
                ))}
              </div>
            </div>
            {inputs.advance.tipo === "performado" && (
              <SimulatorInput label="% Retenção" value={+(inputs.advance.percentual_retencao * 100).toFixed(2)} onChange={(v) => upd("advance")("percentual_retencao")(v / 100)} suffix="%" step={1} min={0} max={100} />
            )}
          </>
        )}
      </SectionCard>

      {/* Constantes (somente leitura) */}
      <SectionCard>
        <SectionTitle>Constantes (não editáveis)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          <ConstRow label="Imposto" value={`${(C.imposto * 100).toFixed(2)}%`} />
          <ConstRow label="Antifraude" value={`${(C.antifraude * 100).toFixed(1)}%`} />
          <ConstRow label="Comissão" value={`${(C.comissao * 100).toFixed(0)}%`} />
          <ConstRow label="Servidor" value={`${(C.servidor * 100).toFixed(2)}%`} />
          <ConstRow label="Custo/Máquina" value={`R$ ${C.custo_maquina}`} />
          <ConstRow label="Impressão" value={`R$ ${C.custo_impressao.toFixed(2)}`} />
          <div className="col-span-full mt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Adquirência Online</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Crédito: {(C.adquirencia_online.credito * 100).toFixed(1)}%</span>
              <span>Déb/Pix: {(C.adquirencia_online.debito_pix * 100).toFixed(1)}%</span>
              <span>PicPay: {(C.adquirencia_online.picpay * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="col-span-full mt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Adquirência Offline</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Crédito: {(C.adquirencia_offline.credito * 100).toFixed(1)}%</span>
              <span>Déb/Pix: {(C.adquirencia_offline.debito_pix * 100).toFixed(2)}%</span>
            </div>
          </div>
          <div className="col-span-full mt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Split Online</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Crédito: {(C.split_online.credito * 100)}%</span>
              <span>Déb/Pix: {(C.split_online.debito_pix * 100)}%</span>
              <span>PicPay: {(C.split_online.picpay * 100)}%</span>
            </div>
          </div>
          <div className="col-span-full mt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Split Offline</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Crédito: {(C.split_offline.credito * 100)}%</span>
              <span>Déb/Pix: {(C.split_offline.debito_pix * 100)}%</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

const ConstRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium tabular-nums">{value}</span>
  </div>
);
