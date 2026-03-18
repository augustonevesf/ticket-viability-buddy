import { useState } from "react";
import { useSimulator, getDefaultInputs } from "@/hooks/useSimulator";
import { InputSections } from "@/components/simulator/InputSections";
import { SummaryPanel } from "@/components/simulator/SummaryPanel";

const Index = () => {
  const [inputs, setInputs] = useState(getDefaultInputs);
  const results = useSimulator(inputs);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Simulador Zig</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Viabilidade comercial em tempo real
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <InputSections inputs={inputs} setInputs={setInputs} />
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
