"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button"; // Importando seu componente padronizado

export default function GestorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Acesso negado: " + error.message);
      setLoading(false);
    } else if (data.session) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-[#025E65] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border-b-8 border-[#F37B21]">
        <div className="text-center mb-10">
          <div className="bg-[#025E65]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black text-[#025E65] uppercase italic tracking-tighter leading-none">
            Área do Gestor
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">E-mail Administrativo</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full p-4 rounded-2xl border-2 border-gray-50 focus:border-[#025E65] outline-none transition-all font-bold text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Senha de Acesso</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 rounded-2xl border-2 border-gray-50 focus:border-[#025E65] outline-none transition-all font-bold text-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Botão Principal usando o Componente */}
          <Button 
            variant="primary" 
            type="submit" 
            className="w-full py-5 text-sm shadow-lg mt-4" 
            disabled={loading}
          >
            {loading ? "VALIDANDO CREDENCIAIS..." : "ENTRAR NO PAINEL"}
          </Button>
        </form>
        
        {/* Botão de Voltar usando a variante Ghost */}
        <Button 
          variant="ghost" 
          onClick={() => router.push("/")}
          className="w-full mt-6 border-none text-gray-300 hover:text-[#F37B21] transition-colors"
        >
          ← VOLTAR PARA O INÍCIO
        </Button>
      </div>
    </main>
  );
}