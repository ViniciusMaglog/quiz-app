"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function LandingTesteDinamico() {
  const { slug } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        alert("Link de teste inválido ou expirado.");
        router.push("/");
        return;
      }

      setQuiz(data);
      setLoading(false);
    }
    loadQuiz();
  }, [slug, router]);

  const iniciarProcesso = () => {
    // Armazenamos o ID do teste atual para o Quiz saber o que buscar
    localStorage.setItem("active_quiz_id", quiz.id);
    localStorage.setItem("active_quiz_name", quiz.nome);
    localStorage.setItem("active_quiz_timer", quiz.tempo_total.toString());
    
    router.push("/identificacao");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 font-black text-[#025E65] animate-pulse uppercase italic">
      Validando Link de Acesso...
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border-t-[12px] border-[#025E65] text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          📝
        </div>
        
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Avaliação Técnica</p>
        <h1 className="text-3xl font-black text-[#025E65] uppercase italic leading-tight mb-4">
          {quiz.nome}
        </h1>
        
        <div className="bg-gray-50 rounded-2xl p-4 mb-8">
          <p className="text-sm text-gray-600 font-bold">
            Tempo Limite: <span className="text-[#F37B21]">{quiz.tempo_total} segundos</span>
          </p>
        </div>

        <Button variant="secondary" onClick={iniciarProcesso} className="w-full py-5 text-sm shadow-orange-200">
          INICIAR IDENTIFICAÇÃO
        </Button>
        
        <p className="mt-6 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
          Certifique-se de estar em um ambiente calmo.
        </p>
      </div>
    </main>
  );
}