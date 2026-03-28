import { ABInputs, ABResults } from "@/hooks/useSimulatorAB";

export interface InsightAB {
  icon: string;
  title: string;
  description: string;
  impact: "alto" | "medio" | "baixo";
}

export function generateInsightsAB(inputs: ABInputs, results: ABResults): InsightAB[] {
  const insights: InsightAB[] = [];

  // 1. Resultado negativo
  if (results.resultado_recorrente < 0) {
    insights.push({
      icon: "🚨",
      title: "Operação com resultado negativo",
      description: `O resultado recorrente está negativo em ${fmt(Math.abs(results.resultado_recorrente))}. Revise taxas, custos de equipamentos ou receitas diversas.`,
      impact: "alto",
    });
  }

  // 2. Taxa ADM baixa
  if (inputs.taxas.taxa_adm < 0.5) {
    insights.push({
      icon: "📈",
      title: "Taxa ADM muito baixa",
      description: `Taxa ADM de ${inputs.taxas.taxa_adm}%. Cada 0,5% a mais sobre o faturamento de ${fmt(results.faturamento_bruto)} gera ~${fmt(results.faturamento_bruto * 0.005)} extra.`,
      impact: "alto",
    });
  }

  // 3. Sem antecipação
  if (!inputs.configuracao.antecipado_100 && results.faturamento_credito > 0) {
    const potencial = results.faturamento_credito * (inputs.taxas.taxa_antecipacao / 100);
    insights.push({
      icon: "⚡",
      title: "Antecipação 100% não ativada",
      description: `Ativar antecipação 100% geraria ~${fmt(potencial)} de receita adicional sobre o crédito.`,
      impact: "medio",
    });
  }

  // 4. Margem apertada
  if (results.margem_estimada > 0 && results.margem_estimada < 25) {
    insights.push({
      icon: "🎯",
      title: "Margem apertada",
      description: `Margem de ${results.margem_estimada.toFixed(1)}%. O ideal para A&B é acima de 35%. Negocie taxas ou reduza custos de equipamentos.`,
      impact: "medio",
    });
  }

  // 5. Sem receitas diversas
  if (results.total_receitas_diversas === 0) {
    insights.push({
      icon: "💰",
      title: "Sem receitas diversas",
      description: "Nenhuma receita diversa configurada. Considere WiFi, pulseiras, licenças de software ou totens para aumentar a receita.",
      impact: "medio",
    });
  }

  // 6. App/QR zerados mas poderiam gerar receita
  if (inputs.faturamento.split_app === 0 && inputs.faturamento.split_qr === 0 && results.faturamento_bruto > 0) {
    insights.push({
      icon: "📱",
      title: "App e QR não utilizados",
      description: "App e QR Auto Atendimento possuem taxas maiores (3,5%). Incluir essas modalidades aumenta a receita por transação.",
      impact: "baixo",
    });
  }

  // 7. Custos de equipamento altos
  if (Math.abs(results.total_custos_equipamentos) > results.total_receita_taxas * 0.3 && results.total_receita_taxas > 0) {
    insights.push({
      icon: "🔧",
      title: "Custos de equipamentos elevados",
      description: `Equipamentos representam ${((Math.abs(results.total_custos_equipamentos) / results.total_receita_taxas) * 100).toFixed(0)}% da receita de taxas. Revise quantidades ou negocie comodato.`,
      impact: "alto",
    });
  }

  // 8. Split dinheiro alto
  if (inputs.faturamento.split_dinheiro > 20) {
    insights.push({
      icon: "💵",
      title: "Alto percentual em dinheiro",
      description: `${inputs.faturamento.split_dinheiro}% em dinheiro não gera receita de taxa. Incentivar pagamentos digitais (débito, pix, crédito) aumenta a receita.`,
      impact: "medio",
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
