import React from "react";
import { SimulatorInputs } from "@/hooks/useSimulator";
import { SimulatorInput, SimulatorToggle, SimulatorTextInput } from "./SimulatorInput";
import { Lock, Unlock } from "lucide-react";

interface ClientInfo {
  cnpj: string;
  executivo: string;
  faturamento_estimado: number;
  anual: boolean;
}

interface Props {
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
  errors: Record<string, string>;
  clientInfo: ClientInfo;
  setClientInfo: React.Dispatch<React.SetStateAction<ClientInfo>>;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{children}</h3>
);

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-card border border-border rounded-xl p-5 shadow-card">{children}</div>
);

export const InputSections: React.FC<Props> = ({ inputs, setInputs, errors, clientInfo, setClientInfo, isAdmin, onToggleAdmin }) => {
  const upd = <K extends keyof SimulatorInputs>(section: K) =>
    <F extends keyof SimulatorInputs[K]>(field: F) =>
      (val: SimulatorInputs[K][F]) =>
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  return (
    <div className="flex flex-col gap-6">
      {/* Identificação do Cliente */}
      <SectionCard>
        <SectionTitle>Identificação</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorTextInput label="CNPJ do Cliente" value={clientInfo.cnpj} onChange={(v) => setClientInfo((p) => ({ ...p, cnpj: v }))} placeholder="00.000.000/0000-00" mask="cnpj" />
          <SimulatorTextInput label="Nome do Executivo" value={clientInfo.executivo} onChange={(v) => setClientInfo((p) => ({ ...p, executivo: v }))} placeholder="Nome completo" />
          <SimulatorInput label="Faturamento Estimado" value={clientInfo.faturamento_estimado} onChange={(v) => setClientInfo((p) => ({ ...p, faturamento_estimado: v }))} prefix="R$" min={0} />
          <div className="flex items-end pb-2">
            <SimulatorToggle label="Anual" checked={clientInfo.anual} onChange={(v) => setClientInfo((p) => ({ ...p, anual: v }))} />
            <span className="text-xs text-muted-foreground ml-2">{clientInfo.anual ? "(Anual)" : "(Pontual)"}</span>
          </div>
        </div>
      </SectionCard>

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
          <SimulatorInput label="Offline (PDV)" value={+(inputs.distribuicao.offline_percent * 100).toFixed(2)} onChange={(v) => { upd("distribuicao")("offline_percent")(v / 100); upd("distribuicao")("online_percent")((100 - v) / 100); }} suffix="%" step={0.1} min={0} max={100} />
        </div>
      </SectionCard>

      {/* Mix de Pagamentos Online */}
      <SectionCard>
        <SectionTitle>Mix de Pagamentos Online</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <SimulatorInput label="Crédito" value={+(inputs.pagamentos_online.credito * 100).toFixed(2)} onChange={(v) => upd("pagamentos_online")("credito")(v / 100)} suffix="%" step={1} min={0} max={100} error={errors.pagamentos_online} />
          <SimulatorInput label="PIX / Débito" value={+(inputs.pagamentos_online.pix_debito * 100).toFixed(2)} onChange={(v) => upd("pagamentos_online")("pix_debito")(v / 100)} suffix="%" step={1} min={0} max={100} />
          <SimulatorInput label="PicPay" value={+(inputs.pagamentos_online.picpay * 100).toFixed(2)} onChange={(v) => upd("pagamentos_online")("picpay")(v / 100)} suffix="%" step={1} min={0} max={100} />
        </div>
        {errors.pagamentos_online && <p className="text-xs text-destructive mt-2">{errors.pagamentos_online}</p>}
      </SectionCard>

      {/* Taxas Online */}
      <SectionCard>
        <SectionTitle>Taxas Online</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Taxa Administrativa" value={+(inputs.taxas_online.taxa_administrativa * 100).toFixed(2)} onChange={(v) => upd("taxas_online")("taxa_administrativa")(v / 100)} suffix="%" step={0.1} />
          <SimulatorInput label="Taxa Processamento (Crédito)" value={+(inputs.taxas_online.taxa_processamento_credito * 100).toFixed(3)} onChange={(v) => upd("taxas_online")("taxa_processamento_credito")(v / 100)} suffix="%" step={0.01} />
        </div>
      </SectionCard>

      {/* Taxas PDV */}
      <SectionCard>
        <SectionTitle>Taxas PDV</SectionTitle>
        <div className="mb-4">
          <SimulatorToggle
            label="Taxa Única PDV"
            checked={inputs.taxas_pdv.taxa_unica_ativa}
            onChange={(v) => upd("taxas_pdv")("taxa_unica_ativa")(v)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {inputs.taxas_pdv.taxa_unica_ativa
              ? "Uma taxa única substitui crédito, débito, pix e impressões."
              : "Taxas individuais por meio de pagamento + custos de impressão."}
          </p>
        </div>

        {inputs.taxas_pdv.taxa_unica_ativa ? (
          <div className="grid grid-cols-2 gap-4">
            <SimulatorInput label="Taxa Única" value={+(inputs.taxas_pdv.taxa_unica * 100).toFixed(2)} onChange={(v) => upd("taxas_pdv")("taxa_unica")(v / 100)} suffix="%" step={0.1} />
          </div>
        ) : (
          <>
            {/* Mix Pagamentos PDV */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 mt-2">Mix Pagamentos PDV</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <SimulatorInput label="Crédito" value={+(inputs.pagamentos_pdv.credito * 100).toFixed(2)} onChange={(v) => { upd("pagamentos_pdv")("credito")(v / 100); upd("pagamentos_pdv")("pix_debito")((100 - v) / 100); }} suffix="%" step={1} min={0} max={100} error={errors.pagamentos_pdv} />
              <SimulatorInput label="PIX / Débito" value={+(inputs.pagamentos_pdv.pix_debito * 100).toFixed(2)} onChange={(v) => { upd("pagamentos_pdv")("pix_debito")(v / 100); upd("pagamentos_pdv")("credito")((100 - v) / 100); }} suffix="%" step={1} min={0} max={100} />
            </div>

            {/* Taxas por método */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Taxas por Método</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <SimulatorInput label="Taxa Crédito" value={+(inputs.taxas_pdv.taxa_credito * 100).toFixed(3)} onChange={(v) => upd("taxas_pdv")("taxa_credito")(v / 100)} suffix="%" step={0.01} />
              <SimulatorInput label="Taxa PIX / Débito" value={+(inputs.taxas_pdv.taxa_pix_debito * 100).toFixed(3)} onChange={(v) => upd("taxas_pdv")("taxa_pix_debito")(v / 100)} suffix="%" step={0.01} />
            </div>

            {/* Custo Produtor PDV */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Custo Produtor</p>
            <div className="grid grid-cols-3 gap-4">
              <SimulatorInput label="Impressão Ingresso" value={inputs.custos_produtor_pdv.impressao_ingresso} onChange={(v) => upd("custos_produtor_pdv")("impressao_ingresso")(v)} prefix="R$" step={0.01} min={0} />
              <SimulatorInput label="Impressão Cortesias" value={inputs.custos_produtor_pdv.impressao_cortesias} onChange={(v) => upd("custos_produtor_pdv")("impressao_cortesias")(v)} prefix="R$" step={0.01} min={0} />
              <SimulatorInput label="Cancelamento Impressos" value={inputs.custos_produtor_pdv.cancelamento_impressos} onChange={(v) => upd("custos_produtor_pdv")("cancelamento_impressos")(v)} prefix="R$" step={0.01} min={0} />
            </div>
          </>
        )}
      </SectionCard>

      {/* Comercial */}
      <SectionCard>
        <SectionTitle>Comercial</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Rebate (sobre receita online)" value={+(inputs.comercial.rebate * 100).toFixed(2)} onChange={(v) => upd("comercial")("rebate")(v / 100)} suffix="%" step={0.1} />
          <SimulatorInput label="Impostos" value={+(inputs.comercial.imposto * 100).toFixed(2)} onChange={(v) => upd("comercial")("imposto")(v / 100)} suffix="%" step={0.1} />
        </div>
      </SectionCard>

      {/* Custos - Admin only */}
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Custos</SectionTitle>
          <button
            onClick={onToggleAdmin}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md border border-border hover:border-primary/30"
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isAdmin ? "Bloquear" : "Desbloquear"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SimulatorInput label="Custo Crédito (Adquirência)" value={+(inputs.custos.custo_credito * 100).toFixed(3)} onChange={(v) => upd("custos")("custo_credito")(v / 100)} suffix="%" step={0.01} disabled={!isAdmin} />
          <SimulatorInput label="Custo PIX/Débito (Adquirência)" value={+(inputs.custos.custo_pix_debito * 100).toFixed(3)} onChange={(v) => upd("custos")("custo_pix_debito")(v / 100)} suffix="%" step={0.01} disabled={!isAdmin} />
          <SimulatorInput label="Custo PicPay (Adquirência)" value={+(inputs.custos.custo_picpay * 100).toFixed(3)} onChange={(v) => upd("custos")("custo_picpay")(v / 100)} suffix="%" step={0.01} disabled={!isAdmin} />
          <SimulatorInput label="Antifraude" value={+(inputs.custos.antifraude * 100).toFixed(3)} onChange={(v) => upd("custos")("antifraude")(v / 100)} suffix="%" step={0.01} disabled={!isAdmin} />
          <SimulatorInput label="Comissão" value={+(inputs.custos.comissao * 100).toFixed(2)} onChange={(v) => upd("custos")("comissao")(v / 100)} suffix="%" step={0.1} disabled={!isAdmin} />
          <SimulatorInput label="Servidor" value={+(inputs.custos.servidor * 100).toFixed(4)} onChange={(v) => upd("custos")("servidor")(v / 100)} suffix="%" step={0.001} disabled={!isAdmin} />
          <SimulatorInput label="Custo/Máquina" value={inputs.custos.custo_maquina} onChange={(v) => upd("custos")("custo_maquina")(v)} prefix="R$" disabled={!isAdmin} />
          <SimulatorInput label="Nº Máquinas" value={inputs.custos.numero_maquinas} onChange={(v) => upd("custos")("numero_maquinas")(v)} min={0} disabled={!isAdmin} />
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
            <SimulatorInput label="Custo Advance" value={+(inputs.advance.custo * 100).toFixed(4)} onChange={(v) => upd("advance")("custo")(v / 100)} suffix="%" step={0.01} disabled={!isAdmin} />
          </div>
        )}
      </SectionCard>
    </div>
  );
};
