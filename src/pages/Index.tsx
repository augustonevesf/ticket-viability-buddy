import { useState, useMemo, useCallback } from "react";
import { useSimulator, getDefaultInputs } from "@/hooks/useSimulator";
import { InputSections } from "@/components/simulator/InputSections";
import { SummaryPanel } from "@/components/simulator/SummaryPanel";

const ADMIN_PIN = "1234";

const Index = () => {
  const [inputs, setInputs] = useState(getDefaultInputs);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    cnpj: "",
    executivo: "",
    faturamento_estimado: 0,
    anual: false,
  });

  const results = useSimulator(inputs);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const paySum = inputs.pagamentos_online.credito + inputs.pagamentos_online.pix_debito + inputs.pagamentos_online.picpay;
    if (Math.abs(paySum - 1) > 0.001) {
      e.pagamentos = `Mix de pagamento soma ${(paySum * 100).toFixed(1)}% (deve ser 100%)`;
    }
    return e;
  }, [inputs]);

  const handleToggleAdmin = useCallback(() => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pin = window.prompt("Digite o PIN de administrador:");
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
    }
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Simulador de Viabilidade Comercial</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ajuste as variáveis para calcular o Take Rate e a Margem sobre TPV em tempo real.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <InputSections
              inputs={inputs}
              setInputs={setInputs}
              errors={errors}
              clientInfo={clientInfo}
              setClientInfo={setClientInfo}
              isAdmin={isAdmin}
              onToggleAdmin={handleToggleAdmin}
            />
          </div>
          <div className="lg:col-span-5">
            <SummaryPanel results={results} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
