import { useMemo } from "react";
import { getMCCCosts } from "@/data/mccTable";

// ── Constants ──
export const AB_CASAS_CONSTANTS = {
  imposto: 0.0655,
  dias_funcionamento: 30,
  custo_cartao_cipurse: 5.10,
  custo_cartao_mifare: 3.50,
  valor_smartpos_mensal: 50,
  valor_totem_ficha_mensal: 666.67,
  valor_totem_cashless_mensal: 388.89,
  valor_mini_totem_mensal: 333.33,
  setup_smart: 10,
  custo_setup_pct: 0.35, // 35% da receita de setup
  mg_base: 750,         // R$750 até 3 máquinas
  mg_extra_por_maquina: 50, // R$50 por máquina acima de 3
  custo_pix_redutor: 0.009, // custo/redutor PIX
  custo_maquina: 40,
};

export interface LineItem {
  valor: number;
  qtd: number;
  periodo: number;
}

const li = (valor = 0, qtd = 0, periodo = 1): LineItem => ({ valor, qtd, periodo });

// ── Inputs ──
export interface ABCasasInputs {
  cliente: {
    nome: string;
    mcc: string;
    regional: string;
    polo: string;
    comercial: string;
  };
  configuracao: {
    cashless_ficha: "cashless" | "ficha";
    tipo_chip: "cipurse" | "mifare";
    adquirencia_zig: "segmentada" | "unica";
    antecipado_100: boolean;
    dias_operacao_assistida: number;
    total_maquinas: number;
  };
  faturamento: {
    total: number;
    split_dinheiro: number;
    split_debito_visa_master: number;
    split_debito_outros: number;
    split_pix: number;
    split_credito_visa_master: number;
    split_credito_outros: number;
    split_app: number;
    split_qr: number;
  };
  taxas: {
    taxa_adm: number;
    taxa_debito_visa_master: number;
    taxa_debito_outros: number;
    taxa_pix: number;
    taxa_credito_visa_master: number;
    taxa_credito_outros: number;
    taxa_antecipacao: number;
    taxa_app: number;
    taxa_qr: number;
  };
  receitas_diversas: {
    smartpos: LineItem;
    totem_ficha: LineItem;
    totem_cashless: LineItem;
    mini_totem: LineItem;
    outros: LineItem;
  };
  receitas_setup: {
    setup_sistema: LineItem;
    cartoes_personalizados: LineItem;
    cartoes_padrao: LineItem;
    pulseira_borracha: LineItem;
    pulseira_tecido: LineItem;
  };
  custos_equipamentos: {
    smartpos: LineItem;
    backup_smartpos: LineItem;
    totem_ficha: LineItem;
    totem_cashless: LineItem;
    mini_totem: LineItem;
    outros: LineItem;
  };
  custos_zig: {
    setup_licenca_maquinas: LineItem;
    setup_smart: LineItem;
    backup_setup_smart: LineItem;
    gerente_conta: LineItem;
    cartoes_personalizados: LineItem;
    cartoes_padrao: LineItem;
    cartoes_extraviados: LineItem;
    devolucao_cartoes: LineItem;
    devolucao_cartoes_agua: LineItem;
    pulseiras_borracha: LineItem;
    pulseiras_tecido: LineItem;
  };
}

// ── Results ──
export interface ABCasasResults {
  faturamento_bruto: number;
  faturamento_dinheiro: number;
  faturamento_debito_vm: number;
  faturamento_debito_outros: number;
  faturamento_pix: number;
  faturamento_credito_vm: number;
  faturamento_credito_outros: number;
  faturamento_app: number;
  faturamento_qr: number;

  receita_taxa_adm: number;
  receita_debito_vm: number;
  receita_debito_outros: number;
  receita_pix: number;
  receita_credito_vm: number;
  receita_credito_outros: number;
  receita_antecipacao: number;
  receita_app: number;
  receita_qr: number;
  total_receita_taxas: number;

