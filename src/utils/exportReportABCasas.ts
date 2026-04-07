import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ABCasasResults, ABCasasInputs } from "@/hooks/useSimulatorABCasas";
import { MCC_LABELS } from "@/data/mccTable";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => v.toFixed(2) + "%";

const ZIG_BLUE: [number, number, number] = [29, 78, 216];
const LIGHT_BLUE: [number, number, number] = [219, 234, 254];
const GRAY_BG: [number, number, number] = [243, 244, 246];
const DANGER_RED: [number, number, number] = [220, 38, 38];

const statusColors: Record<string, [number, number, number]> = {
  "Negativo": [0, 0, 0], "Ruim": DANGER_RED, "Atenção": [217, 119, 6],
  "Saudável": [37, 99, 235], "Boa": [0, 111, 98], "Excelente": [34, 139, 84],
};

function drawSectionHeader(doc: jsPDF, y: number, title: string, color: [number, number, number] = ZIG_BLUE): number {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(14, y, 182, 8, 1.5, 1.5, "F");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 18, y + 5.5);
  doc.setTextColor(0);
  return y + 12;
}

function drawKeyValue(doc: jsPDF, y: number, label: string, value: string, x1 = 16, x2 = 110): number {
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(label, x1, y);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(value, x2, y);
  doc.setFont("helvetica", "normal");
  return y + 5.5;
}

