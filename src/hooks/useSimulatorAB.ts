import { useMemo } from "react";
import { getMCCCosts } from "@/data/mccTable";

// ── Constants ──
export const AB_CONSTANTS = {
  imposto: 0.0655,
  deprec_pdv: 18,
  deprec_totem_grande: 18,
  deprec_totem_medio: 18,
  deprec_totem_preto: 12,
  deprec_cartao: 12,
  custo_cartao_cipurse: 5.10,
  custo_cartao_mifare: 3.50,
  valor_smartpos_mensal_casa: 50,
  valor_smartpos_mensal_evento: 20,
  valor_pdv_mensal: 50,
  valor_internet_4g: 10,
  valor_totem_grande_mensal: 666.67,
  valor_totem_medio_mensal: 388.89,
  valor_totem_preto_mensal: 333.33,
  setup_smart: 10,
  setup_pdv: 10,
};

// ── Line Item ──
export interface LineItem {
  valor: number;
  qtd: number;
  periodo: number; // meses ou dias, conforme contexto
}

const li = (valor = 0, qtd = 0, periodo = 1): LineItem => ({ valor, qtd, periodo });

// ── Inputs ──
export interface ABInputs {
  cliente: {
    nome: string;
    mcc: string;
    regional: string;
    polo: string;
    comercial: string;
    tipo_negociacao: string;
  };
  configuracao: {
    tipo: "casa" | "evento";
    cashless_ficha: "cashless" | "ficha";
    tipo_chip: "cipurse" | "mifare";
    periodo_cobranca: "mensal" | "diario";
    comodato: boolean;
    dias_funcionamento: number;
    adquirencia_zig: "segmentada" | "unica";
    antecipado_100: boolean;
    dias_operacao_assistida: number;
  };
  faturamento: {
    total: number;
    split_dinheiro: number;
    split_debito: number;
    split_pix: number;
    split_credito: number;
    split_app: number;
    split_qr: number;
  };
  info_adicional: {
    publico_diario: number;
    cartoes_personalizados: number;
    cartoes_padrao: number;
    cartoes_comodato: number;
  };
  taxas: {
    taxa_adm: number;
    taxa_debito: number;
    taxa_pix: number;
    taxa_credito: number;
    taxa_antecipacao: number;
    taxa_app: number;
    taxa_qr: number;
    taxa_pre_carga: number;
  };
  receitas_diversas: {
    monitoramento_wifi: LineItem;
    pulseiras: LineItem;
    ativacao_cartao: LineItem;
    licenca_software: LineItem;
    smartpos: LineItem;
    backup_smartpos: LineItem;
    pdv_receita: LineItem;
    backup_pdv_receita: LineItem;
    totem_grande: LineItem;
    totem_medio: LineItem;
    totem_preto: LineItem;
    outros: LineItem;
  };
  receitas_setup: {
    setup_sistema: LineItem;
    setup_wifi: LineItem;
    cartoes_personalizados: LineItem;
    cartoes_padrao: LineItem;
  };
  custos_equipamentos: {
    pdv: LineItem;
    backup_pdv: LineItem;
    internet_4g: LineItem;
    backup_internet: LineItem;
    cartoes_comodato: LineItem;
    smartpos: LineItem;
    backup_smartpos: LineItem;
    totem_grande: LineItem;
    totem_medio: LineItem;
    totem_preto: LineItem;
    outros: LineItem;
  };
  custos_zig: {
    setup_licenca_maquinas: LineItem;
    setup_smart: LineItem;
    backup_setup_smart: LineItem;
    setup_pdv: LineItem;
    backup_setup_pdv: LineItem;
    gerente_conta: LineItem;
    instalacao_wifi: LineItem;
    monitoramento_wifi: LineItem;
    internet_wifi: LineItem;
    pulseiras: LineItem;
    cartoes_personalizados: LineItem;
    cartoes_padrao: LineItem;
    cartoes_extraviados: LineItem;
    devolucao_cartoes: LineItem;
    devolucao_cartoes_agua: LineItem;
  };
}

// ── Results ──
export interface ABResults {
  faturamento_bruto: number;
  faturamento_dinheiro: number;
  faturamento_debito: number;
  faturamento_pix: number;
  faturamento_credito: number;
  faturamento_app: number;
  faturamento_qr: number;
  faturamento_cartao: number;