  minimo_garantido: number;

  total_receitas_diversas: number;
  total_receitas_setup: number;
  custo_setup_automatico: number;
  total_geral_receitas: number;

  total_custos_equipamentos: number;
  total_custos_zig: number;

  custo_adq_debito: number;
  custo_adq_credito_d30: number;
  custo_adq_credito_d2: number;
  custo_pix_redutor: number;
  custo_maquinas: number;
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
export const getDefaultABCasasInputs = (): ABCasasInputs => ({
  cliente: { nome: "", mcc: "5812", regional: "", polo: "", comercial: "" },
  configuracao: {
    cashless_ficha: "cashless",
    tipo_chip: "cipurse",
    adquirencia_zig: "segmentada",
    antecipado_100: false,
    dias_operacao_assistida: 3,
    total_maquinas: 3,
  },
  faturamento: {
    total: 0,
    split_dinheiro: 10,
    split_debito_visa_master: 20,
    split_debito_outros: 10,
    split_pix: 5,
    split_credito_visa_master: 35,
    split_credito_outros: 20,
    split_app: 0,
    split_qr: 0,
  },
  taxas: {
    taxa_adm: 0.80,
    taxa_debito_visa_master: 1.00,
    taxa_debito_outros: 1.20,
    taxa_pix: 1.00,
    taxa_credito_visa_master: 1.80,
    taxa_credito_outros: 2.00,
    taxa_antecipacao: 1.50,
    taxa_app: 3.50,
    taxa_qr: 3.50,
  },
  receitas_diversas: {
    smartpos: li(0, 0, 1),
    totem_ficha: li(0, 0, 1),
    totem_cashless: li(0, 0, 1),
    mini_totem: li(550, 0, 1),
    outros: li(0, 0, 1),
  },
  receitas_setup: {
    setup_sistema: li(0, 0, 1),
    cartoes_personalizados: li(8, 0, 1),
    cartoes_padrao: li(7, 0, 1),
    pulseira_borracha: li(0, 0, 1),
    pulseira_tecido: li(0, 0, 1),
  },
  custos_equipamentos: {
    smartpos: li(50, 0, 1),
    backup_smartpos: li(50, 0, 1),
    totem_ficha: li(666.67, 0, 1),
    totem_cashless: li(388.89, 0, 1),
    mini_totem: li(333.33, 0, 1),
    outros: li(0, 0, 1),
  },
  custos_zig: {
    setup_licenca_maquinas: li(0, 0, 1),
    setup_smart: li(10, 0, 1),
    backup_setup_smart: li(10, 0, 1),
    gerente_conta: li(0, 1, 0),
    cartoes_personalizados: li(7, 0, 1),
    cartoes_padrao: li(5.10, 0, 1),
    cartoes_extraviados: li(5.10, 0, 30),
    devolucao_cartoes: li(7, 0, 30),
    devolucao_cartoes_agua: li(0, 0, 30),
    pulseiras_borracha: li(0, 0, 1),
    pulseiras_tecido: li(0, 0, 1),
  },
});

const calcLine = (item: LineItem): number => item.valor * item.qtd * item.periodo;

// ── Hook ──
export function useSimulatorABCasas(inputs: ABCasasInputs): ABCasasResults {
  return useMemo(() => {
    const fat = inputs.faturamento;
    const FAT = fat.total;
    const splitTotal = fat.split_dinheiro + fat.split_debito_visa_master + fat.split_debito_outros +
      fat.split_pix + fat.split_credito_visa_master + fat.split_credito_outros + fat.split_app + fat.split_qr;

    const pct = (v: number) => splitTotal > 0 ? v / 100 : 0;

    const faturamento_dinheiro = FAT * pct(fat.split_dinheiro);
    const faturamento_debito_vm = FAT * pct(fat.split_debito_visa_master);
    const faturamento_debito_outros = FAT * pct(fat.split_debito_outros);
    const faturamento_pix = FAT * pct(fat.split_pix);
    const faturamento_credito_vm = FAT * pct(fat.split_credito_visa_master);
    const faturamento_credito_outros = FAT * pct(fat.split_credito_outros);
    const faturamento_app = FAT * pct(fat.split_app);
    const faturamento_qr = FAT * pct(fat.split_qr);

    // ── Receita com Taxas ──
    const tx = inputs.taxas;
    const receita_taxa_adm = FAT * (tx.taxa_adm / 100);
    const receita_debito_vm = faturamento_debito_vm * (tx.taxa_debito_visa_master / 100);
    const receita_debito_outros = faturamento_debito_outros * (tx.taxa_debito_outros / 100);
    const receita_pix = faturamento_pix * (tx.taxa_pix / 100);
    const receita_credito_vm = faturamento_credito_vm * (tx.taxa_credito_visa_master / 100);
    const receita_credito_outros = faturamento_credito_outros * (tx.taxa_credito_outros / 100);
    // Se antecipação ativa → NÃO gera receita de antecipação
    const faturamento_credito_total = faturamento_credito_vm + faturamento_credito_outros;
    const receita_antecipacao = inputs.configuracao.antecipado_100 ? 0 : faturamento_credito_total * (tx.taxa_antecipacao / 100);
    const receita_app = faturamento_app * (tx.taxa_app / 100);
    const receita_qr = faturamento_qr * (tx.taxa_qr / 100);

    const total_receita_taxas = receita_taxa_adm + receita_debito_vm + receita_debito_outros +
      receita_pix + receita_credito_vm + receita_credito_outros + receita_antecipacao + receita_app + receita_qr;

    // ── Mínimo Garantido ──
    const maq = inputs.configuracao.total_maquinas;
    const minimo_garantido = maq <= 3
      ? AB_CASAS_CONSTANTS.mg_base
      : AB_CASAS_CONSTANTS.mg_base + (maq - 3) * AB_CASAS_CONSTANTS.mg_extra_por_maquina;

    // ── Receitas Diversas ──
    const rd = inputs.receitas_diversas;
    const total_receitas_diversas = calcLine(rd.smartpos) + calcLine(rd.totem_ficha) +
      calcLine(rd.totem_cashless) + calcLine(rd.mini_totem) + calcLine(rd.outros);

    // ── Receitas Setup ──
    const rs = inputs.receitas_setup;
    const total_receitas_setup = calcLine(rs.setup_sistema) + calcLine(rs.cartoes_personalizados) +
      calcLine(rs.cartoes_padrao) + calcLine(rs.pulseira_borracha) + calcLine(rs.pulseira_tecido);

    // Custo Setup automático = 35% receita setup
    const custo_setup_automatico = total_receitas_setup * AB_CASAS_CONSTANTS.custo_setup_pct;

    const total_geral_receitas = total_receita_taxas + total_receitas_diversas + total_receitas_setup;

    // ── Custos Equipamentos ──
    const ce = inputs.custos_equipamentos;
    const total_custos_equipamentos = -(
      calcLine(ce.smartpos) + calcLine(ce.backup_smartpos) +
      calcLine(ce.totem_ficha) + calcLine(ce.totem_cashless) + calcLine(ce.mini_totem) + calcLine(ce.outros)
    );

    // ── Custos Zig ──
    const cz = inputs.custos_zig;
    const total_custos_zig = -(
      calcLine(cz.setup_licenca_maquinas) + calcLine(cz.setup_smart) + calcLine(cz.backup_setup_smart) +
      calcLine(cz.gerente_conta) + calcLine(cz.cartoes_personalizados) + calcLine(cz.cartoes_padrao) +
      calcLine(cz.cartoes_extraviados) + calcLine(cz.devolucao_cartoes) + calcLine(cz.devolucao_cartoes_agua) +
      calcLine(cz.pulseiras_borracha) + calcLine(cz.pulseiras_tecido) + custo_setup_automatico
    );

    // ── Custos Adquirência ──
    const mccData = getMCCCosts(inputs.cliente.mcc);
    const faturamento_debito_total = faturamento_debito_vm + faturamento_debito_outros;

    let custo_adq_debito = 0;
    let custo_adq_credito_d30 = 0;
    let custo_adq_credito_d2 = 0;

    if (mccData) {
      custo_adq_debito = faturamento_debito_total * mccData.custo_debito;
      if (inputs.configuracao.antecipado_100) {
        custo_adq_credito_d2 = faturamento_credito_total * (mccData.custo_credito + mccData.custo_antecipacao);
      } else {
        custo_adq_credito_d30 = faturamento_credito_total * mccData.custo_credito;
      }
    }

    // PIX e Máquinas (custos automáticos)
    const custo_pix_redutor = faturamento_pix * AB_CASAS_CONSTANTS.custo_pix_redutor;
    const custo_maquinas = maq * AB_CASAS_CONSTANTS.custo_maquina;

    const total_custos_adquirencia = -(custo_adq_debito + custo_adq_credito_d30 + custo_adq_credito_d2 + custo_pix_redutor + custo_maquinas);

    // ── Impostos ──
    const impostos_setup = total_receitas_setup * AB_CASAS_CONSTANTS.imposto;
    const impostos_recorrente = (total_receita_taxas + total_receitas_diversas) * AB_CASAS_CONSTANTS.imposto;
    const total_impostos = -(impostos_setup + impostos_recorrente);

    // ── Redutores ──
    const redutores_total = total_custos_equipamentos + total_custos_zig + total_custos_adquirencia + total_impostos;

    // ── Resultado ──
    const resultado_recorrente = total_receita_taxas + total_receitas_diversas + total_custos_equipamentos + total_custos_zig + total_custos_adquirencia + total_impostos;
    const resultado_primeiro_mes = resultado_recorrente + total_receitas_setup - impostos_setup;

    const baseReceita = total_receita_taxas + total_receitas_diversas;
    const margem_estimada = baseReceita > 0 ? (resultado_recorrente / baseReceita) * 100 : 0;
    const take_rate_recorrente = FAT > 0 ? (baseReceita / FAT) * 100 : 0;
    const take_rate_primeiro_mes = FAT > 0 ? (total_geral_receitas / FAT) * 100 : 0;

    let status: ABCasasResults["status"];
    if (resultado_recorrente < 0) status = "Negativo";
    else if (margem_estimada < 15) status = "Ruim";
    else if (margem_estimada < 25) status = "Atenção";
    else if (margem_estimada < 35) status = "Saudável";
    else if (margem_estimada < 50) status = "Boa";
    else status = "Excelente";

    const alerta = resultado_recorrente < 0 || margem_estimada < 20;

    return {
      faturamento_bruto: FAT,
      faturamento_dinheiro, faturamento_debito_vm, faturamento_debito_outros,
      faturamento_pix, faturamento_credito_vm, faturamento_credito_outros,
      faturamento_app, faturamento_qr,

      receita_taxa_adm, receita_debito_vm, receita_debito_outros,
      receita_pix, receita_credito_vm, receita_credito_outros,
      receita_antecipacao, receita_app, receita_qr,
      total_receita_taxas,

      minimo_garantido,

      total_receitas_diversas, total_receitas_setup, custo_setup_automatico, total_geral_receitas,

      total_custos_equipamentos, total_custos_zig,

      custo_adq_debito, custo_adq_credito_d30, custo_adq_credito_d2,
      custo_pix_redutor, custo_maquinas,
      total_custos_adquirencia,

      impostos_setup, impostos_recorrente, total_impostos,

      redutores_total, resultado_recorrente, resultado_primeiro_mes,
      margem_estimada, take_rate_recorrente, take_rate_primeiro_mes,

      status, alerta,
    };
  }, [inputs]);
}
