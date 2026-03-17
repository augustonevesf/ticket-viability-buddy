import React from "react";
import { SimulatorInputs } from "@/hooks/useSimulator";
import { SimulatorInput, SimulatorToggle } from "./SimulatorInput";

interface Props {
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
  errors: Record<string, string>;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{children}</h3>
);

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-card border border-border rounded-xl p-5 shadow-card">{children}</div>
);

export const InputSections: React.FC<Props> = ({ inputs, setInputs, errors }) => {
  const upd = <K extends keyof SimulatorInputs>(section: K) =>
    <F extends keyof SimulatorInputs[K]>(field: F) =>
      (val: SimulatorInputs[K][F]) =>
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  return (
    <div className="flex flex-col gap-6">
      {/* Evento */}
      <SectionCard>
        <SectionTitle>Evento</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Público" value={inputs.evento.publico} onChange={(v) => upd("evento")("publico")(v)} min={0} />
          <SimulatorInput label="Ticket Médio" value={inputs.evento.ticket_medio} onChange={(v) => upd("evento")("ticket_medio")(v)} prefix="R$" min={0} />
          <SimulatorInput label="Duração (meses)" value={inputs.evento.duracao_meses} onChange={(v) => upd("evento")("duracao_meses")(v)} min={1} />
          <div className="flex items-end pb-2">
            <SimulatorToggle label="Lugar Marcado" checked={inputs.evento.lugar_marcado} onChange={(v) => upd("evento")("lugar_marcado")(v)} />
          </div>
        </div>
      </SectionCard>

      {/* Distribuição */}
      <SectionCard>
        <SectionTitle>Distribuição</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Online" value={+(inputs.distribuicao.online_percent * 100).toFixed(2)} onChange={(v) => { upd("distribuicao")("online_percent")(v / 100); upd("distribuicao")("offline_percent")((100 - v) / 100); }} suffix="%" step={0.1} min={0} max={100} error={errors.distribuicao} />
          <SimulatorInput label="Offline" value={+(inputs.distribuicao.offline_percent * 100).toFixed(2)} onChange={(v) => { upd("distribuicao")("offline_percent")(v / 100); upd("distribuicao")("online_percent")((100 - v) / 100); }} suffix="%" step={0.1} min={0} max={100} />
        </div>
      </SectionCard>

      {/* Mix de Pagamentos */}
      <SectionCard>
        <SectionTitle>Mix de Pagamentos Online</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <SimulatorInput label="Crédito" value={+(inputs.pagamentos_online.credito * 100).toFixed(2)} onChange={(v) => upd("pagamentos_online")("credito")(v / 100)} suffix="%" step={1} min={0} max={100} error={errors.pagamentos} />
          <SimulatorInput label="PIX / Débito" value={+(inputs.pagamentos_online.pix_debito * 100).toFixed(2)} onChange={(v) => upd("pagamentos_online")("pix_debito")(v / 100)} suffix="%" step={1} min={0} max={100} />
          <SimulatorInput label="PicPay" value={+(inputs.pagamentos_online.picpay * 100).toFixed(2)} onChange={(v) => upd("pagamentos_online")("picpay")(v / 100)} suffix="%" step={1} min={0} max={100} />
        </div>
        {errors.pagamentos && <p className="text-xs text-destructive mt-2">{errors.pagamentos}</p>}
      </SectionCard>

      {/* Taxas */}
      <SectionCard>
        <SectionTitle>Taxas</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Taxa Plataforma" value={+(inputs.taxas.taxa_plataforma * 100).toFixed(2)} onChange={(v) => upd("taxas")("taxa_plataforma")(v / 100)} suffix="%" step={0.1} />
          <SimulatorInput label="Taxa Crédito" value={+(inputs.taxas.taxa_credito * 100).toFixed(3)} onChange={(v) => upd("taxas")("taxa_credito")(v / 100)} suffix="%" step={0.01} />
          <SimulatorInput label="Taxa PIX/Débito" value={+(inputs.taxas.taxa_pix_debito * 100).toFixed(3)} onChange={(v) => upd("taxas")("taxa_pix_debito")(v / 100)} suffix="%" step={0.01} />
          <SimulatorInput label="Taxa PicPay" value={+(inputs.taxas.taxa_picpay * 100).toFixed(3)} onChange={(v) => upd("taxas")("taxa_picpay")(v / 100)} suffix="%" step={0.01} />
        </div>
      </SectionCard>

      {/* Comercial */}
      <SectionCard>
        <SectionTitle>Comercial</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Rebate" value={+(inputs.comercial.rebate * 100).toFixed(2)} onChange={(v) => upd("comercial")("rebate")(v / 100)} suffix="%" step={0.1} />
          <SimulatorInput label="Impostos" value={+(inputs.comercial.imposto * 100).toFixed(2)} onChange={(v) => upd("comercial")("imposto")(v / 100)} suffix="%" step={0.1} />
        </div>
      </SectionCard>

      {/* Custos */}
      <SectionCard>
        <SectionTitle>Custos</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Antifraude" value={+(inputs.custos.antifraude * 100).toFixed(3)} onChange={(v) => upd("custos")("antifraude")(v / 100)} suffix="%" step={0.01} />
          <SimulatorInput label="Comissão" value={+(inputs.custos.comissao * 100).toFixed(2)} onChange={(v) => upd("custos")("comissao")(v / 100)} suffix="%" step={0.1} />
          <SimulatorInput label="Servidor" value={+(inputs.custos.servidor * 100).toFixed(4)} onChange={(v) => upd("custos")("servidor")(v / 100)} suffix="%" step={0.001} />
          <SimulatorInput label="Custo Impressão" value={inputs.custos.custo_impressao} onChange={(v) => upd("custos")("custo_impressao")(v)} prefix="R$" step={0.01} />
          <SimulatorInput label="Custo/Máquina" value={inputs.custos.custo_maquina} onChange={(v) => upd("custos")("custo_maquina")(v)} prefix="R$" />
          <SimulatorInput label="Nº Máquinas" value={inputs.custos.numero_maquinas} onChange={(v) => upd("custos")("numero_maquinas")(v)} min={0} />
        </div>
      </SectionCard>

      {/* Advance */}
      <SectionCard>
        <SectionTitle>Advance</SectionTitle>
        <div className="mb-4">
          <SimulatorToggle label="Advance Ativo" checked={inputs.advance.ativo} onChange={(v) => upd("advance")("ativo")(v)} />
        </div>
        {inputs.advance.ativo && (
          <div className="grid grid-cols-2 gap-4">
            <SimulatorInput label="Taxa Advance" value={+(inputs.advance.taxa * 100).toFixed(2)} onChange={(v) => upd("advance")("taxa")(v / 100)} suffix="%" step={0.1} />
            <SimulatorInput label="Custo Advance" value={+(inputs.advance.custo * 100).toFixed(4)} onChange={(v) => upd("advance")("custo")(v / 100)} suffix="%" step={0.01} />
          </div>
        )}
      </SectionCard>
    </div>
  );
};
