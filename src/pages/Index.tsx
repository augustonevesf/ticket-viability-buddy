import { useState, useEffect } from "react";
import { useSimulator, getDefaultInputs } from "@/hooks/useSimulator";
import { InputSections } from "@/components/simulator/InputSections";
import { SummaryPanel } from "@/components/simulator/SummaryPanel";
import { Sun, Moon } from "lucide-react";

const Index = () => {
  const [inputs, setInputs] = useState(getDefaultInputs);
  const results = useSimulator(inputs);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Viabilidade Comercial Tickets</h1>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground"
          aria-label="Alternar tema"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <InputSections inputs={inputs} setInputs={setInputs} />
          </div>
          <div className="lg:col-span-5">
            <SummaryPanel
              results={results}
              clienteName={inputs.cliente.nome || undefined}
              executivoName={inputs.cliente.executivo || undefined}
              tipoContrato={inputs.cliente.tipo}
              tempoContrato={inputs.cliente.tempo_contrato}
              exclusividade={inputs.cliente.exclusividade}
              taxaAdministrativa={inputs.taxa.taxa_administrativa}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
