import { useMemo } from "react";

// ── Constants ──
export const CONSTANTS = {
  imposto: 0.0655,
  comissao: 0.05,
  // Online cost percentages
  online_custos: {
    credito_antecipado: 0.0129,
    advance_tomada: 0.0105,
    advance_dinheiro: 0.0,
    adquirencia: 0.022,
    patrocinio: 0.0105,
    antifraude: 0.003,
    comissao: 0.05,
    servidor: 0.0005,
  },
  // Offline cost percentages
  offline_custos: {
    adquirencia: 0.024,
    impressao: 0.0,
    custo_maquina: 40,
  },
  adquirencia_online: { credito: 0.025, debito_pix: 0.015, picpay: 0.015 },
  adquirencia_offline: { credito: 0.03, debito_pix: 0.0099 },
  split_online: { credito: 0.70, debito_pix: 0.25, picpay: 0.05 },
  split_offline: { credito: 0.70, debito_pix: 0.30 },
  custo_maquina: 40,
  custo_impressao_default: 0.10,
};

export const COMMISSION_TIERS = [
  { label: "Regua 1", range: "<= 80%", fator: 0.03, comissao: 90 },
  { label: "Regua 2", range: "> 80% x <= 100%", fator: 0.04, comissao: 121 },
  { label: "Regua 3", range: "> 100% x <= 120%", fator: 0.05, comissao: 151 },
  { label: "Regua 4", range: "> 120%", fator: 0.06, comissao: 181 },
];

export interface SimulatorInputs {
  cliente: {
    nome: string;
    cnpj: string;
    executivo: string;
    tipo: "pontual" | "anual";
    tempo_contrato: number; // meses
    exclusividade: boolean;
    tempo_exclusividade: number; // meses
  };
  evento: {
    tpv_total: number;
    publico_estimado: number;
    ticket_medio_calculado: number;
  };
  distribuicao: {
    online_percent: number;
  };
  taxa: {
    taxa_administrativa: number;
    rebate: number;
    taxa_antecipacao: number;
    taxa_processamento: number;
    taxa_minima_ativa: boolean;
    valor_taxa_minima: number;
  };
  pdv: {
    tpv_pdv: number;
    quantidade_maquinas: number;
    ingressos_esperados: number;
    taxa_segmentada: boolean;
    taxa_unica: number;
    taxa_credito: number;
    taxa_debito_pix: number;
    custo_impressao_ingresso: number;
    custo_impressao_cortesia: number;
    custo_cancelamento: number;
    mg_por_maquina: number;
  };
  extras: {
    advance_ativo: boolean;
    advance_valor: number;
    advance_juros_am: number;
    patrocinio_ativo: boolean;
    patrocinio_valor: number;
    pulse_pago_ativo: boolean;
    pulse_pago_valor: number;
    suporte_premium_ativo: boolean;
    suporte_premium_tipo: "percentual" | "setup";
    suporte_premium_percentual: number;
    suporte_premium_setup: number;
  };
}

export interface PdvResults {
  tpv_total: number;
  tpv_credito: number;
  tpv_debito_pix: number;
  receita_credito: number;
  receita_debito_pix: number;
  receita_total: number;
  custo_impressao: number;
  custo_maquinas: number;
  mg_total: number;
  receita_liquida_operacional: number;
  resultado_final: number;
}

export interface SimulatorResults {
  tpv: number;
  tpv_online: number;
  tpv_offline: number;

  custo_adquirencia_online: number;
  custo_adquirencia_offline: number;
  custo_adquirencia_total: number;

  taxa_liquida: number;
  rebate_valor: number;
  receita_take: number;
  receita_antecipacao: number;
  receita_processamento: number;
  receita_minima: number;
  receita_bruta: number;

  impostos_valor: number;
  receita_liquida: number;

  custo_antifraude: number;
  custo_comissao: number;
  custo_servidor: number;
  custo_maquinas: number;
  custo_impressao: number;
  custos_totais: number;

  margem: number;
  margem_sobre_tpv: number;

  ticket_medio: number;

  advance_receita_juros: number;
  patrocinio_valor: number;
  pulse_pago_valor: number;
  suporte_premium_elegivel: boolean;
  suporte_premium_receita: number;

  status: "Excelente" | "Boa" | "Saudável" | "Atenção";
  alerta: boolean;

  pdv: PdvResults;
}

export type DealStatus = SimulatorResults["status"];

