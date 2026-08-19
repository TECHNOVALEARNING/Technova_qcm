import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BrainCircuit, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const loginMutation = trpc.auth.localLogin.useMutation({
    onSuccess: (data) => {
      // Force un rechargement pour que le contexte Auth attrape le nouveau cookie
      window.location.href = data.role === 'admin' ? "/admin" : "/play";
    },
    onError: (err) => {
      setError(err.message || "Une erreur est survenue");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (isSignUp && !name) {
      setError("Veuillez indiquer un pseudo");
      return;
    }
    loginMutation.mutate({
      email,
      password,
      name: isSignUp ? name : undefined,
      isSignUp,
    });
  };

  return (
    <main className="app-shell flex items-center justify-center min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle at top right, #0d1e36, #050b14)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(255, 107, 74, 0.08)" }} />
      </div>

      <div className="w-full max-w-md z-10 p-4">
        <button type="button" onClick={() => setLocation("/")} className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_54px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center mb-4 text-cyan-400">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white font-display text-center" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {isSignUp ? "Créer un compte" : "Bon retour"}
            </h1>
            <p className="text-white/50 text-sm mt-2 text-center">
              {isSignUp ? "Rejoignez l'arène et suivez votre progression" : "Connectez-vous pour continuer votre progression"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </motion.div>
            )}

            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 mb-4">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">Pseudo</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Alex" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@exemple.com" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>

            <div className="space-y-1 pb-4">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider ml-1">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
            </div>

            <Button type="submit" disabled={loginMutation.isPending} className="w-full border-none hover:bg-cyan-400 text-slate-900 rounded-xl py-6 font-bold text-base transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: "#06b6d4" }}>
              {loginMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? "Rejoindre l'arène" : "Accéder à l'arène")}
              {!loginMutation.isPending && <ArrowRight size={18} />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/50">
              {isSignUp ? "Déjà un compte ?" : "Nouveau sur Technova QCM ?"}
            </p>
            <button 
              type="button" 
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-cyan-400 font-semibold text-sm mt-1 hover:text-cyan-300 transition-colors"
            >
              {isSignUp ? "Se connecter" : "Créer un compte"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
