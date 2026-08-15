import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound } from "lucide-react";
import logoGoodzap from "@/assets/logo_goodzap.png";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Validate token
        if (!token.trim()) {
          toast.error("Token é obrigatório para criar conta.");
          setLoading(false);
          return;
        }

        const { data: tokenData, error: tokenError } = await supabase
          .from("tokens")
          .select("id, used")
          .eq("token", token.trim())
          .maybeSingle();

        if (tokenError) throw tokenError;
        if (!tokenData) {
          toast.error("Token inválido.");
          setLoading(false);
          return;
        }
        if (tokenData.used) {
          toast.error("Este token já foi utilizado.");
          setLoading(false);
          return;
        }

        // Create account
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        // Atribui role do token ao novo usuário e marca o token como usado
        const newUserId = signUpData.user?.id;
        if (newUserId) {
          const { error: roleError } = await supabase.rpc("assign_role_from_token", {
            _token: token.trim(),
            _user_id: newUserId,
          });
          if (roleError) throw roleError;
        }

        toast.success("Conta criada! Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background effects */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(222 30% 15%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(222 30% 15%) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card neon-border rounded-2xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-glow-cyan">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSignup ? "Criar conta" : "Entrar"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup
                ? "Crie sua conta para acessar o painel"
                : "Acesse seu painel de controle"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-input border-border focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="token">Token de Acesso</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Digite seu token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full neon-glow-cyan font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                  {isSignup ? "Criar conta" : "Entrar"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline transition-colors"
            >
              {isSignup
                ? "Já tem conta? Entrar"
                : "Não tem conta? Criar uma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
