import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SimulatorResults, SimulatorInputs } from "@/hooks/useSimulator";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => (v * 100).toFixed(2) + "%";

const ZIG_BLUE: [number, number, number] = [29, 78, 216];
const LIGHT_BLUE: [number, number, number] = [219, 234, 254];
const GRAY_BG: [number, number, number] = [243, 244, 246];
const SUCCESS_GREEN: [number, number, number] = [22, 163, 74];
const WARNING_AMBER: [number, number, number] = [217, 119, 6];
const DANGER_RED: [number, number, number] = [220, 38, 38];
const PURPLE: [number, number, number] = [124, 58, 237];

const statusColors: Record<string, [number, number, number]> = {
  "Atenção": DANGER_RED,
  "Saudável": WARNING_AMBER,
  "Boa": SUCCESS_GREEN,
  "Excelente": PURPLE,
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

export function exportPDF(
  results: SimulatorResults,
  inputs: SimulatorInputs,
  regiao: string,
) {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const clienteName = inputs.cliente.nome;
  const executivoName = inputs.cliente.executivo;
  const tipoContrato = inputs.cliente.tipo;
  const tempoContrato = inputs.cliente.tempo_contrato;
  const exclusividade = inputs.cliente.exclusividade;
  const cnpj = inputs.cliente.cnpj;

  const fileName = `Viabilidade Tickets (${clienteName})`;
  const sc = statusColors[results.status] || [0, 0, 0];

  // ════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════
  doc.setFillColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
  doc.rect(0, 0, 210, 32, "F");
  doc.setFontSize(16);
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.text("Simulador Zig — Viabilidade Comercial", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em ${dateStr} às ${timeStr}`, 14, 22);
  doc.text(`Documento confidencial`, 14, 27);
  doc.setTextColor(0);

  let y = 40;

  // Client info box
  doc.setFillColor(GRAY_BG[0], GRAY_BG[1], GRAY_BG[2]);
  doc.roundedRect(14, y, 88, 28, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("CLIENTE", 18, y + 5);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(clienteName, 18, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(cnpj || "—", 18, y + 18);
  doc.text(`Região: ${regiao}`, 18, y + 24);

  // Executive info box
  doc.setFillColor(GRAY_BG[0], GRAY_BG[1], GRAY_BG[2]);
  doc.roundedRect(108, y, 88, 28, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("EXECUTIVO", 112, y + 5);
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(executivoName, 112, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  const tipoLabel = tipoContrato === "pontual" ? "Evento Pontual" : "Agência Anual";
  doc.text(tipoLabel, 112, y + 18);
  const tempoLabel = `${tempoContrato} ${tempoContrato === 1 ? "mês" : "meses"}${exclusividade ? " · Exclusividade" : ""}`;
  doc.text(tempoLabel, 112, y + 24);

  y += 36;

  // ════════════════════════════════════════════
  // PARTE 1 — APROVAÇÃO DO GESTOR
  // ════════════════════════════════════════════
  y = drawSectionHeader(doc, y, "PARTE 1 — RESUMO PARA APROVAÇÃO");

  // Status badge
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(14, y, 182, 14, 2, 2, "F");
  doc.setFontSize(13);
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.text(`Classificação: ${results.status}`, 20, y + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Margem/TPV: ${results.margem_sobre_tpv.toFixed(2)}%   |   Margem: ${fmt(results.margem)}`, 20, y + 12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  y += 20;

  // Key metrics - 4 boxes
  const boxW = 42;
  const boxGap = 4;
  const metrics = [
    { label: "TPV Total", value: fmt(results.tpv) },
    { label: "Ticket Médio", value: fmt(results.ticket_medio) },
    { label: "Taxa Adm. Plataforma", value: pct(results.taxa_liquida) },
    { label: "Receita Bruta", value: fmt(results.receita_bruta) },
  ];
  metrics.forEach((m, i) => {
    const x = 14 + i * (boxW + boxGap);
    doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
    doc.roundedRect(x, y, boxW, 18, 1.5, 1.5, "F");
    doc.setFontSize(7);
    doc.setTextColor(80);
    doc.text(m.label, x + 3, y + 5);
    doc.setFontSize(10);
    doc.setTextColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
    doc.setFont("helvetica", "bold");
    doc.text(m.value, x + 3, y + 13);
    doc.setFont("helvetica", "normal");
  });
  doc.setTextColor(0);
  y += 24;

  if (results.alerta) {
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(14, y, 182, 7, 1, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(DANGER_RED[0], DANGER_RED[1], DANGER_RED[2]);
    doc.text("⚠ ALERTA: Margem próxima de zero ou negativa. Revisar condições comerciais.", 18, y + 5);
    doc.setTextColor(0);
    y += 10;
  }

  // ════════════════════════════════════════════
  // PARTE 2 — CONDIÇÕES COMERCIAIS (BACKOFFICE)
  // ════════════════════════════════════════════
  y = drawSectionHeader(doc, y, "PARTE 2 — CONDIÇÕES COMERCIAIS (CONTRATO)");

  const col1X = 16;
  const col1ValX = 80;
  const col2X = 110;
  const col2ValX = 174;

  // Left column - Taxas Online
  let yLeft = y;
  doc.setFontSize(8);
  doc.setTextColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("TAXAS ONLINE", col1X, yLeft);
  doc.setFont("helvetica", "normal");
  yLeft += 6;
  yLeft = drawKeyValue(doc, yLeft, "Taxa Administrativa", pct(inputs.taxa.taxa_administrativa), col1X, col1ValX);
  yLeft = drawKeyValue(doc, yLeft, "Rebate", pct(inputs.taxa.rebate), col1X, col1ValX);
  yLeft = drawKeyValue(doc, yLeft, "Taxa Líquida", pct(results.taxa_liquida), col1X, col1ValX);
  if (inputs.taxa.taxa_processamento > 0) {
    yLeft = drawKeyValue(doc, yLeft, "Processamento (crédito)", pct(inputs.taxa.taxa_processamento), col1X, col1ValX);
  }
  if (inputs.taxa.taxa_antecipacao > 0) {
    yLeft = drawKeyValue(doc, yLeft, "Antecipação", pct(inputs.taxa.taxa_antecipacao), col1X, col1ValX);
  }
  if (results.receita_minima > 0) {
    yLeft = drawKeyValue(doc, yLeft, "MG Ingresso (por pessoa)", fmt(inputs.taxa.valor_taxa_minima), col1X, col1ValX);
  }

  // Right column - Distribuição + PDV + Extras
  let yRight = y;
  doc.setFontSize(8);
  doc.setTextColor(ZIG_BLUE[0], ZIG_BLUE[1], ZIG_BLUE[2]);
  doc.setFont("helvetica", "bold");
  doc.text("DISTRIBUIÇÃO E PDV", col2X, yRight);
  doc.setFont("helvetica", "normal");
  yRight += 6;
  yRight = drawKeyValue(doc, yRight, "Online", pct(inputs.distribuicao.online_percent), col2X, col2ValX);
  yRight = drawKeyValue(doc, yRight, "PDV", pct(1 - inputs.distribuicao.online_percent), col2X, col2ValX);
  if (results.pdv.tpv_total > 0) {
    yRight = drawKeyValue(doc, yRight, "TPV PDV", fmt(inputs.pdv.tpv_pdv), col2X, col2ValX);
    yRight = drawKeyValue(doc, yRight, "Máquinas PDV", String(inputs.pdv.quantidade_maquinas), col2X, col2ValX);
    if (inputs.pdv.taxa_segmentada) {
      yRight = drawKeyValue(doc, yRight, "Taxa Crédito PDV", pct(inputs.pdv.taxa_credito), col2X, col2ValX);
      yRight = drawKeyValue(doc, yRight, "Taxa Déb/Pix PDV", pct(inputs.pdv.taxa_debito_pix), col2X, col2ValX);
    } else {
      yRight = drawKeyValue(doc, yRight, "Taxa Única PDV", pct(inputs.pdv.taxa_unica), col2X, col2ValX);
    }
  }

  y = Math.max(yLeft, yRight) + 4;

  // Extras row
  const extrasItems: string[] = [];
  if (inputs.extras.advance_ativo) extrasItems.push(`Advance: ${fmt(inputs.extras.advance_valor)} @ ${inputs.extras.advance_juros_am}% a.m.`);
  if (inputs.extras.patrocinio_ativo) extrasItems.push(`Patrocínio: ${fmt(inputs.extras.patrocinio_valor)}`);
  if (inputs.extras.pulse_pago_ativo) extrasItems.push(`Pulse Pago: ${fmt(inputs.extras.pulse_pago_valor)}`);

  if (extrasItems.length > 0) {
    doc.setFillColor(GRAY_BG[0], GRAY_BG[1], GRAY_BG[2]);
    doc.roundedRect(14, y, 182, 7, 1, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text(`Produtos Extras: ${extrasItems.join("  |  ")}`, 18, y + 5);
    doc.setTextColor(0);
    y += 11;
  }

  // ════════════════════════════════════════════
  // PARTE 3 — DEMONSTRATIVO FINANCEIRO
  // ════════════════════════════════════════════
  y = drawSectionHeader(doc, y, "PARTE 3 — DEMONSTRATIVO FINANCEIRO DETALHADO");

  const rows: string[][] = [];

  // Receitas
  rows.push(
    ["── RECEITAS ──", ""],
    ["TPV Total", fmt(results.tpv)],
    ["TPV Online", fmt(results.tpv_online)],
    ["TPV PDV", fmt(results.tpv_offline)],
    ["Ticket Médio", fmt(results.ticket_medio)],
    ["", ""],
    ["Taxa Adm. Plataforma", pct(results.taxa_liquida)],
    ["Receita Take", fmt(results.receita_take)],
  );
  if (results.rebate_valor > 0) rows.push(["(−) Rebate concedido", fmt(results.rebate_valor)]);
  if (results.receita_antecipacao > 0) rows.push(["(+) Receita Antecipação", fmt(results.receita_antecipacao)]);
  if (results.receita_processamento > 0) rows.push(["(+) Receita Processamento (crédito online)", fmt(results.receita_processamento)]);
  if (results.receita_minima > 0) rows.push(["Receita Mínima (MG Ingresso)", fmt(results.receita_minima)]);
  rows.push(
    ["Receita Bruta", fmt(results.receita_bruta)],
    ["(−) Impostos (6,55%)", fmt(results.impostos_valor)],
    ["Receita Líquida", fmt(results.receita_liquida)],
  );

  // Custos
  rows.push(
    ["", ""],
    ["── CUSTOS ──", ""],
    ["(−) Adquirência Online", fmt(results.custo_adquirencia_online)],
    ["(−) Adquirência PDV", fmt(results.custo_adquirencia_offline)],
    ["(−) Antifraude", fmt(results.custo_antifraude)],
    ["(−) Comissão (5%)", fmt(results.custo_comissao)],
    ["(−) Servidor", fmt(results.custo_servidor)],
    ["(−) Impressão", fmt(results.custo_impressao)],
    ["Custos Totais", fmt(results.custos_totais)],
  );

  // Extras
  if (results.advance_receita_juros > 0 || results.pulse_pago_valor > 0 || results.patrocinio_valor > 0) {
    rows.push(["", ""], ["── PRODUTOS EXTRAS ──", ""]);
    if (results.advance_receita_juros > 0) rows.push(["(+) Advance — Juros", fmt(results.advance_receita_juros)]);
    if (results.pulse_pago_valor > 0) rows.push(["(+) Zig Pulse Pago", fmt(results.pulse_pago_valor)]);
    if (results.patrocinio_valor > 0) rows.push(["(−) Patrocínio", fmt(results.patrocinio_valor)]);
  }

  // Resultado
  rows.push(
    ["", ""],
    ["── RESULTADO ──", ""],
    ["Margem Online", fmt(results.margem)],
    ["Margem / TPV", results.margem_sobre_tpv.toFixed(2) + "%"],
    ["Classificação", results.status],
  );

  // PDV
  const p = results.pdv;
  if (p.tpv_total > 0) {
    rows.push(
      ["", ""],
      ["── PDV ──", ""],
      ["TPV Total PDV", fmt(p.tpv_total)],
      ["Crédito (70%)", fmt(p.tpv_credito)],
      ["Débito/Pix (30%)", fmt(p.tpv_debito_pix)],
      ["Receita Crédito", fmt(p.receita_credito)],
      ["Receita Débito/Pix", fmt(p.receita_debito_pix)],
      ["Receita Total Zig", fmt(p.receita_total)],
      ["(−) Impressão PDV", fmt(p.custo_impressao)],
      ["(−) Máquinas PDV", fmt(p.custo_maquinas)],
      ["Receita Líq. Operacional", fmt(p.receita_liquida_operacional)],
      ["Mínimo Garantido", fmt(p.mg_total)],
      ["Resultado Final PDV", fmt(p.resultado_final)],
    );
  }

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: ZIG_BLUE },
    styles: { fontSize: 8.5, cellPadding: 2 },
    didParseCell: (data) => {
      const label = String(data.cell.raw);
      if (["Receita Bruta", "Receita Líquida", "Custos Totais", "Margem Online", "Receita Total Zig", "Resultado Final PDV"].includes(label)) {
        data.cell.styles.fontStyle = "bold";
      }
      if (label.startsWith("──")) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [229, 231, 235];
        data.cell.styles.textColor = ZIG_BLUE;
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Zig — Viabilidade Comercial · ${clienteName} · ${dateStr}`, 14, 290);
    doc.text(`Página ${i}/${pageCount}`, 185, 290);
  }

  doc.save(`${fileName}.pdf`);
}
