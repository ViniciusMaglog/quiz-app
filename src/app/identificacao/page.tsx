"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IdentificacaoPage() {
  const [nome, setNome] = useState("");
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.length < 3) return alert("Digite seu nome completo");
    
    // Salvamos o nome no localStorage para o Quiz recuperar depois
    localStorage.setItem("candidato_nome", nome);
    router.push("/quiz");
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleStart} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-[#F37B21]">
        <h2 className="text-2xl font-black text-[#025E65] mb-6 uppercase italic">Identificação</h2>
        <input 
          type="text" 
          placeholder="Seu nome completo" 
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[#F37B21] outline-none mb-4"
        />
        <button className="w-full bg-[#F37B21] text-white font-black py-4 rounded-xl shadow-lg uppercase">
          Começar Avaliação
        </button>
      </form>
    </main>
  );
}