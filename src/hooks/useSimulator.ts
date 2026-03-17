import { useMemo } from "react";

export interface SimulatorInputs {
  evento: {
    publico: number;
    ticket_medio: number;
    duracao_meses: number;
    lugar_marcado: boolean;
  };
  distribuicao: {
    online_percent: number;
    offline_percent: number;
  };
  pagamentos_online: {
    credito: number;
    pix_debito: number;
    picpay: number;
  };
  pagamentos_pdv: {
    credito: number;
    pix_debito: number;
  };
  taxas_online: {
    taxa_administrativa: number;
    taxa_processamento_credito: number;
  };
  taxas_pdv: {
    taxa_unica_ativa: boolean;
    taxa_unica: number;
    taxa_credito: number;
    taxa_pix_debito: number;
  };
  custos_produtor_pdv: {
    impressao_ingresso: number;
    impressao_cortesias: number;
    cancelamento_impressos: number;
  };
  comercial: {
    rebate: number;
    imposto: number;
  };
  custos: {
    custo_credito: number;
    custo_pix_debito: number;
    custo_picpay: number;
    antifraude: number;
    comissao: number;
    servidor: number;
    custo_maquina: number;
    numero_maquinas: number;
  };
  advance: {
    ativo: boolean;
    share_credito: number;
    taxa: number;
    custo: number;
  };
}

export interface SimulatorResults {
  tpv: number;
  tpv_online: number;
  tpv_offline: number;
  receita_administrativa: number;
  receita_processamento: number;
  receita_online: number;
  receita_pdv: number;
  receita_produtor_pdv: number;
  receita_bruta: number;
  rebate_valor: number;
  impostos_valor: number;
  receita_liquida: number;
  custo_adquirencia: number;
  custo_antifraude: number;
  custo_comissao: number;
  custo_servidor: number;
  custo_maquinas: number;
  custo_advance: number;
  receita_advance: number;
  custos_totais: number;
  margem: number;
  margem_percentual: number;
  margem_tpv: number;
  take_rate: number;
  status: "Prejuízo" | "Ruim" | "Média" | "Boa";
}

export type DealStatus = SimulatorResults["status"];

export const getDefaultInputs = (): SimulatorInputs => ({
  evento: { publico: 1000, ticket_medio: 800, duracao_meses: 12, lugar_marcado: false },
  distribuicao: { online_percent: 0.99, offline_percent: 0.01 },
  pagamentos_online: { credito: 0.70, pix_debito: 0.25, picpay: 0.05 },
  pagamentos_pdv: { credito: 0.70, pix_debito: 0.30 },
  taxas_online: { taxa_administrativa: 0.10, taxa_processamento_credito: 0.00 },
  taxas_pdv: { taxa_unica_ativa: false, taxa_unica: 0.10, taxa_credito: 0.025, taxa_pix_debito: 0.015 },
  custos_produtor_pdv: { impressao_ingresso: 0.10, impressao_cortesias: 0.00, cancelamento_impressos: 0.00 },
  comercial: { rebate: 0.02, imposto: 0.0655 },
  custos: { custo_credito: 0.025, custo_pix_debito: 0.015, custo_picpay: 0.015, antifraude: 0.003, comissao: 0.05, servidor: 0.0005, custo_maquina: 40, numero_maquinas: 10 },
  advance: { ativo: false, share_credito: 1.0, taxa: 0.00, custo: 0.0129 },
});

export function useSimulator(inputs: SimulatorInputs): SimulatorResults {
  return useMemo(() => {
    const TPV = inputs.evento.publico * inputs.evento.ticket_medio;
    const tpv_online = TPV * inputs.distribuicao.online_percent;
    const tpv_offline = TPV * inputs.distribuicao.offline_percent;

    // --- RECEITA ONLINE ---
    const receita_administrativa = tpv_online * inputs.taxas_online.taxa_administrativa;
    const receita_processamento = tpv_online * inputs.pagamentos_online.credito * inputs.taxas_online.taxa_processamento_credito;
    const receita_online = receita_administrativa + receita_processamento;

    // --- RECEITA PDV ---
    const ingressos_offline = inputs.evento.publico * inputs.distribuicao.offline_percent;
    let receita_pdv = 0;
    let receita_produtor_pdv = 0;

    if (inputs.taxas_pdv.taxa_unica_ativa) {
      receita_pdv = tpv_offline * inputs.taxas_pdv.taxa_unica;
    } else {
      receita_pdv = tpv_offline * (
        inputs.pagamentos_pdv.credito * inputs.taxas_pdv.taxa_credito +
        inputs.pagamentos_pdv.pix_debito * inputs.taxas_pdv.taxa_pix_debito
      );
      receita_produtor_pdv =
        ingressos_offline * inputs.custos_produtor_pdv.impressao_ingresso +
        inputs.custos_produtor_pdv.impressao_cortesias +
        inputs.custos_produtor_pdv.cancelamento_impressos;
    }

    const receita_bruta = receita_online + receita_pdv + receita_produtor_pdv;

    // --- DEDUÇÕES ---
    // Rebate: devolvemos ao produtor uma % da receita online arrecadada
    const rebate_valor = receita_online * inputs.comercial.rebate;
    const impostos_valor = receita_bruta * inputs.comercial.imposto;
    const receita_liquida = receita_bruta - rebate_valor - impostos_valor;

    // --- CUSTOS ---
    const custo_adquirencia = tpv_online * (
      inputs.pagamentos_online.credito * inputs.custos.custo_credito +
      inputs.pagamentos_online.pix_debito * inputs.custos.custo_pix_debito +
      inputs.pagamentos_online.picpay * inputs.custos.custo_picpay
    );
    const custo_antifraude = tpv_online * inputs.custos.antifraude;
    const custo_comissao = receita_liquida * inputs.custos.comissao;
    const custo_servidor = TPV * inputs.custos.servidor;
    const custo_maquinas = inputs.custos.numero_maquinas * inputs.custos.custo_maquina;

    let custo_advance = 0;
    let receita_advance = 0;
    if (inputs.advance.ativo) {
      const tpv_credito = tpv_online * inputs.pagamentos_online.credito;
      receita_advance = tpv_credito * inputs.advance.taxa;
      custo_advance = tpv_credito * inputs.advance.custo;
    }

    const custos_totais = custo_adquirencia + custo_antifraude + custo_comissao + custo_servidor + custo_maquinas + custo_advance;
    const margem = receita_liquida + receita_advance - custos_totais;
    const margem_percentual = receita_liquida !== 0 ? margem / receita_liquida : 0;
    const margem_tpv = TPV !== 0 ? margem / TPV : 0;
    const take_rate = TPV !== 0 ? receita_bruta / TPV : 0;

    let status: SimulatorResults["status"];
    if (margem_percentual < 0) status = "Prejuízo";
    else if (margem_percentual < 0.2) status = "Ruim";
    else if (margem_percentual < 0.4) status = "Média";
    else status = "Boa";

    return {
      tpv: TPV, tpv_online, tpv_offline,
      receita_administrativa, receita_processamento, receita_online,
      receita_pdv, receita_produtor_pdv, receita_bruta,
      rebate_valor, impostos_valor, receita_liquida,
      custo_adquirencia, custo_antifraude, custo_comissao, custo_servidor, custo_maquinas,
      custo_advance, receita_advance, custos_totais,
      margem, margem_percentual, margem_tpv, take_rate, status,
    };
  }, [inputs]);
}
