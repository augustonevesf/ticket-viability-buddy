import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import zigLogo from "@/assets/logo-zig.svg";
import { Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_DOMAIN = "zig.fun";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isValidDomain = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain === ALLOWED_DOMAIN;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Preencha o email.");
      return;
    }

    if (!isValidDomain(email)) {
      toast.error(`Apenas emails @${ALLOWED_DOMAIN} são permitidos.`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setEmailSent(true);
      toast.success("Link de acesso enviado! Verifique seu email.");
    } catch (error: any) {
      const msg = error?.message || "Erro inesperado.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      <img src={zigLogo} alt="Zig" className="w-40 md:w-52 mb-8 drop-shadow-lg" />

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
        {emailSent ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h2 className="text-white text-xl font-semibold">Email enviado!</h2>
            <p className="text-white/70 text-sm">
              Enviamos um link de acesso para <strong className="text-white">{email}</strong>.
              Clique no link no email para entrar.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="text-white/60 text-sm hover:text-white transition-colors mt-4"
            >
              Usar outro email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-white text-xl font-semibold text-center mb-1">
              Entrar
            </h2>
            <p className="text-white/60 text-sm text-center mb-6">
              Enviaremos um link de acesso para seu email @{ALLOWED_DOMAIN}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Enviar link de acesso
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-white/30 text-[10px] mt-8">
        Acesso restrito a colaboradores Zig
      </p>
    </div>
  );
};

export default Auth;