export function exportABCasasPDF(
  results: ABCasasResults,
  inputs: ABCasasInputs,
  idViabilidade?: string,
  idHub?: string,
  idProposta?: string,
) {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const clienteName = inputs.cliente.nome || "—";
  const mccLabel = MCC_LABELS[inputs.cliente.mcc] || inputs.cliente.mcc;
  const sc = statusColors[results.status] || [0, 0, 0];

  // HEADER
  doc.setFillColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
  doc.rect(0, 0, 210, 32, "F");
  doc.setFontSize(16); doc.setTextColor(255); doc.setFont("helvetica", "bold");
  doc.text("Simulador Zig — Viabilidade AEB Casas", 14, 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Gerado em ${dateStr} às ${timeStr}`, 14, 22);
  doc.text("Documento confidencial", 14, 27);
  doc.setTextColor(0);

  let y = 40;

  // Client boxes
  doc.setFillColor(GRAY_BG[0], GRAY_BG[1], GRAY_BG[2]);
  doc.roundedRect(14, y, 88, 28, 2, 2, "F");
  doc.setFontSize(8); doc.setTextColor(100); doc.text("CLIENTE", 18, y + 5);
  doc.setFontSize(11); doc.setTextColor(0); doc.setFont("helvetica", "bold");
  doc.text(clienteName, 18, y + 12);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80);
  doc.text(`MCC: ${mccLabel}`, 18, y + 18);
  doc.text(`Casa · ${inputs.configuracao.cashless_ficha === "cashless" ? "Cashless" : "Ficha"} · 30 dias`, 18, y + 24);

  doc.setFillColor(GRAY_BG[0], GRAY_BG[1], GRAY_BG[2]);
  doc.roundedRect(108, y, 88, 28, 2, 2, "F");
  doc.setFontSize(8); doc.setTextColor(100); doc.text("COMERCIAL", 112, y + 5);
  doc.setFontSize(11); doc.setTextColor(0); doc.setFont("helvetica", "bold");
  doc.text(inputs.cliente.comercial || "—", 112, y + 12);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80);
  doc.text(`Regional: ${inputs.cliente.regional || "—"}`, 112, y + 18);
  const ids = [idViabilidade && `V: ${idViabilidade}`, idHub && `Hub: ${idHub}`, idProposta && `P: ${idProposta}`].filter(Boolean).join(" · ");
  if (ids) doc.text(ids, 112, y + 24);

  y += 36;

  // RESUMO
  y = drawSectionHeader(doc, y, "RESUMO — AEB CASAS");
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(14, y, 182, 14, 2, 2, "F");
  doc.setFontSize(13); doc.setTextColor(255); doc.setFont("helvetica", "bold");
  doc.text(`Classificação: ${results.status}`, 20, y + 6);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Margem: ${pct(results.margem_estimada)}   |   Resultado: ${fmt(results.resultado_recorrente)}   |   MG: ${fmt(results.minimo_garantido)}`, 20, y + 12);
  doc.setTextColor(0);
  y += 20;

  const metrics = [
    { label: "Faturamento Bruto", value: fmt(results.faturamento_bruto) },
    { label: "Receita Total", value: fmt(results.total_geral_receitas) },
    { label: "Take Rate Recorrente", value: pct(results.take_rate_recorrente) },
    { label: "Mínimo Garantido", value: fmt(results.minimo_garantido) },
  ];
  const boxW = 42;
  metrics.forEach((m, i) => {
    const x = 14 + i * (boxW + 4);
    doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
    doc.roundedRect(x, y, boxW, 18, 1.5, 1.5, "F");
    doc.setFontSize(7); doc.setTextColor(80); doc.text(m.label, x + 3, y + 5);
    doc.setFontSize(10); doc.setTextColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
    doc.setFont("helvetica", "bold"); doc.text(m.value, x + 3, y + 13);
    doc.setFont("helvetica", "normal");
  });
  doc.setTextColor(0);
  y += 24;

  // TAXAS
  y = drawSectionHeader(doc, y, "TAXAS E CONFIGURAÇÃO");
  const col1X = 16, col1V = 80, col2X = 110, col2V = 174;
  let yL = y, yR = y;
  doc.setFontSize(8); doc.setTextColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
  doc.setFont("helvetica", "bold"); doc.text("TAXAS NEGOCIADAS", col1X, yL);
  doc.setFont("helvetica", "normal"); yL += 6;
  yL = drawKeyValue(doc, yL, "Taxa ADM", pct(inputs.taxas.taxa_adm), col1X, col1V);
  yL = drawKeyValue(doc, yL, "Débito V/M", pct(inputs.taxas.taxa_debito_visa_master), col1X, col1V);
  yL = drawKeyValue(doc, yL, "Débito Outros", pct(inputs.taxas.taxa_debito_outros), col1X, col1V);
  yL = drawKeyValue(doc, yL, "Pix", pct(inputs.taxas.taxa_pix), col1X, col1V);
  yL = drawKeyValue(doc, yL, "Crédito V/M", pct(inputs.taxas.taxa_credito_visa_master), col1X, col1V);
  yL = drawKeyValue(doc, yL, "Crédito Outros", pct(inputs.taxas.taxa_credito_outros), col1X, col1V);
  yL = drawKeyValue(doc, yL, "Antecipação", inputs.configuracao.antecipado_100 ? "N/A (ativa)" : pct(inputs.taxas.taxa_antecipacao), col1X, col1V);

  doc.setFontSize(8); doc.setTextColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
  doc.setFont("helvetica", "bold"); doc.text("DISTRIBUIÇÃO (SPLIT)", col2X, yR);
  doc.setFont("helvetica", "normal"); yR += 6;
  yR = drawKeyValue(doc, yR, "Dinheiro", pct(inputs.faturamento.split_dinheiro), col2X, col2V);
  yR = drawKeyValue(doc, yR, "Débito V/M", pct(inputs.faturamento.split_debito_visa_master), col2X, col2V);
  yR = drawKeyValue(doc, yR, "Débito Outros", pct(inputs.faturamento.split_debito_outros), col2X, col2V);
  yR = drawKeyValue(doc, yR, "Pix", pct(inputs.faturamento.split_pix), col2X, col2V);
  yR = drawKeyValue(doc, yR, "Crédito V/M", pct(inputs.faturamento.split_credito_visa_master), col2X, col2V);
  yR = drawKeyValue(doc, yR, "Crédito Outros", pct(inputs.faturamento.split_credito_outros), col2X, col2V);

  y = Math.max(yL, yR) + 4;

  // DEMONSTRATIVO
  y = drawSectionHeader(doc, y, "DEMONSTRATIVO FINANCEIRO");

  const rows: string[][] = [
    ["── FATURAMENTO ──", ""],
    ["Faturamento Bruto", fmt(results.faturamento_bruto)],
    ["Dinheiro", fmt(results.faturamento_dinheiro)],
    ["Débito Visa/Master", fmt(results.faturamento_debito_vm)],
    ["Débito Outros", fmt(results.faturamento_debito_outros)],
    ["Pix", fmt(results.faturamento_pix)],
    ["Crédito Visa/Master", fmt(results.faturamento_credito_vm)],
    ["Crédito Outros", fmt(results.faturamento_credito_outros)],
  ];
  if (results.faturamento_app > 0) rows.push(["App", fmt(results.faturamento_app)]);
  if (results.faturamento_qr > 0) rows.push(["QR Auto Atend.", fmt(results.faturamento_qr)]);

  rows.push(["", ""], ["── RECEITAS COM TAXAS ──", ""],
    ["Taxa ADM (Software)", fmt(results.receita_taxa_adm)],
    ["Débito V/M", fmt(results.receita_debito_vm)],
    ["Débito Outros", fmt(results.receita_debito_outros)],
    ["Pix", fmt(results.receita_pix)],
    ["Crédito V/M", fmt(results.receita_credito_vm)],
    ["Crédito Outros", fmt(results.receita_credito_outros)],
  );
  if (results.receita_antecipacao > 0) rows.push(["Antecipação", fmt(results.receita_antecipacao)]);
  rows.push(["Total Receita Taxas", fmt(results.total_receita_taxas)]);
  rows.push(["", ""], ["Mínimo Garantido", fmt(results.minimo_garantido)]);

  if (results.total_receitas_diversas > 0) rows.push(["", ""], ["(+) Receitas Diversas", fmt(results.total_receitas_diversas)]);
  if (results.total_receitas_setup > 0) {
    rows.push(["(+) Receitas Setup", fmt(results.total_receitas_setup)]);
    rows.push(["(−) Custo Setup (35%)", fmt(results.custo_setup_automatico)]);
  }
  rows.push(["Total Geral Receitas", fmt(results.total_geral_receitas)]);

  rows.push(["", ""], ["── CUSTOS & REDUTORES ──", ""]);
  if (results.total_custos_equipamentos !== 0) rows.push(["(−) Custos Equipamentos", fmt(Math.abs(results.total_custos_equipamentos))]);
  if (results.total_custos_zig !== 0) rows.push(["(−) Custos/Despesas Zig", fmt(Math.abs(results.total_custos_zig))]);
  rows.push(["(−) Adquirência Débito", fmt(results.custo_adq_debito)]);
  if (results.custo_adq_credito_d30 > 0) rows.push(["(−) Crédito D+30", fmt(results.custo_adq_credito_d30)]);
  if (results.custo_adq_credito_d2 > 0) rows.push(["(−) Crédito D+2", fmt(results.custo_adq_credito_d2)]);
  rows.push(["(−) Redutor PIX", fmt(results.custo_pix_redutor)]);
  rows.push(["(−) Custo Máquinas", fmt(results.custo_maquinas)]);
  rows.push(["Total Adquirência + Máq.", fmt(Math.abs(results.total_custos_adquirencia))]);
  rows.push(["", ""],
    ["(−) Impostos Setup (6,55%)", fmt(results.impostos_setup)],
    ["(−) Impostos Recorrente (6,55%)", fmt(results.impostos_recorrente)],
    ["Total Impostos", fmt(Math.abs(results.total_impostos))],
    ["", ""], ["Redutores Total", fmt(Math.abs(results.redutores_total))],
    ["", ""], ["── RESULTADO ──", ""],
    ["Resultado Recorrente", fmt(results.resultado_recorrente)],
    ["Resultado 1º Mês", fmt(results.resultado_primeiro_mes)],
    ["Mínimo Garantido", fmt(results.minimo_garantido)],
    ["Margem Estimada", pct(results.margem_estimada)],
    ["Take Rate Recorrente", pct(results.take_rate_recorrente)],
    ["Take Rate 1º Mês", pct(results.take_rate_primeiro_mes)],
    ["Classificação", results.status],
  );

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: ZIG_BLUE },
    styles: { fontSize: 8.5, cellPadding: 2 },
    didParseCell: (data) => {
      const label = String(data.cell.raw);
      if (["Total Receita Taxas", "Total Geral Receitas", "Total Adquirência + Máq.", "Total Impostos", "Redutores Total", "Resultado Recorrente", "Resultado 1º Mês", "Faturamento Bruto", "Mínimo Garantido"].includes(label)) {
        data.cell.styles.fontStyle = "bold";
      }
      if (label.startsWith("──")) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [229, 231, 235];
        data.cell.styles.textColor = ZIG_BLUE;
      }
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text(`Zig — Viabilidade AEB Casas · ${clienteName} · ${dateStr}`, 14, 290);
    doc.text(`Página ${i}/${pageCount}`, 185, 290);
  }

  doc.save(`Viabilidade AEB Casas (${clienteName}).pdf`);
}
