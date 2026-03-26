import React, { useState } from "react";
import { ABInputs, LineItem } from "@/hooks/useSimulatorAB";
import { SimulatorInput, SimulatorToggle, SimulatorTextInput } from "../simulator/SimulatorInput";
import { MCC_LABELS } from "@/data/mccTable";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  inputs: ABInputs;
  setInputs: React.Dispatch<React.SetStateAction<ABInputs>>;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; accent?: boolean; collapsible?: boolean; defaultOpen?: boolean }> = ({
  title, children, accent, collapsible = false, defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-card rounded-2xl shadow-card ${accent ? "border-l-4 border-primary" : ""}`}>
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className={`w-full px-5 pt-5 pb-3 flex items-center justify-between ${collapsible ? "cursor-pointer" : "cursor-default"}`}
      >
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{title}</h3>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />)}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

const ReadOnly: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-muted-foreground tracking-wide">{label}</span>
    <div className="bg-muted rounded-xl px-3 py-2.5 text-sm tabular-nums text-muted-foreground">{value}</div>
  </div>
);

const LineItemRow: React.FC<{
  label: string;
  item: LineItem;
  onChange: (item: LineItem) => void;
  periodoLabel?: string;
}> = ({ label, item, onChange, periodoLabel = "Período" }) => (
  <div className="grid grid-cols-4 gap-2 items-end">
    <div className="col-span-1">
      <span className="text-[11px] text-muted-foreground block mb-1">{label}</span>
      <SimulatorInput label="Valor" value={item.valor} onChange={v => onChange({ ...item, valor: v })} prefix="R$" step={0.01} min={0} allowEmpty />
    </div>
    <SimulatorInput label="Qtd" value={item.qtd} onChange={v => onChange({ ...item, qtd: v })} min={0} allowEmpty />
    <SimulatorInput label={periodoLabel} value={item.periodo} onChange={v => onChange({ ...item, periodo: v })} min={0} allowEmpty />
    <ReadOnly label="Total" value={`R$ ${(item.valor * item.qtd * item.periodo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
  </div>
);

const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ABInputSections: React.FC<Props> = ({ inputs, setInputs }) => {
  const upd = <K extends keyof ABInputs>(section: K) =>
    <F extends keyof ABInputs[K]>(field: F) =>
      (val: ABInputs[K][F]) =>
        setInputs(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const updLineItem = <S extends "receitas_diversas" | "receitas_setup" | "custos_equipamentos" | "custos_zig">(
    section: S, field: keyof ABInputs[S]
  ) => (item: LineItem) =>
    setInputs(prev => ({ ...prev, [section]: { ...prev[section], [field]: item } }));

  const fat = inputs.faturamento;
  const splitTotal = fat.split_dinheiro + fat.split_debito + fat.split_pix + fat.split_credito + fat.split_app + fat.split_qr;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Identificação ── */}
      <SectionCard title="Identificação do Cliente">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimulatorTextInput label="Nome do Cliente *" value={inputs.cliente.nome} onChange={v => upd("cliente")("nome")(v)} placeholder="Obrigatório" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground tracking-wide">MCC *</span>
            <select
              value={inputs.cliente.mcc}
              onChange={e => upd("cliente")("mcc")(e.target.value)}
              className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(MCC_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <SimulatorTextInput label="Regional" value={inputs.cliente.regional} onChange={v => upd("cliente")("regional")(v)} />
          <SimulatorTextInput label="Polo" value={inputs.cliente.polo} onChange={v => upd("cliente")("polo")(v)} />
          <SimulatorTextInput label="Comercial Responsável" value={inputs.cliente.comercial} onChange={v => upd("cliente")("comercial")(v)} placeholder="Obrigatório" />
        </div>
        <div className="mt-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Tipo de Negociação</span>
            <select
              value={inputs.cliente.tipo_negociacao}
              onChange={e => upd("cliente")("tipo_negociacao")(e.target.value)}
              className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="1a proposta">1ª Proposta</option>
              <option value="renovacao">Renovação</option>
              <option value="renegociacao">Renegociação</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ── Configuração ── */}
      <SectionCard title="Configuração da Operação">
        <div className="flex items-center gap-3 mb-4">
          {(["casa", "evento"] as const).map(t => (
            <button key={t} onClick={() => upd("configuracao")("tipo")(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${inputs.configuracao.tipo === t ? "bg-primary text-primary-foreground scale-105 shadow-sm" : "bg-muted text-muted-foreground"}`}>
              {t === "casa" ? "Casa" : "Evento"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Modelo</span>
            <select value={inputs.configuracao.cashless_ficha} onChange={e => upd("configuracao")("cashless_ficha")(e.target.value as any)}
              className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30">
              <option value="cashless">Cashless</option>
              <option value="ficha">Ficha</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tipo de Chip</span>
            <select value={inputs.configuracao.tipo_chip} onChange={e => upd("configuracao")("tipo_chip")(e.target.value as any)}
              className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30">
              <option value="cipurse">Cipurse</option>
              <option value="mifare">Mifare</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Período Cobrança</span>
            <select value={inputs.configuracao.periodo_cobranca} onChange={e => upd("configuracao")("periodo_cobranca")(e.target.value as any)}
              className="bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30">
              <option value="mensal">Mensal</option>
              <option value="diario">Diário</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <SimulatorInput label="Dias de Funcionamento/Mês" value={inputs.configuracao.dias_funcionamento} onChange={v => upd("configuracao")("dias_funcionamento")(v)} min={0} max={31} allowEmpty />
          <SimulatorInput label="Dias Operação Assistida" value={inputs.configuracao.dias_operacao_assistida} onChange={v => upd("configuracao")("dias_operacao_assistida")(v)} min={0} allowEmpty />
        </div>
        <div className="mt-4 space-y-3">
          <SimulatorToggle label="Equipamentos em Comodato" checked={inputs.configuracao.comodato} onChange={v => upd("configuracao")("comodato")(v)} />
          <SimulatorToggle label="100% Antecipado" checked={inputs.configuracao.antecipado_100} onChange={v => upd("configuracao")("antecipado_100")(v)} />
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Adquirência Zig:</span>
            {(["segmentada", "unica"] as const).map(t => (
              <button key={t} onClick={() => upd("configuracao")("adquirencia_zig")(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${inputs.configuracao.adquirencia_zig === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {t === "segmentada" ? "Taxa Segmentada" : "Taxa Única"}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Faturamento & Split ── */}
      <SectionCard title="Faturamento & Distribuição" accent>
        <SimulatorInput label="Faturamento Esperado" value={fat.total} onChange={v => upd("faturamento")("total")(v)} prefix="R$" min={0} allowEmpty />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SimulatorInput label="Dinheiro %" value={fat.split_dinheiro} onChange={v => upd("faturamento")("split_dinheiro")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Débito %" value={fat.split_debito} onChange={v => upd("faturamento")("split_debito")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Pix %" value={fat.split_pix} onChange={v => upd("faturamento")("split_pix")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Crédito %" value={fat.split_credito} onChange={v => upd("faturamento")("split_credito")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="App %" value={fat.split_app} onChange={v => upd("faturamento")("split_app")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="QR Auto Atendimento %" value={fat.split_qr} onChange={v => upd("faturamento")("split_qr")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
        </div>
        {splitTotal !== 100 && splitTotal > 0 && (
          <p className="text-xs text-destructive mt-2 font-medium">⚠ Soma das distribuições: {splitTotal}% (deve ser 100%)</p>
        )}
        {fat.total > 0 && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ReadOnly label="Dinheiro" value={`R$ ${fmt(fat.total * fat.split_dinheiro / 100)}`} />
            <ReadOnly label="Débito" value={`R$ ${fmt(fat.total * fat.split_debito / 100)}`} />
            <ReadOnly label="Pix" value={`R$ ${fmt(fat.total * fat.split_pix / 100)}`} />
            <ReadOnly label="Crédito" value={`R$ ${fmt(fat.total * fat.split_credito / 100)}`} />
            <ReadOnly label="App" value={`R$ ${fmt(fat.total * fat.split_app / 100)}`} />
            <ReadOnly label="QR" value={`R$ ${fmt(fat.total * fat.split_qr / 100)}`} />
          </div>
        )}
      </SectionCard>

      {/* ── Info Adicional ── */}
      <SectionCard title="Informações Adicionais">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SimulatorInput label="Público Diário Estimado" value={inputs.info_adicional.publico_diario} onChange={v => upd("info_adicional")("publico_diario")(v)} min={0} allowEmpty />
          <SimulatorInput label="Cartões Personalizados" value={inputs.info_adicional.cartoes_personalizados} onChange={v => upd("info_adicional")("cartoes_personalizados")(v)} min={0} allowEmpty />
          <SimulatorInput label="Cartões Padrão Zig" value={inputs.info_adicional.cartoes_padrao} onChange={v => upd("info_adicional")("cartoes_padrao")(v)} min={0} allowEmpty />
          <SimulatorInput label="Cartões em Comodato" value={inputs.info_adicional.cartoes_comodato} onChange={v => upd("info_adicional")("cartoes_comodato")(v)} min={0} allowEmpty />
        </div>
      </SectionCard>

      {/* ── Taxas ── */}
      <SectionCard title="Receita com Taxas" accent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SimulatorInput label="Taxa ADM (Software)" value={inputs.taxas.taxa_adm} onChange={v => upd("taxas")("taxa_adm")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          {inputs.configuracao.adquirencia_zig === "segmentada" ? (
            <>
              <SimulatorInput label="Taxa Débito" value={inputs.taxas.taxa_debito} onChange={v => upd("taxas")("taxa_debito")(v)} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Taxa Pix" value={inputs.taxas.taxa_pix} onChange={v => upd("taxas")("taxa_pix")(v)} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Taxa Crédito" value={inputs.taxas.taxa_credito} onChange={v => upd("taxas")("taxa_credito")(v)} suffix="%" step={0.1} min={0} allowEmpty />
            </>
          ) : (
            <SimulatorInput label="Taxa Única (Payments)" value={inputs.taxas.taxa_credito} onChange={v => { upd("taxas")("taxa_credito")(v); upd("taxas")("taxa_debito")(v); upd("taxas")("taxa_pix")(v); }} suffix="%" step={0.1} min={0} allowEmpty />
          )}
          <SimulatorInput label="Taxa Antecipação" value={inputs.taxas.taxa_antecipacao} onChange={v => upd("taxas")("taxa_antecipacao")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          <SimulatorInput label="Taxa APP" value={inputs.taxas.taxa_app} onChange={v => upd("taxas")("taxa_app")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          <SimulatorInput label="Taxa QR Auto Atend." value={inputs.taxas.taxa_qr} onChange={v => upd("taxas")("taxa_qr")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          <SimulatorInput label="Pré-Carga" value={inputs.taxas.taxa_pre_carga} onChange={v => upd("taxas")("taxa_pre_carga")(v)} suffix="%" step={0.1} min={0} allowEmpty />
        </div>
      </SectionCard>

      {/* ── Receitas Diversas ── */}
      <SectionCard title="Receitas Diversas (Mensal)" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <LineItemRow label="Monitoramento WiFi" item={inputs.receitas_diversas.monitoramento_wifi} onChange={updLineItem("receitas_diversas", "monitoramento_wifi")} periodoLabel="Meses" />
          <LineItemRow label="Pulseiras" item={inputs.receitas_diversas.pulseiras} onChange={updLineItem("receitas_diversas", "pulseiras")} periodoLabel="Meses" />
          <LineItemRow label="Ativação de Cartão" item={inputs.receitas_diversas.ativacao_cartao} onChange={updLineItem("receitas_diversas", "ativacao_cartao")} periodoLabel="Dias" />
          <LineItemRow label="Licença Software" item={inputs.receitas_diversas.licenca_software} onChange={updLineItem("receitas_diversas", "licenca_software")} periodoLabel="Meses" />
          <LineItemRow label="SmartPOS" item={inputs.receitas_diversas.smartpos} onChange={updLineItem("receitas_diversas", "smartpos")} periodoLabel="Meses" />
          <LineItemRow label="Backup SmartPOS" item={inputs.receitas_diversas.backup_smartpos} onChange={updLineItem("receitas_diversas", "backup_smartpos")} periodoLabel="Meses" />
          <LineItemRow label="PDV" item={inputs.receitas_diversas.pdv_receita} onChange={updLineItem("receitas_diversas", "pdv_receita")} periodoLabel="Meses" />
          <LineItemRow label="Backup PDV" item={inputs.receitas_diversas.backup_pdv_receita} onChange={updLineItem("receitas_diversas", "backup_pdv_receita")} periodoLabel="Meses" />
          <LineItemRow label="Totem Grande" item={inputs.receitas_diversas.totem_grande} onChange={updLineItem("receitas_diversas", "totem_grande")} periodoLabel="Meses" />
          <LineItemRow label="Totem Médio" item={inputs.receitas_diversas.totem_medio} onChange={updLineItem("receitas_diversas", "totem_medio")} periodoLabel="Meses" />
          <LineItemRow label="Totem Preto" item={inputs.receitas_diversas.totem_preto} onChange={updLineItem("receitas_diversas", "totem_preto")} periodoLabel="Meses" />
          <LineItemRow label="Outros" item={inputs.receitas_diversas.outros} onChange={updLineItem("receitas_diversas", "outros")} periodoLabel="Meses" />
        </div>
      </SectionCard>

      {/* ── Receitas Setup ── */}
      <SectionCard title="Receitas de Setup" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <LineItemRow label="Setup Sistema" item={inputs.receitas_setup.setup_sistema} onChange={updLineItem("receitas_setup", "setup_sistema")} periodoLabel="Qtd" />
          <LineItemRow label="Setup WiFi" item={inputs.receitas_setup.setup_wifi} onChange={updLineItem("receitas_setup", "setup_wifi")} periodoLabel="Qtd" />
          <LineItemRow label="Cartões Personalizados" item={inputs.receitas_setup.cartoes_personalizados} onChange={updLineItem("receitas_setup", "cartoes_personalizados")} periodoLabel="Qtd" />
          <LineItemRow label="Cartões Padrão Zig" item={inputs.receitas_setup.cartoes_padrao} onChange={updLineItem("receitas_setup", "cartoes_padrao")} periodoLabel="Qtd" />
        </div>
      </SectionCard>

      {/* ── Custos Equipamentos ── */}
      <SectionCard title="Custos de Equipamentos" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <LineItemRow label="PDV" item={inputs.custos_equipamentos.pdv} onChange={updLineItem("custos_equipamentos", "pdv")} periodoLabel="Meses" />
          <LineItemRow label="Backup PDV" item={inputs.custos_equipamentos.backup_pdv} onChange={updLineItem("custos_equipamentos", "backup_pdv")} periodoLabel="Meses" />
          <LineItemRow label="Internet 4G" item={inputs.custos_equipamentos.internet_4g} onChange={updLineItem("custos_equipamentos", "internet_4g")} periodoLabel="Meses" />
          <LineItemRow label="Backup Internet" item={inputs.custos_equipamentos.backup_internet} onChange={updLineItem("custos_equipamentos", "backup_internet")} periodoLabel="Meses" />
          <LineItemRow label="Cartões Comodato" item={inputs.custos_equipamentos.cartoes_comodato} onChange={updLineItem("custos_equipamentos", "cartoes_comodato")} periodoLabel="Meses" />
          <LineItemRow label="SmartPOS" item={inputs.custos_equipamentos.smartpos} onChange={updLineItem("custos_equipamentos", "smartpos")} periodoLabel="Meses" />
          <LineItemRow label="Backup SmartPOS" item={inputs.custos_equipamentos.backup_smartpos} onChange={updLineItem("custos_equipamentos", "backup_smartpos")} periodoLabel="Meses" />
          <LineItemRow label="Totem Grande" item={inputs.custos_equipamentos.totem_grande} onChange={updLineItem("custos_equipamentos", "totem_grande")} periodoLabel="Meses" />
          <LineItemRow label="Totem Médio" item={inputs.custos_equipamentos.totem_medio} onChange={updLineItem("custos_equipamentos", "totem_medio")} periodoLabel="Meses" />
          <LineItemRow label="Totem Preto" item={inputs.custos_equipamentos.totem_preto} onChange={updLineItem("custos_equipamentos", "totem_preto")} periodoLabel="Meses" />
          <LineItemRow label="Outros" item={inputs.custos_equipamentos.outros} onChange={updLineItem("custos_equipamentos", "outros")} periodoLabel="Meses" />
        </div>
      </SectionCard>

      {/* ── Custos Zig ── */}
      <SectionCard title="Custos / Despesas Zig" collapsible defaultOpen={false}>
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Operação</h4>
        <div className="space-y-4">
          <LineItemRow label="Setup Licença Máquinas" item={inputs.custos_zig.setup_licenca_maquinas} onChange={updLineItem("custos_zig", "setup_licenca_maquinas")} />
          <LineItemRow label="Setup Smart" item={inputs.custos_zig.setup_smart} onChange={updLineItem("custos_zig", "setup_smart")} />
          <LineItemRow label="Backup Setup Smart" item={inputs.custos_zig.backup_setup_smart} onChange={updLineItem("custos_zig", "backup_setup_smart")} />
          <LineItemRow label="Setup PDV" item={inputs.custos_zig.setup_pdv} onChange={updLineItem("custos_zig", "setup_pdv")} />
          <LineItemRow label="Backup Setup PDV" item={inputs.custos_zig.backup_setup_pdv} onChange={updLineItem("custos_zig", "backup_setup_pdv")} />
        </div>
        <h4 className="text-xs font-semibold text-muted-foreground mt-6 mb-3 uppercase">Customer Success</h4>
        <LineItemRow label="Gerente de Conta" item={inputs.custos_zig.gerente_conta} onChange={updLineItem("custos_zig", "gerente_conta")} />
        <h4 className="text-xs font-semibold text-muted-foreground mt-6 mb-3 uppercase">Internet e WiFi</h4>
        <div className="space-y-4">
          <LineItemRow label="Instalação WiFi" item={inputs.custos_zig.instalacao_wifi} onChange={updLineItem("custos_zig", "instalacao_wifi")} />
          <LineItemRow label="Monitoramento WiFi" item={inputs.custos_zig.monitoramento_wifi} onChange={updLineItem("custos_zig", "monitoramento_wifi")} />
          <LineItemRow label="Internet Link WiFi" item={inputs.custos_zig.internet_wifi} onChange={updLineItem("custos_zig", "internet_wifi")} />
        </div>
        <h4 className="text-xs font-semibold text-muted-foreground mt-6 mb-3 uppercase">Cartões e Pulseiras</h4>
        <div className="space-y-4">
          <LineItemRow label="Pulseiras" item={inputs.custos_zig.pulseiras} onChange={updLineItem("custos_zig", "pulseiras")} />
          <LineItemRow label="Cartões Personalizados" item={inputs.custos_zig.cartoes_personalizados} onChange={updLineItem("custos_zig", "cartoes_personalizados")} />
          <LineItemRow label="Cartões Padrão" item={inputs.custos_zig.cartoes_padrao} onChange={updLineItem("custos_zig", "cartoes_padrao")} />
          <LineItemRow label="Cartões Extraviados" item={inputs.custos_zig.cartoes_extraviados} onChange={updLineItem("custos_zig", "cartoes_extraviados")} periodoLabel="Dias" />
          <LineItemRow label="Devolução Cartões (R$7)" item={inputs.custos_zig.devolucao_cartoes} onChange={updLineItem("custos_zig", "devolucao_cartoes")} periodoLabel="Dias" />
          <LineItemRow label="Devolução por Água" item={inputs.custos_zig.devolucao_cartoes_agua} onChange={updLineItem("custos_zig", "devolucao_cartoes_agua")} periodoLabel="Dias" />
        </div>
      </SectionCard>
    </div>
  );
};
