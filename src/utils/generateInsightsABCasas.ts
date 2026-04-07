import { ABCasasInputs, ABCasasResults } from "@/hooks/useSimulatorABCasas";

export interface InsightABCasas {
  icon: string;
  title: string;
  description: string;
  impact: "alto" | "medio" | "baixo";
}

export function generateInsightsABCasas(inputs: ABCasasInputs, results: ABCasasResults): InsightABCasas[] {
  const insights: InsightABCasas[] = [];

  if (results.resultado_recorrente < 0) {
    insights.push({
      icon: "🚨", title: "Operação com resultado negativo",
      description: `Resultado negativo em ${fmt(Math.abs(results.resultado_recorrente))}. Revise taxas ou reduza custos.`,
      impact: "alto",
    });
  }

  if (inputs.taxas.taxa_adm < 0.5) {
    insights.push({
      icon: "📈", title: "Taxa ADM muito baixa",
      description: `Taxa ADM de ${inputs.taxas.taxa_adm}%. Cada 0,5% gera ~${fmt(results.faturamento_bruto * 0.005)} extra.`,
      impact: "alto",
    });
  }

  if (results.margem_estimada > 0 && results.margem_estimada < 25) {
    insights.push({
      icon: "🎯", title: "Margem apertada",
      description: `Margem de ${results.margem_estimada.toFixed(1)}%. O ideal para Casas é acima de 35%.`,
      impact: "medio",
    });
  }

  if (results.total_receitas_diversas === 0) {
    insights.push({
      icon: "💰", title: "Sem receitas diversas",
      description: "Nenhuma receita diversa. Considere SmartPOS ou Totens para aumentar a receita.",
      impact: "medio",
    });
  }

  if (inputs.configuracao.antecipado_100) {
    insights.push({
      icon: "⚡", title: "Antecipação ativa — sem receita de antecipação",
      description: "Com a flag de antecipação ativa, não é gerada receita de antecipação. Considere desativar se a margem estiver baixa.",
      impact: "medio",
    });
  }

  if (results.minimo_garantido > results.total_receita_taxas && results.total_receita_taxas > 0) {
    insights.push({
      icon: "🔒", title: "Receita abaixo do Mínimo Garantido",
      description: `MG de ${fmt(results.minimo_garantido)} é maior que a receita de taxas de ${fmt(results.total_receita_taxas)}.`,
      impact: "alto",
    });
  }

  if (inputs.faturamento.split_dinheiro > 20) {
    insights.push({
      icon: "💵", title: "Alto percentual em dinheiro",
      description: `${inputs.faturamento.split_dinheiro}% em dinheiro não gera receita. Incentivar pagamentos digitais.`,
      impact: "medio",
    });
  }

  if (Math.abs(results.total_custos_equipamentos) > results.total_receita_taxas * 0.3 && results.total_receita_taxas > 0) {
    insights.push({
      icon: "🔧", title: "Custos de equipamentos elevados",
      description: `Equipamentos representam ${((Math.abs(results.total_custos_equipamentos) / results.total_receita_taxas) * 100).toFixed(0)}% da receita de taxas.`,
      impact: "alto",
    });
  }

  const order = { alto: 0, medio: 1, baixo: 2 };
  insights.sort((a, b) => order[a.impact] - order[b.impact]);
  return insights.slice(0, 5);
}

function fmt(v: number): string {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${v.toFixed(2)}`;
}