  receita_taxa_adm: number;
  receita_debito: number;
  receita_pix: number;
  receita_credito: number;
  receita_antecipacao: number;
  receita_app: number;
  receita_qr: number;
  receita_pre_carga: number;
  total_receita_taxas: number;

  mg_calculado_min: number;
  mg_calculado_max: number;

  total_receitas_diversas: number;
  total_receitas_setup: number;
  total_geral_receitas: number;

  total_custos_equipamentos: number;
  total_custos_zig: number;

  custo_adq_debito: number;
  custo_adq_credito_d30: number;
  custo_adq_credito_d2: number;
  custo_adq_antecipacao: number;
  total_custos_adquirencia: number;

  impostos_setup: number;
  impostos_recorrente: number;
  total_impostos: number;

  redutores_total: number;
  resultado_recorrente: number;
  resultado_primeiro_mes: number;
  margem_estimada: number;
  take_rate_recorrente: number;
  take_rate_primeiro_mes: number;

  status: "Excelente" | "Boa" | "Saudável" | "Atenção" | "Ruim" | "Negativo";
  alerta: boolean;
}

// ── Defaults ──
export const getDefaultABInputs = (): ABInputs => ({
  cliente: { nome: "", mcc: "5812", regional: "", polo: "", comercial: "", tipo_negociacao: "1a proposta" },
  configuracao: {
    tipo: "casa",
    cashless_ficha: "cashless",
    tipo_chip: "cipurse",
    periodo_cobranca: "mensal",
    comodato: true,
    dias_funcionamento: 25,
    adquirencia_zig: "segmentada",
    antecipado_100: false,
    dias_operacao_assistida: 3,
  },
  faturamento: { total: 0, split_dinheiro: 10, split_debito: 30, split_pix: 5, split_credito: 55, split_app: 0, split_qr: 0 },
  info_adicional: { publico_diario: 0, cartoes_personalizados: 0, cartoes_padrao: 0, cartoes_comodato: 0 },
  taxas: { taxa_adm: 0.80, taxa_debito: 1.00, taxa_pix: 1.00, taxa_credito: 1.80, taxa_antecipacao: 1.50, taxa_app: 3.50, taxa_qr: 3.50, taxa_pre_carga: 4.00 },
  receitas_diversas: {
    monitoramento_wifi: li(350, 0, 1), pulseiras: li(25, 0, 1), ativacao_cartao: li(0, 0, 25),
    licenca_software: li(0, 0, 1), smartpos: li(0, 0, 1), backup_smartpos: li(0, 0, 1),
    pdv_receita: li(0, 0, 1), backup_pdv_receita: li(0, 0, 1),
    totem_grande: li(0, 0, 1), totem_medio: li(0, 0, 1), totem_preto: li(550, 0, 1), outros: li(0, 0, 1),
  },
  receitas_setup: { setup_sistema: li(0, 0, 1), setup_wifi: li(0, 0, 1), cartoes_personalizados: li(8, 0, 1), cartoes_padrao: li(7, 0, 1) },
  custos_equipamentos: {
    pdv: li(50, 0, 1), backup_pdv: li(50, 0, 1), internet_4g: li(10, 0, 1), backup_internet: li(10, 0, 1),
    cartoes_comodato: li(0.43, 0, 1), smartpos: li(50, 0, 1), backup_smartpos: li(50, 0, 1),
    totem_grande: li(666.67, 0, 1), totem_medio: li(388.89, 0, 1), totem_preto: li(333.33, 0, 1), outros: li(0, 0, 1),
  },
  custos_zig: {
    setup_licenca_maquinas: li(0, 0, 1), setup_smart: li(10, 0, 1), backup_setup_smart: li(10, 0, 1),
    setup_pdv: li(10, 0, 1), backup_setup_pdv: li(10, 0, 1), gerente_conta: li(0, 1, 0),
    instalacao_wifi: li(1500, 0, 1), monitoramento_wifi: li(350, 0, 1), internet_wifi: li(0, 0, 1),
    pulseiras: li(20, 0, 1), cartoes_personalizados: li(7, 0, 1), cartoes_padrao: li(5.10, 0, 1),
    cartoes_extraviados: li(5.10, 0, 25), devolucao_cartoes: li(7, 0, 25), devolucao_cartoes_agua: li(0, 0, 25),
  },
});

// ── Helper ──
const calcLine = (item: LineItem): number => item.valor * item.qtd * item.periodo;

