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
    modelo: "repassada" | "absorvida";
    taxa_base: number;
    rebate: number;
    taxa_minima_ativa: boolean;
    valor_taxa_minima: number;
    limite_ticket_medio: number;
  };
  operacao: {
    quantidade_maquinas: number;
  };
  advance: {
    ativo: boolean;
    valor: number;
    taxa_juros_mensal: number;
    prazo_meses: number;
    tipo: "parcelado" | "performado";
    percentual_retencao: number;
  };
}

export interface SimulatorResults {
  tpv: number;
  tpv_online: number;
  tpv_offline: number;

  // Adquirência breakdown
  custo_adquirencia_online: number;
  custo_adquirencia_offline: number;
  custo_adquirencia_total: number;

  // Taxa & Receita
  taxa_liquida: number;
  receita_take: number;
  receita_minima: number;
  receita_bruta: number;

  // Deductions
  impostos_valor: number;
  receita_liquida: number;

  // Custos
  custo_antifraude: number;
  custo_comissao: number;
  custo_servidor: number;
  custo_maquinas: number;
  custo_impressao: number;
  custos_totais: number;

  // Margem
  margem_operacional: number;
  receita_advance: number;
  margem_final: number;
  margem_sobre_tpv: number;

  // Absorvida
  taxa_minima_calculada: number;
  taxa_sugerida: number;

  // Classification
  status: "Boa" | "Média" | "Ruim";
  alerta: boolean;
}

export type DealStatus = SimulatorResults["status"];

export const getDefaultInputs = (): SimulatorInputs => ({
  evento: { tpv_total: 0, ticket_medio: 0, quantidade_ingressos: 0 },
  distribuicao: { online_percent: 0.99 },
  taxa: {
    modelo: "repassada",
    taxa_base: 0.10,
    rebate: 0.02,
    taxa_minima_ativa: false,
    valor_taxa_minima: 2.50,
    limite_ticket_medio: 25,
  },
  operacao: { quantidade_maquinas: 10 },
  advance: {
    ativo: false,
    valor: 0,
    taxa_juros_mensal: 0.025,
    prazo_meses: 1,
    tipo: "parcelado",
    percentual_retencao: 0,
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
      inputs.evento.ticket_medio < inputs.taxa.limite_ticket_medio
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

    // ── Margem operacional ──
    const margem_operacional = receita_liquida - custos_totais;

    // ── Advance ──
    let receita_advance = 0;
    if (inputs.advance.ativo && inputs.advance.valor > 0) {
      const taxa_efetiva = Math.max(inputs.advance.taxa_juros_mensal, 0.025);
      receita_advance = inputs.advance.valor * taxa_efetiva * inputs.advance.prazo_meses;
    }

    // ── Margem final ──
    const margem_final = margem_operacional + receita_advance;
    const margem_sobre_tpv = TPV !== 0 ? (margem_final / TPV) * 100 : 0;

    // ── Taxa absorvida ──
    let taxa_minima_calculada = 0;
    let taxa_sugerida = 0;
    if (inputs.taxa.modelo === "absorvida" && TPV > 0) {
      taxa_minima_calculada = custos_totais / TPV;
      taxa_sugerida = taxa_minima_calculada + 0.02;
      if (TPV > 500000) {
        taxa_sugerida = Math.min(Math.max(taxa_sugerida, 0.07), 0.08);
      }
      // Never below cost
      taxa_sugerida = Math.max(taxa_sugerida, taxa_minima_calculada);
    }

    // ── Classificação (baseada em margem sobre TPV %) ──
    let status: SimulatorResults["status"];
    if (margem_sobre_tpv >= 7) status = "Boa";
    else if (margem_sobre_tpv >= 4) status = "Média";
    else status = "Ruim";

    const alerta = margem_final <= 0 || margem_sobre_tpv < 2;

    return {
      tpv: TPV, tpv_online, tpv_offline,
      custo_adquirencia_online, custo_adquirencia_offline, custo_adquirencia_total,
      taxa_liquida, receita_take, receita_minima, receita_bruta,
      impostos_valor, receita_liquida,
      custo_antifraude, custo_comissao, custo_servidor, custo_maquinas, custo_impressao,
      custos_totais,
      margem_operacional, receita_advance, margem_final, margem_sobre_tpv,
      taxa_minima_calculada, taxa_sugerida,
      status, alerta,
    };
  }, [inputs]);
}
