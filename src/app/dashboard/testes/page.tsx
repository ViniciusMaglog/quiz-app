"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation"; // CORREÇÃO: Importação correta do hook
import { QuizService } from "@/services/quizService";

export default function ListaDeTestes() {
  const [testes, setTestes] = useState<any[]>([]);
  const router = useRouter(); // Inicialização correta do roteador

  useEffect(() => {
    const fetchTestes = async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTestes(data);
    };
    fetchTestes();
  }, []);

  const handleExcluirTeste = async (id: string, nome: string) => {
    const confirmar = confirm(`ATENÇÃO: Você está prestes a excluir o teste "${nome.toUpperCase()}". Isso apagará permanentemente todas as perguntas vinculadas a ele. Deseja continuar?`);

    if (confirmar) {
      try {
        await QuizService.deleteQuiz(id);
        // Atualiza a lista local removendo o item excluído
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

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#025E65] italic uppercase tracking-tighter">Meus Testes</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Gerenciamento de Links de Avaliação</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Painel Geral
            </Button>
            <Button variant="secondary" onClick={() => router.push("/dashboard/testes/novo")}>
              + Criar Novo Teste
            </Button>
          </div>
        </header>

        <div className="grid gap-4">
          {testes.length > 0 ? (
            testes.map(teste => (
              <div key={teste.id} className="bg-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100 group hover:shadow-md transition-all">
                <div className="mb-4 md:mb-0">
                  <h2 className="font-black text-[#025E65] text-xl uppercase italic leading-tight">{teste.nome}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Link Ativo:</span>
                    <code className="text-[10px] bg-gray-50 text-[#F37B21] px-2 py-0.5 rounded font-bold">/fazer-teste/{teste.slug}</code>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="primary"
                    onClick={() => copiarLink(teste.slug)}
                    className="flex-1 md:flex-none"
                  >
                    🔗 Copiar Link
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/perguntas?quiz_id=${teste.id}`)}
                    className="flex-1 md:flex-none border-gray-100"
                  >
                    ⚙️ Perguntas
                  </Button>

                  {/* BOTÃO DE EXCLUSÃO */}
                  <Button
                    variant="ghost"
                    onClick={() => handleExcluirTeste(teste.id, teste.nome)}
                    className="flex-1 md:flex-none"
                  >
                    🗑️ Excluir
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-300 font-black uppercase text-sm tracking-widest italic">
                Nenhum teste configurado ainda.
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard/testes/novo")}
                className="mt-4"
              >
                Criar meu primeiro teste
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em]">
            Sistema de Gestão de Provas v3.0
          </p>
        </footer>
      </div>
    </main>
  );
}