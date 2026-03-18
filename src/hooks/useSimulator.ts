import { useMemo } from "react";

// ── Constants (non-editable) ──
export const CONSTANTS = {
  imposto: 0.0655,
  antifraude: 0.003,
  comissao: 0.05,
  servidor: 0.0005,
  custo_maquina: 40,
  custo_impressao_default: 0.10,
  adquirencia_online: { credito: 0.025, debito_pix: 0.015, picpay: 0.015 },
  adquirencia_offline: { credito: 0.03, debito_pix: 0.0099 },
  split_online: { credito: 0.70, debito_pix: 0.25, picpay: 0.05 },
  split_offline: { credito: 0.70, debito_pix: 0.30 },
};

export interface SimulatorInputs {
  cliente: {
    nome: string;
    cnpj: string;
  };
  evento: {
    tpv_total: number;
    ticket_medio: number;
    quantidade_ingressos: number;
  };
  distribuicao: {
    online_percent: number;
  };
  taxa: {
    taxa_base: number;
    rebate: number;
    taxa_minima_ativa: boolean;
    valor_taxa_minima: number;
  };
  operacao: {
    quantidade_maquinas: number;
  };
  pdv: {
    tpv_credito: number;
    tpv_debito_pix: number;
    quantidade_maquinas: number;
    ingressos_esperados: number;
    ticket_medio: number;
    impressao_minima_por_maquina: number;
    preco_impressao: number;
    taxa_credito: number;
    taxa_debito_pix: number;
    mg_por_maquina: number;
  };
}

export interface PdvResults {
  tpv_total: number;
  pct_credito: number;
  pct_debito_pix: number;
  tpv_estimado: number;
  impressoes_esperadas: number;
  impressoes_minimas: number;
  impressoes_consideradas: number;
  custo_impressao: number;
  receita_credito: number;
  receita_debito_pix: number;
  receita_total: number;
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
  receita_take: number;
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

  status: "Boa" | "Média" | "Ruim";
  alerta: boolean;

  pdv: PdvResults;
}

export type DealStatus = SimulatorResults["status"];

export const getDefaultInputs = (): SimulatorInputs => ({
  cliente: { nome: "", cnpj: "" },
  evento: { tpv_total: 0, ticket_medio: 0, quantidade_ingressos: 0 },
  distribuicao: { online_percent: 0.99 },
  taxa: {
    taxa_base: 0.10,
    rebate: 0.02,
    taxa_minima_ativa: false,
    valor_taxa_minima: 2.50,
  },
  operacao: { quantidade_maquinas: 10 },
  pdv: {
    tpv_credito: 0,
    tpv_debito_pix: 0,
    quantidade_maquinas: 0,
    ingressos_esperados: 0,
    ticket_medio: 0,
    impressao_minima_por_maquina: 0,
    preco_impressao: 0,
    taxa_credito: 0.10,
    taxa_debito_pix: 0.10,
    mg_por_maquina: 40,
  },
});

