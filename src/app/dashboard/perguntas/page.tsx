"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Question } from "@/types/quiz";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

// Componente principal com Suspense (necessário para useSearchParams no Next.js)
export default function GerenciarPerguntas() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-[#025E65] animate-pulse uppercase italic">Iniciando Gerenciador...</div>}>
      <GerenciarPerguntasContent />
    </Suspense>
  );
}

function GerenciarPerguntasContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'inativas'>('todas');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Captura o ID do teste específico da URL
  const quizId = searchParams.get("quiz_id");

  // Estados do Formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [enunciado, setEnunciado] = useState("");
  const [opcoes, setOpcoes] = useState(["", "", "", ""]);
  const [correta, setCorreta] = useState(0);

  // Busca as perguntas e configurações específicas desse quiz
  useEffect(() => {
    if (quizId) {
      fetchQuestions();
      fetchQuizSettings();
    } else {
        // Se não houver ID na URL, volta para a lista de testes
        router.push("/dashboard/testes");
    }
  }, [quizId]);

  async function fetchQuizSettings() {
    const { data } = await supabase
      .from("quizzes")
      .select("tempo_total")
      .eq("id", quizId)
      .single();
    
    // O tempo agora vem da tabela quizzes, vinculada a este teste
    if (data) setTempoConfig(data.tempo_total);
  }

  const [tempoConfig, setTempoConfig] = useState(60);

  async function handleSaveSettings() {
    const { error } = await supabase
      .from("quizzes")
      .update({ tempo_total: tempoConfig })
      .eq("id", quizId);

    if (!error) alert("Tempo do teste atualizado!");
  }

  async function fetchQuestions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId) // FILTRO POR TESTE
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao buscar questões:", error);
    if (data) setQuestions(data);
    setLoading(false);
  }

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEnunciado(q.enunciado);
    setOpcoes(q.opcoes);
    setCorreta(q.correta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEnunciado("");
    setOpcoes(["", "", "", ""]);
    setCorreta(0);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { 
        enunciado, 
        opcoes, 
        correta, 
        nivel: "basico", 
        quiz_id: quizId // VINCULA À PERGUNTA
    };

    if (editingId) {
      const { error } = await supabase.from("questions").update(payload).eq("id", editingId);
      if (!error) alert("Pergunta atualizada!");
    } else {
      const { error } = await supabase.from("questions").insert([{ ...payload, ativa: true }]);
      if (!error) alert("Nova pergunta cadastrada!");
    }

    cancelEdit();
    fetchQuestions();
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    await supabase.from("questions").update({ ativa: !currentStatus }).eq("id", id);
    fetchQuestions();
  }

  const perguntasExibidas = questions.filter(q => {
    if (filtro === 'ativas') return q.ativa;
    if (filtro === 'inativas') return !q.ativa;
    return true;
  });

  if (loading && questions.length === 0) return (
    <div className="p-20 text-center font-black text-[#025E65] animate-pulse uppercase italic">
      Carregando Inventário do Teste...
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#025E65] italic uppercase tracking-tighter">Gerenciar Perguntas</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Editor de Conteúdo Técnico</p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/dashboard/testes")}>
            Voltar para Testes
          </Button>
        </header>

        {/* Configuração de Tempo específica para ESTE QUIZ */}
        <section className="bg-[#025E65] p-6 rounded-3xl shadow-lg mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl text-2xl">⏱️</div>
            <div>
              <p className="text-[10px] font-black uppercase opacity-60">Configuração de Ritmo</p>
              <h3 className="font-bold">Tempo Total deste Quiz</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              className="w-24 p-3 bg-white/10 rounded-xl border border-white/20 outline-none font-black text-center"
              value={tempoConfig}
              onChange={(e) => setTempoConfig(Number(e.target.value))}
            />
            <span className="font-bold text-xs uppercase">Segundos</span>
            <Button variant="secondary" onClick={handleSaveSettings} className="ml-2">
              Atualizar
            </Button>
          </div>
        </section>

        {/* Formulário Híbrido */}
        <section className={`bg-white p-8 rounded-3xl shadow-lg mb-12 border-l-8 transition-all ${editingId ? 'border-blue-500' : 'border-[#F37B21]'}`}>
          <h2 className="text-xl font-black mb-6 uppercase text-gray-700 italic">
            {editingId ? "📝 Editar Pergunta" : "➕ Adicionar Pergunta ao Teste"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Digite o enunciado da pergunta técnica..."
              className="w-full p-4 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-gray-100 min-h-[100px] font-medium"
              value={enunciado} onChange={e => setEnunciado(e.target.value)} required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opcoes.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${correta === i ? 'border-green-200 bg-green-50' : 'border-transparent bg-gray-50'}`}>
                  <input type="radio" name="correct" checked={correta === i} onChange={() => setCorreta(i)} className="w-5 h-5 accent-green-600 cursor-pointer" />
                  <input
                    placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                    className="w-full bg-transparent outline-none font-bold text-sm text-gray-600"
                    value={opt} onChange={e => {
                      const newOpts = [...opcoes];
                      newOpts[i] = e.target.value;
                      setOpcoes(newOpts);
                    }} required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant={editingId ? "primary" : "secondary"}>
                {editingId ? "Salvar Alterações" : "Adicionar Questão"}
              </Button>
              {editingId && (
                <Button variant="ghost" type="button" onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </section>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-8 bg-white p-2 rounded-2xl shadow-sm w-fit border border-gray-100">
          <Button variant={filtro === 'todas' ? 'primary' : 'ghost'} onClick={() => setFiltro('todas')} className="border-none shadow-none">
            Todas ({questions.length})
          </Button>
          <Button variant={filtro === 'ativas' ? 'success' : 'ghost'} onClick={() => setFiltro('ativas')} className="border-none shadow-none">
            Ativas ({questions.filter(q => q.ativa).length})
          </Button>
          <Button variant={filtro === 'inativas' ? 'danger' : 'ghost'} onClick={() => setFiltro('inativas')} className="border-none shadow-none">
            Inativas ({questions.filter(q => !q.ativa).length})
          </Button>
        </div>

        {/* Lista de Perguntas */}
        <div className="space-y-4">
          {perguntasExibidas.map(q => (
            <div key={q.id} className={`p-6 rounded-3xl bg-white shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${q.ativa ? 'border-gray-100' : 'border-red-50 bg-red-50/20'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${q.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {q.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="text-[9px] font-bold text-gray-300 uppercase">ID: {q.id.substring(0, 8)}</span>
                </div>
                <p className="font-bold text-gray-700 leading-tight">{q.enunciado}</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="ghost" onClick={() => startEdit(q)} className="py-2 px-4">
                  Editar
                </Button>
                <Button
                  variant={q.ativa ? 'danger' : 'success'}
                  onClick={() => toggleStatus(q.id, q.ativa || false)}
                  className="py-2 px-4"
                >
                  {q.ativa ? 'Pausar' : 'Ativar'}
                </Button>
              </div>
            </div>
          ))}
          {perguntasExibidas.length === 0 && !loading && (
            <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 font-bold uppercase text-xs tracking-widest">
              Este teste ainda não possui perguntas. Comece adicionando uma acima!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}