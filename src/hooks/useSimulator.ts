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
  taxas: {
    taxa_plataforma: number;
    taxa_credito: number;
    taxa_pix_debito: number;
    taxa_picpay: number;
  };
  comercial: {
    rebate: number;
    imposto: number;
  };
  custos: {
    adquirencia: number;
    antifraude: number;
    comissao: number;
    servidor: number;
    custo_maquina: number;
    numero_maquinas: number;
    custo_impressao: number;
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
  receita_bruta: number;
  receita_liquida: number;
  custos_totais: number;
  margem: number;
  margem_percentual: number;
  margem_tpv: number;
  take_rate: number;
  // breakdown
  tpv_online: number;
  tpv_offline: number;
  receita_online: number;
  receita_offline: number;
  rebate_valor: number;
  impostos_valor: number;
  custo_adquirencia: number;
  custo_antifraude: number;
  custo_comissao: number;
  custo_servidor: number;
  custo_maquinas: number;
  custo_advance: number;
  receita_advance: number;
  status: "Prejuízo" | "Ruim" | "Média" | "Boa";
}

export type DealStatus = SimulatorResults["status"];

export const getDefaultInputs = (): SimulatorInputs => ({
  evento: { publico: 1000, ticket_medio: 800, duracao_meses: 12, lugar_marcado: false },
  distribuicao: { online_percent: 0.99, offline_percent: 0.01 },
  pagamentos_online: { credito: 0.70, pix_debito: 0.25, picpay: 0.05 },
  taxas: { taxa_plataforma: 0.10, taxa_credito: 0.025, taxa_pix_debito: 0.015, taxa_picpay: 0.015 },
  comercial: { rebate: 0.02, imposto: 0.0655 },
  custos: { adquirencia: 0.022, antifraude: 0.003, comissao: 0.05, servidor: 0.0005, custo_maquina: 40, numero_maquinas: 10, custo_impressao: 0.10 },
  advance: { ativo: false, share_credito: 1.0, taxa: 0.00, custo: 0.0129 },
});

export function useSimulator(inputs: SimulatorInputs): SimulatorResults {
  return useMemo(() => {
    const TPV = inputs.evento.publico * inputs.evento.ticket_medio;
    const tpv_online = TPV * inputs.distribuicao.online_percent;
    const tpv_offline = TPV * inputs.distribuicao.offline_percent;

    const receita_online = tpv_online * inputs.taxas.taxa_plataforma;
    const ingressos_offline = inputs.evento.publico * inputs.distribuicao.offline_percent;
    const receita_offline = ingressos_offline * inputs.custos.custo_impressao;
    const receita_bruta = receita_online + receita_offline;

    const rebate_valor = TPV * inputs.comercial.rebate;
    const impostos_valor = receita_bruta * inputs.comercial.imposto;
    const deducoes = rebate_valor + impostos_valor;
    const receita_liquida = receita_bruta - deducoes;

    const custo_adquirencia = tpv_online * (
      (inputs.pagamentos_online.credito * inputs.taxas.taxa_credito) +
      (inputs.pagamentos_online.pix_debito * inputs.taxas.taxa_pix_debito) +
      (inputs.pagamentos_online.picpay * inputs.taxas.taxa_picpay)
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
      tpv: TPV, receita_bruta, receita_liquida, custos_totais, margem,
      margem_percentual, margem_tpv, take_rate,
      tpv_online, tpv_offline, receita_online, receita_offline,
      rebate_valor, impostos_valor, custo_adquirencia, custo_antifraude,
      custo_comissao, custo_servidor, custo_maquinas, custo_advance, receita_advance,
      status,
    };
  }, [inputs]);
}
