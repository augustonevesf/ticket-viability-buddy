import { useMemo } from "react";

// ── Constants (non-editable) ──
export const CONSTANTS = {
  imposto: 0.0655,
  antifraude: 0.003,
  comissao: 0.05,
  servidor: 0.0005,
  custo_maquina: 40,
  custo_impressao: 0.10,
  adquirencia_online: { credito: 0.025, debito_pix: 0.015, picpay: 0.015 },
  adquirencia_offline: { credito: 0.03, debito_pix: 0.0099 },
  split_online: { credito: 0.70, debito_pix: 0.25, picpay: 0.05 },
  split_offline: { credito: 0.70, debito_pix: 0.30 },
};

export interface SimulatorInputs {
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
}

export type DealStatus = SimulatorResults["status"];

export const getDefaultInputs = (): SimulatorInputs => ({
  evento: { tpv_total: 0, ticket_medio: 0, quantidade_ingressos: 0 },
  distribuicao: { online_percent: 0.99 },
  taxa: {
    taxa_base: 0.10,
    rebate: 0.02,
    taxa_minima_ativa: false,
    valor_taxa_minima: 2.50,
  },
  operacao: { quantidade_maquinas: 10 },
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
    const custo_impressao = inputs.evento.quantidade_ingressos * C.custo_impressao;

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

    return {
      tpv: TPV, tpv_online, tpv_offline,
      custo_adquirencia_online, custo_adquirencia_offline, custo_adquirencia_total,
      taxa_liquida, receita_take, receita_minima, receita_bruta,
      impostos_valor, receita_liquida,
      custo_antifraude, custo_comissao, custo_servidor, custo_maquinas, custo_impressao,
      custos_totais,
      margem, margem_sobre_tpv,
      status, alerta,
    };
  }, [inputs]);
}