export const getDefaultInputs = (): SimulatorInputs => ({
  cliente: { nome: "", cnpj: "", executivo: "", tipo: "pontual", tempo_contrato: 0, exclusividade: false, tempo_exclusividade: 0 },
  evento: { tpv_total: 0, publico_estimado: 0, ticket_medio_calculado: 0 },
  distribuicao: { online_percent: 0.99 },
  taxa: {
    taxa_administrativa: 0.12,
    rebate: 0,
    taxa_antecipacao: 0,
    taxa_processamento: 0,
    taxa_minima_ativa: false,
    valor_taxa_minima: 2.50,
  },
  pdv: {
    tpv_pdv: 0,
    quantidade_maquinas: 0,
    ingressos_esperados: 0,
    taxa_segmentada: false,
    taxa_unica: 0.10,
    taxa_credito: 0.10,
    taxa_debito_pix: 0.10,
    custo_impressao_ingresso: 1.00,
    custo_impressao_cortesia: 1.00,
    custo_cancelamento: 0.50,
    mg_por_maquina: 40,
  },
  extras: {
    advance_ativo: false,
    advance_valor: 0,
    advance_juros_am: 2.5,
    patrocinio_ativo: false,
    patrocinio_valor: 0,
    pulse_pago_ativo: false,
    pulse_pago_valor: 0,
    suporte_premium_ativo: false,
    suporte_premium_tipo: "percentual",
    suporte_premium_percentual: 0,
    suporte_premium_setup: 0,
  },
});