export function useSimulator(inputs: SimulatorInputs): SimulatorResults {
  return useMemo(() => {
    const C = CONSTANTS;
    const TPV = inputs.evento.tpv_total;
    const offline_percent = 1 - inputs.distribuicao.online_percent;
    const tpv_online = TPV * inputs.distribuicao.online_percent;
    const tpv_offline = TPV * offline_percent;

    // ── Adquirência ──
    const custo_adquirencia_online =
      tpv_online * C.split_online.credito * C.adquirencia_online.credito +
      tpv_online * C.split_online.debito_pix * C.adquirencia_online.debito_pix +
      tpv_online * C.split_online.picpay * C.adquirencia_online.picpay;

    const custo_adquirencia_offline =
      tpv_offline * C.split_offline.credito * C.adquirencia_offline.credito +
      tpv_offline * C.split_offline.debito_pix * C.adquirencia_offline.debito_pix;

    const custo_adquirencia_total = custo_adquirencia_online + custo_adquirencia_offline;

    // ── Taxa líquida ──
    const taxa_liquida = Math.max(0, inputs.taxa.taxa_base - inputs.taxa.rebate);

    // ── Receita ──
    const receita_take = TPV * taxa_liquida;

    let receita_minima = 0;
    if (
      inputs.taxa.taxa_minima_ativa &&
      inputs.evento.ticket_medio > 0 &&
      inputs.evento.ticket_medio < 25
    ) {
      receita_minima = inputs.evento.quantidade_ingressos * inputs.taxa.valor_taxa_minima;
    }

    const receita_bruta = Math.max(receita_take, receita_minima);

    // ── Impostos ──
    const impostos_valor = receita_bruta * C.imposto;
    const receita_liquida = receita_bruta - impostos_valor;

    // ── Custos ──
    const custo_antifraude = tpv_online * C.antifraude;
    const custo_comissao = receita_liquida * C.comissao;
    const custo_servidor = TPV * C.servidor;
    const custo_maquinas = inputs.operacao.quantidade_maquinas * C.custo_maquina;
    const custo_impressao = inputs.evento.quantidade_ingressos * C.custo_impressao_default;

    const custos_totais =
      custo_adquirencia_total +
      custo_antifraude +
      custo_comissao +
      custo_servidor +
      custo_maquinas +
      custo_impressao;

    // ── Margem ──
    const margem = receita_liquida - custos_totais;
    const margem_sobre_tpv = TPV !== 0 ? (margem / TPV) * 100 : 0;

    // ── Classificação (6% / 4%) ──
    let status: SimulatorResults["status"];
    if (margem_sobre_tpv >= 6) status = "Boa";
    else if (margem_sobre_tpv >= 4) status = "Média";
    else status = "Ruim";

    const alerta = margem <= 0 || margem_sobre_tpv < 2;

    // ── PDV ──
    const pdvIn = inputs.pdv;
    const pdv_tpv_total = pdvIn.tpv_credito + pdvIn.tpv_debito_pix;
    const pdv_pct_credito = pdv_tpv_total > 0 ? pdvIn.tpv_credito / pdv_tpv_total : 0;
    const pdv_pct_debito = pdv_tpv_total > 0 ? pdvIn.tpv_debito_pix / pdv_tpv_total : 0;

    // TPV estimado (validação)
    const pdv_tpv_estimado = pdvIn.ingressos_esperados * pdvIn.ticket_medio;

    // Impressões
    const impressoes_esperadas = pdvIn.ingressos_esperados;
    const impressoes_minimas = pdvIn.quantidade_maquinas * pdvIn.impressao_minima_por_maquina;
    const impressoes_consideradas = Math.max(impressoes_esperadas, impressoes_minimas);
    const pdv_custo_impressao = impressoes_consideradas * pdvIn.preco_impressao;

    // Receita segmentada
    const pdv_receita_credito = pdvIn.tpv_credito * pdvIn.taxa_credito;
    const pdv_receita_debito = pdvIn.tpv_debito_pix * pdvIn.taxa_debito_pix;
    const pdv_receita_total = pdv_receita_credito + pdv_receita_debito;

    // Custo máquinas PDV
    const pdv_custo_maquinas = pdvIn.quantidade_maquinas * C.custo_maquina;

    // MG
    const pdv_mg_total = pdvIn.quantidade_maquinas * pdvIn.mg_por_maquina;

    // Resultado
    const pdv_receita_liquida_op = pdv_receita_total - pdv_custo_impressao - pdv_custo_maquinas;
    const pdv_resultado_final = Math.max(pdv_receita_liquida_op, pdv_mg_total);

    const pdv: PdvResults = {
      tpv_total: pdv_tpv_total,
      pct_credito: pdv_pct_credito,
      pct_debito_pix: pdv_pct_debito,
      tpv_estimado: pdv_tpv_estimado,
      impressoes_esperadas,
      impressoes_minimas,
      impressoes_consideradas,
      custo_impressao: pdv_custo_impressao,
      receita_credito: pdv_receita_credito,
      receita_debito_pix: pdv_receita_debito,
      receita_total: pdv_receita_total,
      custo_maquinas: pdv_custo_maquinas,
      mg_total: pdv_mg_total,
      receita_liquida_operacional: pdv_receita_liquida_op,
      resultado_final: pdv_resultado_final,
    };

    return {
      tpv: TPV, tpv_online, tpv_offline,
      custo_adquirencia_online, custo_adquirencia_offline, custo_adquirencia_total,
      taxa_liquida, receita_take, receita_minima, receita_bruta,
      impostos_valor, receita_liquida,
      custo_antifraude, custo_comissao, custo_servidor, custo_maquinas, custo_impressao,
      custos_totais,
      margem, margem_sobre_tpv,
      status, alerta,
      pdv,
    };
  }, [inputs]);
}
