import { useNavigate } from "react-router-dom";
import zigLogo from "@/assets/logo-zig.svg";
import { Ticket, Utensils } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <img src={zigLogo} alt="Zig" className="w-48 md:w-64 mb-16 drop-shadow-lg" />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-lg">
        <button
          onClick={() => navigate("/tickets")}
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-6 text-white transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex flex-col items-center gap-3">
            <Ticket className="w-8 h-8 text-white/90" />
            <span className="text-lg font-semibold tracking-tight">Viabilidade Tickets</span>
          </div>
        </button>

        <button
          onClick={() => navigate("/ab")}
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-6 text-white transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] opacity-80"
        >
          <div className="flex flex-col items-center gap-3">
            <Utensils className="w-8 h-8 text-white/90" />
            <span className="text-lg font-semibold tracking-tight">Viabilidade A&B</span>
            <span className="text-xs text-white/50 font-medium">Em breve</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
