import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SimulatorResults } from "@/hooks/useSimulator";

interface ClientInfo {
  cnpj: string;
  executivo: string;
  faturamento_estimado: number;
  anual: boolean;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => (v * 100).toFixed(2) + "%";

function buildRows(r: SimulatorResults): string[][] {
  const rows: string[][] = [
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
    ["", ""],
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
    ["", ""],
    ["Margem Operacional", fmt(r.margem_operacional)],
  );
  if (r.receita_advance > 0) rows.push(["(+) Receita Advance", fmt(r.receita_advance)]);
  rows.push(
    ["Margem Final", fmt(r.margem_final)],
    ["Margem / TPV", r.margem_sobre_tpv.toFixed(2) + "%"],
    ["Classificação", r.status],
  );
  return rows;
}

export function exportPDF(results: SimulatorResults, client: ClientInfo) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("pt-BR");

  doc.setFontSize(18);
  doc.text("Relatório de Viabilidade Comercial", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${now}`, 14, 27);

  doc.setTextColor(0);
  doc.setFontSize(11);
  let y = 38;
  doc.text(`CNPJ: ${client.cnpj || "—"}`, 14, y);
  doc.text(`Executivo: ${client.executivo || "—"}`, 14, y + 6);
  doc.text(`Faturamento Estimado: ${fmt(client.faturamento_estimado)}`, 14, y + 12);
  doc.text(`Tipo: ${client.anual ? "Anual" : "Pontual"}`, 14, y + 18);

  const statusColor: Record<string, [number, number, number]> = {
    "Prejuízo": [220, 50, 50],
    "Ruim": [220, 50, 50],
    "Média": [230, 160, 30],
    "Boa": [50, 180, 80],
  };
  const sc = statusColor[results.status] || [0, 0, 0];
  doc.setFontSize(13);
  doc.setTextColor(sc[0], sc[1], sc[2]);
  doc.text(`Status: ${results.status}  |  Margem/TPV: ${results.margem_sobre_tpv.toFixed(2)}%  |  Taxa Líquida: ${pct(results.taxa_liquida)}`, 14, y + 30);

  doc.setTextColor(0);

  autoTable(doc, {
    startY: y + 38,
    head: [["Indicador", "Valor"]],
    body: buildRows(results),
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 9 },
    didParseCell: (data) => {
      // Bold totals
      const label = String(data.cell.raw);
      if (["Receita Bruta", "Receita Líquida", "Custos Totais", "Margem Final", "Receita Online"].includes(label)) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save(`viabilidade_${client.cnpj || "simulacao"}_${now.replace(/\//g, "-")}.pdf`);
}

export function exportCSV(results: SimulatorResults, client: ClientInfo) {
  const now = new Date().toLocaleDateString("pt-BR");
  const rows = buildRows(results);

  const lines = [
    "Relatório de Viabilidade Comercial",
    `Data,${now}`,
    `CNPJ,${client.cnpj}`,
    `Executivo,${client.executivo}`,
    `Faturamento Estimado,"${fmt(client.faturamento_estimado)}"`,
    `Tipo,${client.anual ? "Anual" : "Pontual"}`,
    "",
    "Indicador,Valor",
    ...rows.map(([a, b]) => `"${a}","${b}"`),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `viabilidade_${client.cnpj || "simulacao"}_${now.replace(/\//g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
