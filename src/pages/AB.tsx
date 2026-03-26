import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSimulatorAB, getDefaultABInputs } from "@/hooks/useSimulatorAB";
import { ABInputSections } from "@/components/simulator-ab/ABInputSections";
import { ABSummaryPanel } from "@/components/simulator-ab/ABSummaryPanel";
import { Sun, Moon, ArrowLeft } from "lucide-react";

const AB = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState(getDefaultABInputs);
  const results = useSimulatorAB(inputs);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Viabilidade Comercial A&B</h1>
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
            <ABInputSections inputs={inputs} setInputs={setInputs} />
          </div>
          <div className="lg:col-span-5">
            <ABSummaryPanel results={results} inputs={inputs} />
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[10px] text-muted-foreground/50 select-none">
        Criado por: Felipe Augusto Neves · Versão 1.0
      </footer>
    </div>
  );
};

export default AB;
