import React, { useState } from "react";
import { ABCasasInputs, LineItem } from "@/hooks/useSimulatorABCasas";
import { SimulatorInput, SimulatorToggle, SimulatorTextInput } from "../simulator/SimulatorInput";
import { MCC_LABELS } from "@/data/mccTable";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";

interface Props {
  inputs: ABCasasInputs;
  setInputs: React.Dispatch<React.SetStateAction<ABCasasInputs>>;
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

const LockedField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-1">
      {label} <Lock className="w-3 h-3 text-muted-foreground/50" />
    </span>
    <div className="bg-muted/60 rounded-xl px-3 py-2.5 text-sm tabular-nums text-muted-foreground border border-border/30">{value}</div>
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

export const ABCasasInputSections: React.FC<Props> = ({ inputs, setInputs }) => {
  const upd = <K extends keyof ABCasasInputs>(section: K) =>
    <F extends keyof ABCasasInputs[K]>(field: F) =>
      (val: ABCasasInputs[K][F]) =>
        setInputs(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const updLineItem = <S extends "receitas_diversas" | "receitas_setup" | "custos_equipamentos" | "custos_zig">(
    section: S, field: keyof ABCasasInputs[S]
  ) => (item: LineItem) =>
    setInputs(prev => ({ ...prev, [section]: { ...prev[section], [field]: item } }));

  const fat = inputs.faturamento;
  const splitTotal = fat.split_dinheiro + fat.split_debito_visa_master + fat.split_debito_outros +
    fat.split_pix + fat.split_credito_visa_master + fat.split_credito_outros + fat.split_app + fat.split_qr;

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
      </SectionCard>

      {/* ── Configuração ── */}
      <SectionCard title="Configuração da Operação">
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
          <LockedField label="Dias de Funcionamento" value="30 dias (mensal)" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <SimulatorInput label="Dias Operação Assistida" value={inputs.configuracao.dias_operacao_assistida} onChange={v => upd("configuracao")("dias_operacao_assistida")(v)} min={0} allowEmpty />
          <SimulatorInput label="Total de Máquinas" value={inputs.configuracao.total_maquinas} onChange={v => upd("configuracao")("total_maquinas")(v)} min={0} allowEmpty />
        </div>
        <div className="mt-4 space-y-3">
          <SimulatorToggle label="100% Antecipado" checked={inputs.configuracao.antecipado_100} onChange={v => upd("configuracao")("antecipado_100")(v)} />
          {inputs.configuracao.antecipado_100 && (
            <p className="text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
              ⚠ Antecipação ativa: receita de antecipação não será gerada.
            </p>
          )}
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
        <SimulatorInput label="Faturamento Esperado (Mensal)" value={fat.total} onChange={v => upd("faturamento")("total")(v)} prefix="R$" min={0} allowEmpty />
        <p className="text-xs text-muted-foreground mt-2 mb-3">Distribuição separada por Visa/Master e Outros</p>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SimulatorInput label="Dinheiro %" value={fat.split_dinheiro} onChange={v => upd("faturamento")("split_dinheiro")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Débito V/M %" value={fat.split_debito_visa_master} onChange={v => upd("faturamento")("split_debito_visa_master")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Débito Outros %" value={fat.split_debito_outros} onChange={v => upd("faturamento")("split_debito_outros")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Pix %" value={fat.split_pix} onChange={v => upd("faturamento")("split_pix")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Crédito V/M %" value={fat.split_credito_visa_master} onChange={v => upd("faturamento")("split_credito_visa_master")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="Crédito Outros %" value={fat.split_credito_outros} onChange={v => upd("faturamento")("split_credito_outros")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="App %" value={fat.split_app} onChange={v => upd("faturamento")("split_app")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
          <SimulatorInput label="QR Auto Atend. %" value={fat.split_qr} onChange={v => upd("faturamento")("split_qr")(v)} suffix="%" step={1} min={0} max={100} allowEmpty />
        </div>
        {splitTotal !== 100 && splitTotal > 0 && (
          <p className="text-xs text-destructive mt-2 font-medium">⚠ Soma das distribuições: {splitTotal}% (deve ser 100%)</p>
        )}
        {fat.total > 0 && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ReadOnly label="Dinheiro" value={`R$ ${fmt(fat.total * fat.split_dinheiro / 100)}`} />
            <ReadOnly label="Débito V/M" value={`R$ ${fmt(fat.total * fat.split_debito_visa_master / 100)}`} />
            <ReadOnly label="Débito Outros" value={`R$ ${fmt(fat.total * fat.split_debito_outros / 100)}`} />
            <ReadOnly label="Pix" value={`R$ ${fmt(fat.total * fat.split_pix / 100)}`} />
            <ReadOnly label="Crédito V/M" value={`R$ ${fmt(fat.total * fat.split_credito_visa_master / 100)}`} />
            <ReadOnly label="Crédito Outros" value={`R$ ${fmt(fat.total * fat.split_credito_outros / 100)}`} />
            {fat.split_app > 0 && <ReadOnly label="App" value={`R$ ${fmt(fat.total * fat.split_app / 100)}`} />}
            {fat.split_qr > 0 && <ReadOnly label="QR" value={`R$ ${fmt(fat.total * fat.split_qr / 100)}`} />}
          </div>
        )}
      </SectionCard>

      {/* ── Taxas ── */}
      <SectionCard title="Receita com Taxas" accent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SimulatorInput label="Taxa ADM (Software)" value={inputs.taxas.taxa_adm} onChange={v => upd("taxas")("taxa_adm")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          {inputs.configuracao.adquirencia_zig === "segmentada" ? (
            <>
              <SimulatorInput label="Débito Visa/Master" value={inputs.taxas.taxa_debito_visa_master} onChange={v => upd("taxas")("taxa_debito_visa_master")(v)} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Débito Outros" value={inputs.taxas.taxa_debito_outros} onChange={v => upd("taxas")("taxa_debito_outros")(v)} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Taxa Pix" value={inputs.taxas.taxa_pix} onChange={v => upd("taxas")("taxa_pix")(v)} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Crédito Visa/Master" value={inputs.taxas.taxa_credito_visa_master} onChange={v => upd("taxas")("taxa_credito_visa_master")(v)} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Crédito Outros" value={inputs.taxas.taxa_credito_outros} onChange={v => upd("taxas")("taxa_credito_outros")(v)} suffix="%" step={0.1} min={0} allowEmpty />
            </>
          ) : (
            <>
              <SimulatorInput label="Taxa Única V/M" value={inputs.taxas.taxa_credito_visa_master} onChange={v => {
                upd("taxas")("taxa_credito_visa_master")(v);
                upd("taxas")("taxa_debito_visa_master")(v);
              }} suffix="%" step={0.1} min={0} allowEmpty />
              <SimulatorInput label="Taxa Única Outros" value={inputs.taxas.taxa_credito_outros} onChange={v => {
                upd("taxas")("taxa_credito_outros")(v);
                upd("taxas")("taxa_debito_outros")(v);
              }} suffix="%" step={0.1} min={0} allowEmpty />
            </>
          )}
          {!inputs.configuracao.antecipado_100 && (
            <SimulatorInput label="Taxa Antecipação" value={inputs.taxas.taxa_antecipacao} onChange={v => upd("taxas")("taxa_antecipacao")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          )}
          <SimulatorInput label="Taxa APP" value={inputs.taxas.taxa_app} onChange={v => upd("taxas")("taxa_app")(v)} suffix="%" step={0.1} min={0} allowEmpty />
          <SimulatorInput label="Taxa QR Auto Atend." value={inputs.taxas.taxa_qr} onChange={v => upd("taxas")("taxa_qr")(v)} suffix="%" step={0.1} min={0} allowEmpty />
        </div>
      </SectionCard>

      {/* ── Receitas Diversas (only allowed items) ── */}
      <SectionCard title="Receitas Diversas (Mensal)" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <LineItemRow label="SmartPOS" item={inputs.receitas_diversas.smartpos} onChange={updLineItem("receitas_diversas", "smartpos")} periodoLabel="Meses" />
          <LineItemRow label="Totem Ficha" item={inputs.receitas_diversas.totem_ficha} onChange={updLineItem("receitas_diversas", "totem_ficha")} periodoLabel="Meses" />
          <LineItemRow label="Totem Cashless" item={inputs.receitas_diversas.totem_cashless} onChange={updLineItem("receitas_diversas", "totem_cashless")} periodoLabel="Meses" />
          <LineItemRow label="Mini Totem" item={inputs.receitas_diversas.mini_totem} onChange={updLineItem("receitas_diversas", "mini_totem")} periodoLabel="Meses" />
          <LineItemRow label="Outros" item={inputs.receitas_diversas.outros} onChange={updLineItem("receitas_diversas", "outros")} periodoLabel="Meses" />
        </div>
      </SectionCard>

      {/* ── Receitas Setup ── */}
      <SectionCard title="Receitas de Setup" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <LineItemRow label="Setup Sistema" item={inputs.receitas_setup.setup_sistema} onChange={updLineItem("receitas_setup", "setup_sistema")} periodoLabel="Qtd" />
          <LineItemRow label="Cartões Personalizados" item={inputs.receitas_setup.cartoes_personalizados} onChange={updLineItem("receitas_setup", "cartoes_personalizados")} periodoLabel="Qtd" />
          <LineItemRow label="Cartões Padrão Zig" item={inputs.receitas_setup.cartoes_padrao} onChange={updLineItem("receitas_setup", "cartoes_padrao")} periodoLabel="Qtd" />
          <LineItemRow label="Pulseira de Borracha" item={inputs.receitas_setup.pulseira_borracha} onChange={updLineItem("receitas_setup", "pulseira_borracha")} periodoLabel="Qtd" />
          <LineItemRow label="Pulseira de Tecido" item={inputs.receitas_setup.pulseira_tecido} onChange={updLineItem("receitas_setup", "pulseira_tecido")} periodoLabel="Qtd" />
        </div>
        {/* Custo Setup automático */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Custo de Setup (35% automático): <strong className="text-foreground">
              R$ {fmt(
                (inputs.receitas_setup.setup_sistema.valor * inputs.receitas_setup.setup_sistema.qtd * inputs.receitas_setup.setup_sistema.periodo +
                 inputs.receitas_setup.cartoes_personalizados.valor * inputs.receitas_setup.cartoes_personalizados.qtd * inputs.receitas_setup.cartoes_personalizados.periodo +
                 inputs.receitas_setup.cartoes_padrao.valor * inputs.receitas_setup.cartoes_padrao.qtd * inputs.receitas_setup.cartoes_padrao.periodo +
                 inputs.receitas_setup.pulseira_borracha.valor * inputs.receitas_setup.pulseira_borracha.qtd * inputs.receitas_setup.pulseira_borracha.periodo +
                 inputs.receitas_setup.pulseira_tecido.valor * inputs.receitas_setup.pulseira_tecido.qtd * inputs.receitas_setup.pulseira_tecido.periodo
                ) * 0.35
              )}
            </strong></span>
          </div>
        </div>
      </SectionCard>

      {/* ── Custos Equipamentos ── */}
      <SectionCard title="Custos de Equipamentos" collapsible defaultOpen={false}>
        <div className="space-y-4">
          <LineItemRow label="SmartPOS" item={inputs.custos_equipamentos.smartpos} onChange={updLineItem("custos_equipamentos", "smartpos")} periodoLabel="Meses" />
          <LineItemRow label="Backup SmartPOS" item={inputs.custos_equipamentos.backup_smartpos} onChange={updLineItem("custos_equipamentos", "backup_smartpos")} periodoLabel="Meses" />
          <LineItemRow label="Totem Ficha" item={inputs.custos_equipamentos.totem_ficha} onChange={updLineItem("custos_equipamentos", "totem_ficha")} periodoLabel="Meses" />
          <LineItemRow label="Totem Cashless" item={inputs.custos_equipamentos.totem_cashless} onChange={updLineItem("custos_equipamentos", "totem_cashless")} periodoLabel="Meses" />
          <LineItemRow label="Mini Totem" item={inputs.custos_equipamentos.mini_totem} onChange={updLineItem("custos_equipamentos", "mini_totem")} periodoLabel="Meses" />
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
        </div>
        <h4 className="text-xs font-semibold text-muted-foreground mt-6 mb-3 uppercase">Customer Success</h4>
        <LineItemRow label="Gerente de Conta" item={inputs.custos_zig.gerente_conta} onChange={updLineItem("custos_zig", "gerente_conta")} />
        <h4 className="text-xs font-semibold text-muted-foreground mt-6 mb-3 uppercase">Cartões e Pulseiras</h4>
        <div className="space-y-4">
          <LineItemRow label="Cartões Personalizados" item={inputs.custos_zig.cartoes_personalizados} onChange={updLineItem("custos_zig", "cartoes_personalizados")} />
          <LineItemRow label="Cartões Padrão" item={inputs.custos_zig.cartoes_padrao} onChange={updLineItem("custos_zig", "cartoes_padrao")} />
          <LineItemRow label="Cartões Extraviados" item={inputs.custos_zig.cartoes_extraviados} onChange={updLineItem("custos_zig", "cartoes_extraviados")} periodoLabel="Dias" />
          <LineItemRow label="Devolução Cartões (R$7)" item={inputs.custos_zig.devolucao_cartoes} onChange={updLineItem("custos_zig", "devolucao_cartoes")} periodoLabel="Dias" />
          <LineItemRow label="Devolução por Água" item={inputs.custos_zig.devolucao_cartoes_agua} onChange={updLineItem("custos_zig", "devolucao_cartoes_agua")} periodoLabel="Dias" />
          <LineItemRow label="Pulseiras de Borracha" item={inputs.custos_zig.pulseiras_borracha} onChange={updLineItem("custos_zig", "pulseiras_borracha")} />
          <LineItemRow label="Pulseiras de Tecido" item={inputs.custos_zig.pulseiras_tecido} onChange={updLineItem("custos_zig", "pulseiras_tecido")} />
        </div>
        {/* Custos automáticos */}
        <div className="mt-6 pt-4 border-t border-border space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Custos Automáticos
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <ReadOnly label="Custo PIX (redutor)" value={`Automático`} />
            <ReadOnly label="Custo Máquinas" value={`R$ ${fmt(inputs.configuracao.total_maquinas * 40)} (${inputs.configuracao.total_maquinas} × R$ 40)`} />
          </div>
        </div>
      </SectionCard>

      {/* ── Mínimo Garantido ── */}
      <SectionCard title="Mínimo Garantido">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span>
            MG Calculado: <strong className="text-primary">
              R$ {fmt(inputs.configuracao.total_maquinas <= 3
                ? 750
                : 750 + (inputs.configuracao.total_maquinas - 3) * 50
              )}
            </strong>
            <span className="text-muted-foreground text-xs ml-2">
              ({inputs.configuracao.total_maquinas <= 3
                ? "até 3 máquinas = R$ 750"
                : `R$ 750 + ${inputs.configuracao.total_maquinas - 3} × R$ 50`
              })
            </span>
          </span>
        </div>
      </SectionCard>
    </div>
  );
};
