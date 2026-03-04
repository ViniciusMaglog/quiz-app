"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Logotipo ou Ícone */}
      <div className="w-24 h-24 bg-[#025E65] rounded-[32px] flex items-center justify-center mb-8 shadow-xl rotate-3">
        <span className="text-4xl">📊</span>
      </div>

      <h1 className="text-4xl font-black text-[#025E65] italic uppercase tracking-tighter leading-none mb-4">
        Sistema de Avaliação <br /> <span className="text-[#F37B21]"></span>
      </h1>
      
      <p className="max-w-md text-gray-400 font-medium mb-12">
        Plataforma restrita para testes técnicos. 
      </p>

      {/* Botão de Acesso do Gestor - Discreto mas funcional */}
      <Button 
        variant="primary" 
        onClick={() => router.push("/login")}
        className="border-gray-200 text-gray-400 hover:text-[#025E65] hover:border-[#025E65]"
      >
        Acesso Gestor
      </Button>

      <footer className="mt-20">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Desenvolvido para Gestão de Alta Performance
        </p>
      </footer>
    </main>
  );
}