export function useSimulator(inputs: SimulatorInputs): SimulatorResults {
  return useMemo(() => {
    const C = CONSTANTS;
    const TPV = inputs.evento.tpv_total;
    const offline_percent = 1 - inputs.distribuicao.online_percent;
    const tpv_online = TPV * inputs.distribuicao.online_percent;
    const tpv_offline = TPV * offline_percent;

    // Ticket médio calculado
    const ticket_medio = inputs.evento.publico_estimado > 0
      ? TPV / inputs.evento.publico_estimado
      : 0;

    // ── Adquirência ──
    const custo_adquirencia_online =
      tpv_online * C.split_online.credito * C.adquirencia_online.credito +
      tpv_online * C.split_online.debito_pix * C.adquirencia_online.debito_pix +
      tpv_online * C.split_online.picpay * C.adquirencia_online.picpay;

    const custo_adquirencia_offline =
      tpv_offline * C.split_offline.credito * C.adquirencia_offline.credito +
      tpv_offline * C.split_offline.debito_pix * C.adquirencia_offline.debito_pix;

    const custo_adquirencia_total = custo_adquirencia_online + custo_adquirencia_offline;

    // ── Taxa líquida (administrativa − rebate) ──
    const taxa_liquida = inputs.taxa.taxa_administrativa - inputs.taxa.rebate;
    const rebate_valor = tpv_online * inputs.taxa.rebate;

    // ── Receita ──
    const receita_take = TPV * taxa_liquida;

    // Antecipação: receita sobre TPV total
    const receita_antecipacao = TPV * inputs.taxa.taxa_antecipacao;

    // Processamento: receita sobre vendas em crédito online
    const receita_processamento = tpv_online * C.split_online.credito * inputs.taxa.taxa_processamento;

    let receita_minima = 0;
    if (ticket_medio > 0 && ticket_medio < 25) {
      receita_minima = inputs.evento.publico_estimado * inputs.taxa.valor_taxa_minima;
    }

    const receita_bruta = Math.max(receita_take, receita_minima) + receita_antecipacao + receita_processamento;

    // ── Impostos ──
    const impostos_valor = receita_bruta * C.imposto;
    const receita_liquida = receita_bruta - impostos_valor;

    // ── Custos ──
    const custo_antifraude = tpv_online * C.online_custos.antifraude;
    const custo_comissao = receita_liquida * C.comissao;
    const custo_servidor = TPV * C.online_custos.servidor;
    const custo_maquinas = 0; // removed online machines
    const custo_impressao = inputs.evento.publico_estimado * C.custo_impressao_default;
        // Nota: custo_impressao usa valor padrão (R$ 0,10/ingresso online). Impressão PDV é calculada separadamente em pdv_custo_impressao.

    const custos_totais =
      custo_adquirencia_total +
      custo_antifraude +
      custo_comissao +
      custo_servidor +
      custo_maquinas +
      custo_impressao;

    // ── Extras ──
    const ext = inputs.extras;
    const advance_receita_juros = ext.advance_ativo ? ext.advance_valor * (ext.advance_juros_am / 100) : 0;
    const patrocinio_valor = ext.patrocinio_ativo ? ext.patrocinio_valor : 0;
    const pulse_pago_valor = ext.pulse_pago_ativo ? ext.pulse_pago_valor : 0;

    // ── Suporte Premium ──
    // Elegível: pontual >= 75k OU agência com >= 300k em contrato <= 3 meses
    const isPontual = inputs.cliente.tipo === "pontual";
    const suporte_premium_elegivel = isPontual
      ? TPV >= 75000
      : (TPV >= 300000 && inputs.cliente.tempo_contrato > 0 && inputs.cliente.tempo_contrato <= 3);
    
    let suporte_premium_receita = 0;
    if (ext.suporte_premium_ativo && suporte_premium_elegivel) {
      if (ext.suporte_premium_tipo === "percentual") {
        suporte_premium_receita = receita_bruta * (ext.suporte_premium_percentual / 100);
      } else {
        suporte_premium_receita = ext.suporte_premium_setup;
      }
    }

    // ── Margem ──
    const margem = receita_liquida - custos_totais + advance_receita_juros - patrocinio_valor + pulse_pago_valor + suporte_premium_receita;
    const margem_sobre_tpv = TPV !== 0 ? (margem / TPV) * 100 : 0;

    let status: SimulatorResults["status"];
    if (margem_sobre_tpv >= 7) status = "Excelente";
    else if (margem_sobre_tpv >= 5) status = "Boa";
    else if (margem_sobre_tpv >= 3) status = "Saudável";
    else status = "Atenção";

    const alerta = margem <= 0 || margem_sobre_tpv < 1;

    // ── PDV (ignorado se 100% online) ──
    const is100Online = inputs.distribuicao.online_percent >= 1;
    const pdvIn = inputs.pdv;
    const pdv_tpv = is100Online ? 0 : pdvIn.tpv_pdv;
    const pdv_tpv_credito = pdv_tpv * C.split_offline.credito;
    const pdv_tpv_debito = pdv_tpv * C.split_offline.debito_pix;

    // Revenue
    let pdv_receita_credito: number;
    let pdv_receita_debito: number;
    if (pdvIn.taxa_segmentada) {
      pdv_receita_credito = pdv_tpv_credito * pdvIn.taxa_credito;
      pdv_receita_debito = pdv_tpv_debito * pdvIn.taxa_debito_pix;
    } else {
      pdv_receita_credito = pdv_tpv_credito * pdvIn.taxa_unica;
      pdv_receita_debito = pdv_tpv_debito * pdvIn.taxa_unica;
    }
    const pdv_receita_total = pdv_receita_credito + pdv_receita_debito;

    // Costs
    const pdv_custo_impressao = pdvIn.taxa_segmentada ? pdvIn.ingressos_esperados * pdvIn.custo_impressao_ingresso : 0;
    const pdv_custo_maquinas = pdvIn.quantidade_maquinas * C.custo_maquina;

    // MG
    const pdv_mg_total = pdvIn.quantidade_maquinas * pdvIn.mg_por_maquina;

    // Result
    const pdv_receita_liquida_op = pdv_receita_total - pdv_custo_impressao - pdv_custo_maquinas;
    const pdv_resultado_final = Math.max(pdv_receita_liquida_op, pdv_mg_total);

    const pdv: PdvResults = {
      tpv_total: pdv_tpv,
      tpv_credito: pdv_tpv_credito,
      tpv_debito_pix: pdv_tpv_debito,
      receita_credito: pdv_receita_credito,
      receita_debito_pix: pdv_receita_debito,
      receita_total: pdv_receita_total,
      custo_impressao: pdv_custo_impressao,
      custo_maquinas: pdv_custo_maquinas,
      mg_total: pdv_mg_total,
      receita_liquida_operacional: pdv_receita_liquida_op,
      resultado_final: pdv_resultado_final,
    };

    return {
      tpv: TPV, tpv_online, tpv_offline,
      custo_adquirencia_online, custo_adquirencia_offline, custo_adquirencia_total,
      taxa_liquida, rebate_valor, receita_take, receita_antecipacao, receita_processamento, receita_minima, receita_bruta,
      impostos_valor, receita_liquida,
      custo_antifraude, custo_comissao, custo_servidor, custo_maquinas, custo_impressao,
      custos_totais,
      margem, margem_sobre_tpv,
      ticket_medio,
      advance_receita_juros, patrocinio_valor, pulse_pago_valor,
      status, alerta,
      pdv,
    };
  }, [inputs]);
}