// ── Hook ──
export function useSimulatorAB(inputs: ABInputs): ABResults {
  return useMemo(() => {
    const fat = inputs.faturamento;
    const FAT = fat.total;
    const splitTotal = fat.split_dinheiro + fat.split_debito + fat.split_pix + fat.split_credito + fat.split_app + fat.split_qr;

    const pctDinheiro = splitTotal > 0 ? fat.split_dinheiro / 100 : 0;
    const pctDebito = splitTotal > 0 ? fat.split_debito / 100 : 0;
    const pctPix = splitTotal > 0 ? fat.split_pix / 100 : 0;
    const pctCredito = splitTotal > 0 ? fat.split_credito / 100 : 0;
    const pctApp = splitTotal > 0 ? fat.split_app / 100 : 0;
    const pctQr = splitTotal > 0 ? fat.split_qr / 100 : 0;

    const faturamento_dinheiro = FAT * pctDinheiro;
    const faturamento_debito = FAT * pctDebito;
    const faturamento_pix = FAT * pctPix;
    const faturamento_credito = FAT * pctCredito;
    const faturamento_app = FAT * pctApp;
    const faturamento_qr = FAT * pctQr;
    const faturamento_cartao = faturamento_credito + faturamento_debito;

    // ── Receita com Taxas ──
    const txAdm = inputs.taxas.taxa_adm / 100;
    const txDeb = inputs.taxas.taxa_debito / 100;
    const txPix = inputs.taxas.taxa_pix / 100;
    const txCred = inputs.taxas.taxa_credito / 100;
    const txAntec = inputs.taxas.taxa_antecipacao / 100;
    const txApp = inputs.taxas.taxa_app / 100;
    const txQr = inputs.taxas.taxa_qr / 100;
    const txPreCarga = inputs.taxas.taxa_pre_carga / 100;

    const receita_taxa_adm = FAT * txAdm;
    const receita_debito = faturamento_debito * txDeb;
    const receita_pix = faturamento_pix * txPix;
    const receita_credito = faturamento_credito * txCred;
    const receita_antecipacao = inputs.configuracao.antecipado_100 ? faturamento_credito * txAntec : 0;
    const receita_app = faturamento_app * txApp;
    const receita_qr = faturamento_qr * txQr;
    const receita_pre_carga = 0; // Only if pre-charge model active

    const total_receita_taxas = receita_taxa_adm + receita_debito + receita_pix + receita_credito + receita_antecipacao + receita_app + receita_qr + receita_pre_carga;

    // ── Mínimo / Máximo Garantido ──
    const mg_calculado_min = total_receita_taxas * 0.70;
    const mg_calculado_max = total_receita_taxas * 1.05;

    // ── Receitas Diversas ──
    const rd = inputs.receitas_diversas;
    const total_receitas_diversas =
      calcLine(rd.monitoramento_wifi) + calcLine(rd.pulseiras) + calcLine(rd.ativacao_cartao) +
      calcLine(rd.licenca_software) + calcLine(rd.smartpos) + calcLine(rd.backup_smartpos) +
      calcLine(rd.pdv_receita) + calcLine(rd.backup_pdv_receita) +
      calcLine(rd.totem_grande) + calcLine(rd.totem_medio) + calcLine(rd.totem_preto) + calcLine(rd.outros);

    // ── Receitas Setup ──
    const rs = inputs.receitas_setup;
    const total_receitas_setup =
      calcLine(rs.setup_sistema) + calcLine(rs.setup_wifi) + calcLine(rs.cartoes_personalizados) + calcLine(rs.cartoes_padrao);

    const total_geral_receitas = total_receita_taxas + total_receitas_diversas + total_receitas_setup;

    // ── Custos Equipamentos ──
    const ce = inputs.custos_equipamentos;
    const total_custos_equipamentos = -(
      calcLine(ce.pdv) + calcLine(ce.backup_pdv) + calcLine(ce.internet_4g) + calcLine(ce.backup_internet) +
      calcLine(ce.cartoes_comodato) + calcLine(ce.smartpos) + calcLine(ce.backup_smartpos) +
      calcLine(ce.totem_grande) + calcLine(ce.totem_medio) + calcLine(ce.totem_preto) + calcLine(ce.outros)
    );

    // ── Custos Zig ──
    const cz = inputs.custos_zig;
    const total_custos_zig = -(
      calcLine(cz.setup_licenca_maquinas) + calcLine(cz.setup_smart) + calcLine(cz.backup_setup_smart) +
      calcLine(cz.setup_pdv) + calcLine(cz.backup_setup_pdv) + calcLine(cz.gerente_conta) +
      calcLine(cz.instalacao_wifi) + calcLine(cz.monitoramento_wifi) + calcLine(cz.internet_wifi) +
      calcLine(cz.pulseiras) + calcLine(cz.cartoes_personalizados) + calcLine(cz.cartoes_padrao) +
      calcLine(cz.cartoes_extraviados) + calcLine(cz.devolucao_cartoes) + calcLine(cz.devolucao_cartoes_agua)
    );

    // ── Custos Adquirência (from MCC table) ──
    const mccData = getMCCCosts(inputs.cliente.mcc);
    const debito_total_adq = faturamento_debito + faturamento_pix; // débito + pix volume for acquiring
    const credito_total_adq = faturamento_credito;

    let custo_adq_debito = 0;
    let custo_adq_credito_d30 = 0;
    let custo_adq_credito_d2 = 0;
    let custo_adq_antecipacao = 0;

    if (mccData) {
      custo_adq_debito = debito_total_adq * mccData.custo_debito;
      if (inputs.configuracao.antecipado_100) {
        // All credit is D+2 (anticipated)
        custo_adq_credito_d2 = credito_total_adq * (mccData.custo_credito + mccData.custo_antecipacao);
      } else {
        custo_adq_credito_d30 = credito_total_adq * mccData.custo_credito;
      }
      custo_adq_antecipacao = inputs.configuracao.antecipado_100 ? credito_total_adq * mccData.custo_antecipacao : 0;
    }

    const total_custos_adquirencia = -(custo_adq_debito + custo_adq_credito_d30 + custo_adq_credito_d2);

    // ── Impostos ──
    const impostos_setup = total_receitas_setup * AB_CONSTANTS.imposto;
    const impostos_recorrente = (total_receita_taxas + total_receitas_diversas) * AB_CONSTANTS.imposto;
    const total_impostos = -(impostos_setup + impostos_recorrente);

    // ── Redutores ──
    const redutores_total = total_custos_equipamentos + total_custos_zig + total_custos_adquirencia + total_impostos;

    // ── Resultado ──
    const resultado_recorrente = total_receita_taxas + total_receitas_diversas + total_custos_equipamentos + total_custos_zig + total_custos_adquirencia + total_impostos;
    const resultado_primeiro_mes = resultado_recorrente + total_receitas_setup - impostos_setup;

    const margem_estimada = total_geral_receitas > 0 ? (resultado_recorrente / (total_receita_taxas + total_receitas_diversas)) * 100 : 0;
    const take_rate_recorrente = FAT > 0 ? ((total_receita_taxas + total_receitas_diversas) / FAT) * 100 : 0;
    const take_rate_primeiro_mes = FAT > 0 ? (total_geral_receitas / FAT) * 100 : 0;

    // ── Status ──
    let status: ABResults["status"];
    if (resultado_recorrente < 0) status = "Negativo";
    else if (margem_estimada < 15) status = "Ruim";
    else if (margem_estimada < 25) status = "Atenção";
    else if (margem_estimada < 35) status = "Saudável";
    else if (margem_estimada < 50) status = "Boa";
    else status = "Excelente";

    const alerta = resultado_recorrente < 0 || margem_estimada < 20;

    return {
      faturamento_bruto: FAT,
      faturamento_dinheiro, faturamento_debito, faturamento_pix, faturamento_credito,
      faturamento_app, faturamento_qr, faturamento_cartao,

      receita_taxa_adm, receita_debito, receita_pix, receita_credito,
      receita_antecipacao, receita_app, receita_qr, receita_pre_carga,
      total_receita_taxas,

      mg_calculado_min, mg_calculado_max,

      total_receitas_diversas, total_receitas_setup, total_geral_receitas,

      total_custos_equipamentos, total_custos_zig,

      custo_adq_debito, custo_adq_credito_d30, custo_adq_credito_d2, custo_adq_antecipacao,
      total_custos_adquirencia,

      impostos_setup, impostos_recorrente, total_impostos,

      redutores_total, resultado_recorrente, resultado_primeiro_mes,
      margem_estimada, take_rate_recorrente, take_rate_primeiro_mes,

      status, alerta,
    };
  }, [inputs]);
}
