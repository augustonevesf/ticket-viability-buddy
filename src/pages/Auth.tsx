import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import zigLogo from "@/assets/logo-zig.svg";
import { Mail, Lock, ArrowRight, Loader2, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_DOMAIN = "zig.fun";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidDomain = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (!isValidDomain(email)) {
      toast.error(`Apenas emails @${ALLOWED_DOMAIN} são permitidos.`);
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      const msg = error?.message || "Erro inesperado.";
      if (msg.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos.");
      } else if (msg.includes("User already registered")) {
        toast.error("Este email já está cadastrado. Faça login.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <img src={zigLogo} alt="Zig" className="w-40 md:w-52 mb-8 drop-shadow-lg" />

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        <h2 className="text-white text-xl font-semibold text-center mb-1">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h2>
        <p className="text-white/60 text-sm text-center mb-6">
          Apenas emails @{ALLOWED_DOMAIN}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="email"
              placeholder="seu.email@zig.fun"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Criar conta
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-white/60 text-sm hover:text-white transition-colors"
          >
            {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>

      <p className="text-white/30 text-[10px] mt-8">
        Acesso restrito a colaboradores Zig
      </p>
    </div>
  );
};

export default Auth;
