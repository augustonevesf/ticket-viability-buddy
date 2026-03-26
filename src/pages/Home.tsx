import { useNavigate } from "react-router-dom";
import zigLogo from "@/assets/logo-zig.svg";
import { Ticket, Utensils, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 relative">
      {/* Logout */}
      <button
        onClick={async () => { await signOut(); navigate("/auth"); }}
        className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 text-sm hover:bg-white/20 hover:text-white transition-all"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>

      {user && (
        <p className="absolute top-5 left-5 text-white/40 text-xs">
          {user.email}
        </p>
      )}

      {/* Logo */}
      <img src={zigLogo} alt="Zig" className="w-48 md:w-64 mb-6 drop-shadow-lg" />
      <p className="text-white/80 text-lg md:text-xl font-medium mb-12 tracking-tight">Bem-vindo, bora vender? 🚀</p>

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
          className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-6 text-white transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex flex-col items-center gap-3">
            <Utensils className="w-8 h-8 text-white/90" />
            <span className="text-lg font-semibold tracking-tight">Viabilidade A&B</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
