import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSimulator, getDefaultInputs, SimulatorInputs } from "@/hooks/useSimulator";
import { InputSections } from "@/components/simulator/InputSections";
import { SummaryPanel } from "@/components/simulator/SummaryPanel";
import { TicketHistoryPanel } from "@/components/simulator/TicketHistoryPanel";
import { TicketAdminPanel } from "@/components/simulator/TicketAdminPanel";
import { useTicketHistory } from "@/hooks/useTicketHistory";
import { useTicketAdmin } from "@/hooks/useTicketAdmin";
import { Sun, Moon, ArrowLeft, History, Settings } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState(getDefaultInputs);
  const results = useSimulator(inputs);
  const { simulations, loading: historyLoading, saveSimulation, fetchSimulations } = useTicketHistory();
  const { isAdmin, mergedConstants, flatConstants, saveConstants, lastUpdatedBy, lastUpdatedAt, loading: adminLoading } = useTicketAdmin();

  const [idHub, setIdHub] = useState("");
  const [idProposta, setIdProposta] = useState("");
  const [currentIdViabilidade, setCurrentIdViabilidade] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleSave = async () => {
    if (!inputs.cliente.nome) {
      toast.error("Preencha o nome do cliente antes de salvar.");
      return;
    }
    const id = await saveSimulation(inputs, results, idHub, idProposta, currentIdViabilidade);
    if (id) {
      setCurrentIdViabilidade(id);
      toast.success(`Simulação salva! ID: ${id}`);
    } else {
      toast.error("Erro ao salvar simulação.");
    }
  };

  const handleLoad = (sim: any) => {
    setInputs(sim.inputs);
    setIdHub(sim.id_hub || "");
    setIdProposta(sim.id_proposta || "");
    setCurrentIdViabilidade(sim.id_viabilidade);
    setShowHistory(false);
    toast.success(`Simulação ${sim.id_viabilidade} carregada.`);
  };

  const handleDuplicate = (sim: any) => {
    setInputs({ ...sim.inputs, cliente: { ...sim.inputs.cliente, nome: `${sim.inputs.cliente.nome} (cópia)` } });
    setIdHub(sim.id_hub || "");
    setIdProposta(sim.id_proposta || "");
    setCurrentIdViabilidade(undefined);
    setShowHistory(false);
    toast.info("Simulação duplicada. Edite e salve como nova.");
  };

  const handleNew = () => {
    setInputs(getDefaultInputs());
    setIdHub("");
    setIdProposta("");
    setCurrentIdViabilidade(undefined);
    toast.info("Nova simulação iniciada.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Viabilidade Comercial Tickets</h1>
            {currentIdViabilidade && (
              <p className="text-xs text-muted-foreground mt-0.5">ID: {currentIdViabilidade}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setShowAdmin(!showAdmin)} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground" aria-label="Admin">
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground" aria-label="Histórico">
            <History className="w-5 h-5" />
          </button>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground" aria-label="Alternar tema">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {showAdmin && isAdmin && (
        <TicketAdminPanel
          mergedConstants={mergedConstants}
          flatConstants={flatConstants}
          onSave={saveConstants}
          lastUpdatedBy={lastUpdatedBy}
          lastUpdatedAt={lastUpdatedAt}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {showHistory && (
        <TicketHistoryPanel
          simulations={simulations}
          loading={historyLoading}
          onLoad={handleLoad}
          onNew={handleNew}
          onDuplicate={handleDuplicate}
          onClose={() => setShowHistory(false)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground tracking-wide">ID Hub</label>
                <input type="text" value={idHub} onChange={e => setIdHub(e.target.value)} placeholder="Ex: HUB-12345"
                  className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground tracking-wide">ID Proposta</label>
                <input type="text" value={idProposta} onChange={e => setIdProposta(e.target.value)} placeholder="Ex: PROP-67890"
                  className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <InputSections inputs={inputs} setInputs={setInputs} />
          </div>
          <div className="lg:col-span-5">
            <SummaryPanel
              results={results}
              inputs={inputs}
              onSave={handleSave}
              onExportPDF={() => {
                import("@/utils/exportReport").then(({ exportPDF }) => {
                  const regiao = inputs.taxa.regiao === "rj" ? "RJ (Lei 6.103/2011)" : "Brasil";
                  exportPDF(results, inputs, regiao);
                });
              }}
              idViabilidade={currentIdViabilidade}
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

      <footer className="py-4 text-center text-[10px] text-muted-foreground/50 select-none">
        Criado por: Felipe Augusto Neves · Versão 1.0
      </footer>
    </div>
  );
};

export default Index;
