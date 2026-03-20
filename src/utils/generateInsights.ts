import { SimulatorInputs, SimulatorResults, CONSTANTS } from "@/hooks/useSimulator";

export interface Insight {
  icon: string;
  title: string;
  description: string;
  impact: "alto" | "medio" | "baixo";
}

export function generateInsights(inputs: SimulatorInputs, results: SimulatorResults): Insight[] {
  const insights: Insight[] = [];

  // 1. Taxa administrativa baixa
  if (inputs.taxa.taxa_administrativa < 0.10) {
    insights.push({
      icon: "📈",
      title: "Taxa administrativa abaixo de 10%",
      description: `Sua taxa está em ${(inputs.taxa.taxa_administrativa * 100).toFixed(1)}%. Cada 1% a mais no TPV de ${formatK(results.tpv)} gera ~${formatK(results.tpv * 0.01)} de receita extra.`,
      impact: "alto",
    });
  }

  // 2. Rebate concedido
  if (inputs.taxa.rebate > 0) {
    insights.push({
      icon: "🔴",
      title: "Rebate está consumindo margem",
      description: `O rebate de ${(inputs.taxa.rebate * 100).toFixed(1)}% representa ${formatK(results.rebate_valor)} de dedução. Reduzir ou eliminar aumenta direto a margem.`,
      impact: "alto",
    });
  }

  // 3. Sem antecipação
  if (inputs.taxa.taxa_antecipacao === 0) {
    const potencial = results.tpv_online * 0.0129;
    insights.push({
      icon: "⚡",
      title: "Antecipação não negociada",
      description: `Se negociar crédito antecipado (1,29%), pode gerar ~${formatK(potencial)} de receita adicional nesse evento.`,
      impact: "medio",
    });
  }

  // 4. Sem taxa de processamento
  if (inputs.taxa.taxa_processamento === 0) {
    insights.push({
      icon: "💳",
      title: "Taxa de processamento zerada",
      description: `Cobrar uma taxa de processamento (ex: 1-2%) sobre o TPV online gera receita incremental sem afetar a taxa administrativa.`,
      impact: "medio",
    });
  }

  // 5. Distribuição muito online
  if (inputs.distribuicao.online_percent >= 0.95 && results.tpv > 0) {
    insights.push({
      icon: "🏪",
      title: "Considere operação PDV",
      description: `100% online. Se houver bilheteria, PDV agrega receita de adquirência (crédito/débito) com margens próprias.`,
      impact: "baixo",
    });
  }

  // 6. Margem ruim
  if (results.status === "Atenção" && results.margem < 0) {
    insights.push({
      icon: "🚨",
      title: "Operação negativa",
      description: `A margem está negativa em ${formatK(Math.abs(results.margem))}. Revise taxa administrativa, rebate e custos para viabilizar.`,
      impact: "alto",
    });
  }

  // 7. Margem média — pode melhorar
  if (results.status === "Média") {
    insights.push({
      icon: "🎯",
      title: "Margem apertada",
      description: `Margem de ${results.margem_sobre_tpv.toFixed(2)}% s/ TPV. O ideal é acima de 6%. Negocie taxa ou reduza rebate para ganhar fôlego.`,
      impact: "medio",
    });
  }

  // 8. Ticket médio baixo
  if (results.ticket_medio > 0 && results.ticket_medio < 25) {
    insights.push({
      icon: "🎫",
      title: "Ticket médio baixo",
      description: `Ticket médio de ${formatK(results.ticket_medio)}. Ative a taxa mínima (R$ 2,50) para garantir receita por ingresso.`,
      impact: "medio",
    });
  }

  // 9. Contrato pontual — sugerir anual
  if (inputs.cliente.tipo === "pontual") {
    insights.push({
      icon: "📋",
      title: "Contrato pontual",
      description: `Contratos anuais garantem recorrência e previsibilidade. Negocie um contrato de longo prazo com exclusividade.`,
      impact: "baixo",
    });
  }

  // 10. Sem exclusividade
  if (!inputs.cliente.exclusividade && inputs.cliente.tipo === "anual") {
    insights.push({
      icon: "🔒",
      title: "Sem exclusividade",
      description: `Contrato anual sem exclusividade. Negociar exclusividade protege a operação e justifica condições melhores.`,
      impact: "baixo",
    });
  }

  // Sort by impact
  const order = { alto: 0, medio: 1, baixo: 2 };
  insights.sort((a, b) => order[a.impact] - order[b.impact]);

  return insights.slice(0, 5);
}

function formatK(v: number): string {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${v.toFixed(2)}`;
}
