export interface MCCEntry {
  mcc: string;
  apuracao: string;
  custo_software: number;
  custo_pix: number;
  custo_debito: number;
  custo_credito: number;
  custo_antecipacao: number;
  custo_maquinas: number;
}

// Extracted from the official Zig pricing spreadsheet
export const MCC_TABLE: MCCEntry[] = [
  { mcc: "5300", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0070, custo_credito: 0.0145, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5499", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0077, custo_credito: 0.0145, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7991", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0181, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7999", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0075, custo_credito: 0.0187, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5199", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0072, custo_credito: 0.0126, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5812", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0077, custo_credito: 0.0198, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5813", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0191, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5814", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0077, custo_credito: 0.0155, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "4722", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0180, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5411", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0075, custo_credito: 0.0143, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5462", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0168, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5651", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0077, custo_credito: 0.0191, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5811", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0077, custo_credito: 0.0193, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5921", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0168, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5941", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0075, custo_credito: 0.0202, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5983", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0079, custo_credito: 0.0149, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "5999", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0079, custo_credito: 0.0185, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "6513", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0061, custo_credito: 0.0106, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7011", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0181, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7392", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0077, custo_credito: 0.0189, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7829", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0079, custo_credito: 0.0193, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7941", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0078, custo_credito: 0.0184, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "7997", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0072, custo_credito: 0.0134, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "8211", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0055, custo_credito: 0.0087, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "8299", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0062, custo_credito: 0.0084, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "8351", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0055, custo_credito: 0.0089, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "8641", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0046, custo_credito: 0.0111, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
  { mcc: "8999", apuracao: "ZIG", custo_software: 0, custo_pix: 0.0007, custo_debito: 0.0080, custo_credito: 0.0204, custo_antecipacao: 0.0135, custo_maquinas: 0.0014 },
];

export const MCC_LABELS: Record<string, string> = {
  "5300": "5300 — Atacado",
  "5499": "5499 — Alimentação variada",
  "7991": "7991 — Atrações turísticas",
  "7999": "7999 — Recreação",
  "5199": "5199 — Materiais diversos",
  "5812": "5812 — Restaurantes",
  "5813": "5813 — Bares e casas noturnas",
  "5814": "5814 — Fast food",
  "4722": "4722 — Agências de viagem",
  "5411": "5411 — Supermercados",
  "5462": "5462 — Padarias",
  "5651": "5651 — Roupas (família)",
  "5811": "5811 — Catering",
  "5921": "5921 — Bebidas alcoólicas",
  "5941": "5941 — Artigos esportivos",
  "5983": "5983 — Combustíveis",
  "5999": "5999 — Outros varejo",
  "6513": "6513 — Imobiliários",
  "7011": "7011 — Hotéis",
  "7392": "7392 — Consultoria",
  "7829": "7829 — Entretenimento",
  "7941": "7941 — Esportes (clubes)",
  "7997": "7997 — Clubes recreativos",
  "8211": "8211 — Escolas",
  "8299": "8299 — Educação",
  "8351": "8351 — Creches",
  "8641": "8641 — Associações",
  "8999": "8999 — Serviços profissionais",
};

export function getMCCCosts(mcc: string): MCCEntry | undefined {
  return MCC_TABLE.find(e => e.mcc === mcc);
}
