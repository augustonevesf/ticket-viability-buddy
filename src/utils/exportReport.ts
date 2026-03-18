import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SimulatorResults } from "@/hooks/useSimulator";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => (v * 100).toFixed(2) + "%";

function buildRows(r: SimulatorResults): string[][] {
  const rows: string[][] = [
    ["── ONLINE ──", ""],
    ["TPV Total", fmt(r.tpv)],
    ["TPV Online", fmt(r.tpv_online)],
    ["TPV Offline", fmt(r.tpv_offline)],
    ["", ""],
    ["Taxa Líquida", pct(r.taxa_liquida)],
    ["Receita Take", fmt(r.receita_take)],
  ];
  if (r.receita_minima > 0) rows.push(["Receita Mínima", fmt(r.receita_minima)]);
  rows.push(
    ["Receita Bruta", fmt(r.receita_bruta)],
    ["(−) Impostos", fmt(r.impostos_valor)],
    ["Receita Líquida", fmt(r.receita_liquida)],
    ["", ""],
    ["(−) Adquirência Online", fmt(r.custo_adquirencia_online)],
    ["(−) Adquirência Offline", fmt(r.custo_adquirencia_offline)],
    ["(−) Antifraude", fmt(r.custo_antifraude)],
    ["(−) Comissão", fmt(r.custo_comissao)],
    ["(−) Servidor", fmt(r.custo_servidor)],
    ["(−) Máquinas", fmt(r.custo_maquinas)],
    ["(−) Impressão", fmt(r.custo_impressao)],
    ["Custos Totais", fmt(r.custos_totais)],
    ["Margem Online", fmt(r.margem)],
    ["Margem / TPV", r.margem_sobre_tpv.toFixed(2) + "%"],
    ["Classificação", r.status],
  );

  // PDV
  const p = r.pdv;
  if (p.tpv_total > 0) {
    rows.push(
      ["", ""],
      ["── PDV ──", ""],
      ["TPV Total PDV", fmt(p.tpv_total)],
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

  return rows;
}

export function exportPDF(results: SimulatorResults, clienteName?: string) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("pt-BR");

  doc.setFontSize(18);
  doc.text("Simulador Zig — Viabilidade Comercial", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${now}`, 14, 27);

  if (clienteName) {
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Cliente: ${clienteName}`, 14, 34);
  }

  doc.setTextColor(0);

  const statusColor: Record<string, [number, number, number]> = {
    "Ruim": [220, 50, 50],
    "Média": [230, 160, 30],
    "Boa": [50, 180, 80],
  };
  const sc = statusColor[results.status] || [0, 0, 0];
  doc.setFontSize(13);
  doc.setTextColor(sc[0], sc[1], sc[2]);
  const statusY = clienteName ? 42 : 38;
  doc.text(`Status: ${results.status}  |  Margem/TPV: ${results.margem_sobre_tpv.toFixed(2)}%  |  Taxa Líquida: ${pct(results.taxa_liquida)}`, 14, statusY);

  doc.setTextColor(0);

  autoTable(doc, {
    startY: statusY + 8,
    head: [["Indicador", "Valor"]],
    body: buildRows(results),
    theme: "striped",
    headStyles: { fillColor: [29, 78, 216] },
    styles: { fontSize: 9 },
    didParseCell: (data) => {
      const label = String(data.cell.raw);
      if (["Receita Bruta", "Receita Líquida", "Custos Totais", "Margem Online", "Receita Total Zig", "Resultado Final PDV"].includes(label)) {
        data.cell.styles.fontStyle = "bold";
      }
      if (label.startsWith("──")) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [229, 231, 235];
      }
    },
  });

  doc.save(`simulador_zig_${now.replace(/\//g, "-")}.pdf`);
}

export function exportCSV(results: SimulatorResults, clienteName?: string) {
  const now = new Date().toLocaleDateString("pt-BR");
  const rows = buildRows(results);

  const lines = [
    "Simulador Zig — Viabilidade Comercial",
    `Data,${now}`,
    clienteName ? `Cliente,${clienteName}` : "",
    "",
    "Indicador,Valor",
    ...rows.map(([a, b]) => `"${a}","${b}"`),
  ].filter(Boolean);

  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `simulador_zig_${now.replace(/\//g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
