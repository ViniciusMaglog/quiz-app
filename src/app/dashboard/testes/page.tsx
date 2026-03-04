"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { QuizService } from "@/services/quizService";

export default function ListaDeTestes() {
  const [testes, setTestes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTestes = async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTestes(data);
      setLoading(false);
    };
    fetchTestes();
  }, []);

  const handleExcluirTeste = async (id: string, nome: string) => {
    const confirmar = confirm(`ATENÇÃO: Você está prestes a excluir o teste "${nome.toUpperCase()}". Isso apagará permanentemente todas as perguntas vinculadas a ele. Deseja continuar?`);

    if (confirmar) {
      try {
        await QuizService.deleteQuiz(id);
        setTestes(prev => prev.filter(t => t.id !== id));
        alert("Teste removido com sucesso!");
      } catch (err) {
        alert("Erro ao excluir o teste.");
      }
    }
  };

  const copiarLink = (slug: string) => {
    const link = `${window.location.origin}/fazer-teste/${slug}`;
    navigator.clipboard.writeText(link);
    alert("Link do teste copiado! Agora é só enviar para o candidato.");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-[#025E65] font-black animate-pulse italic uppercase">
      Carregando Configurações...
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER PADRONIZADO */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#025E65] italic uppercase tracking-tighter leading-none">Meus Testes</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Gestão de Links e Avaliações Técnicas</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="py-2 text-[10px]">
              ← Painel Geral
            </Button>
            <Button variant="secondary" onClick={() => router.push("/dashboard/testes/novo")} className="py-2 text-[10px]">
              + Criar Novo Teste
            </Button>
          </div>
        </header>

        {/* LISTAGEM COM BORDAS LATERAIS */}
        <div className="grid gap-6">
          {testes.length > 0 ? (
            testes.map(teste => (
              <div 
                key={teste.id} 
                className="bg-white p-8 rounded-[32px] shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center border-l-[12px] border-[#F37B21] group hover:shadow-md transition-all"
              >
                <div className="mb-6 lg:mb-0">
                  <h2 className="font-black text-[#025E65] text-2xl uppercase italic leading-none">{teste.nome}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Link Ativo:</span>
                      <code className="text-[10px] bg-gray-50 text-[#F37B21] px-2 py-1 rounded-lg font-bold border border-gray-100 italic">
                        /fazer-teste/{teste.slug}
                      </code>
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase bg-gray-50 px-2 py-1 rounded-lg">
                      ⏱ {teste.tempo_total || 60}s
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <Button
                    variant="primary"
                    onClick={() => copiarLink(teste.slug)}
                    className="flex-1 lg:flex-none py-3 text-[10px]"
                  >
                    🔗 Copiar Link
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/perguntas?quiz_id=${teste.id}`)}
                    className="flex-1 lg:flex-none py-3 text-[10px] border-gray-200"
                  >
                    ⚙️ Questões
                  </Button>

                  <Button
                    variant="delete"
                    onClick={() => handleExcluirTeste(teste.id, teste.nome)}
                    className="flex-1 lg:flex-none py-3 text-[10px]"
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </div>
            ))
          ) : (
            /* ESTADO VAZIO PADRONIZADO */
            <div className="bg-white p-20 rounded-[40px] border-t-[12px] border-[#025E65] shadow-sm text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl grayscale opacity-30">📁</span>
              </div>
              <p className="text-gray-400 font-black uppercase text-xs tracking-[0.3em] italic mb-6">
                Nenhum teste configurado ainda.
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard/testes/novo")}
              >
                Criar meu primeiro teste
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center border-t border-gray-200 pt-8">
          <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.5em]">
            @2024 QuizApp - Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </main>
  );
}