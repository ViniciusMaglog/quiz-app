"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function DetalheResultadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("results")
        .select(`*, quizzes(nome)`)
        .eq("id", id)
        .single();
      
      if (data) setRes(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  const exportarParaExcel = () => {
    if (!res || !res.respostas_detalhadas) {
      alert("Não há dados detalhados para exportar.");
      return;
    }

    const headers = ["Questão", "Resposta do Candidato", "Gabarito", "Resultado"];
    const rows = res.respostas_detalhadas.map((item: any, idx: number) => [
      `Questão ${idx + 1}: ${item.enunciado}`,
      item.alternativa_escolhida,
      item.alternativa_correta,
      item.correto ? "ACERTO" : "ERRO"
    ]);

    const csvContent = "\uFEFF" + [
      [`RELATÓRIO DE PERFORMANCE - ${res.user_name.toUpperCase()}`],
      [`Teste: ${res.quizzes?.nome || "Geral"}`],
      [`Aproveitamento: ${res.percentual}%`],
      [],
      headers,
      ...rows
    ].map(e => e.join(";")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resultado_${res.user_name.replace(/\s/g, '_')}.csv`;
    link.click();
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-[#025E65] font-black animate-pulse italic uppercase">
      Gerando Auditoria Técnica...
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>← Voltar ao Painel</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportarParaExcel}>📥 Exportar Excel</Button>
            <Button variant="primary" onClick={() => window.print()} className="hidden md:flex">🖨️ Imprimir</Button>
          </div>
        </header>

        {/* RESUMO DO CANDIDATO */}
        <div className="bg-white rounded-[40px] p-10 shadow-sm border-t-[12px] border-[#025E65] mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Performance do Candidato</p>
              <h2 className="text-4xl font-black text-[#025E65] uppercase italic leading-none">{res.user_name}</h2>
              <div className="flex items-center gap-2 mt-4">
                 <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {res.quizzes?.nome || "Geral"}
                 </span>
                 <span className="text-gray-300 font-bold text-[10px] uppercase tracking-widest">
                    Realizado em {new Date(res.created_at).toLocaleDateString('pt-BR')}
                 </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-6xl font-black italic leading-none ${res.percentual >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                {res.percentual}%
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Aproveitamento Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-gray-50">
            <div>
                <p className="text-[9px] font-black text-gray-300 uppercase">Acertos</p>
                <p className="text-lg font-black text-[#025E65] italic">{res.acertos} de {res.total}</p>
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-300 uppercase">Tempo Gasto</p>
                <p className="text-lg font-black text-[#025E65] italic">{res.tempo_gasto} segundos</p>
            </div>
            <div className="md:text-right">
                <p className="text-[9px] font-black text-gray-300 uppercase">Resultado</p>
                <p className={`text-lg font-black italic ${res.percentual >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                    {res.percentual >= 70 ? '✓ APTO' : '✗ NÃO APTO'}
                </p>
            </div>
          </div>
        </div>

        {/* LISTAGEM DE RESPOSTAS */}
        <div className="space-y-4 mb-12">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-6 text-center">Detalhamento das Questões</h3>
          
          {res.respostas_detalhadas && res.respostas_detalhadas.length > 0 ? (
            res.respostas_detalhadas.map((item: any, idx: number) => (
              <div key={idx} className={`p-8 rounded-[32px] border-l-[12px] bg-white shadow-sm transition-all ${item.correto ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex justify-between items-start gap-4 mb-6">
                  <h4 className="font-black text-[#025E65] text-base uppercase italic leading-tight">
                    <span className="text-gray-200 mr-2 not-italic font-normal">#{idx + 1}</span> {item.enunciado}
                  </h4>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${item.correto ? 'bg-green-500' : 'bg-red-500'}`}>
                    {item.correto ? '✓' : '✗'}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl ${item.correto ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Candidato respondeu:</p>
                    <p className={`text-sm font-bold ${item.correto ? 'text-green-700' : 'text-red-700'}`}>
                      {item.alternativa_escolhida || "Tempo esgotado / Não respondeu"}
                    </p>
                  </div>
                  
                  {!item.correto && (
                    <div className="bg-green-50 p-4 rounded-2xl border-2 border-dashed border-green-100">
                      <p className="text-[9px] font-black text-green-700 uppercase mb-1 text-opacity-60">Gabarito Correto:</p>
                      <p className="text-sm font-bold text-green-700">{item.alternativa_correta}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
              <p className="text-gray-300 font-black uppercase text-xs italic tracking-widest">
                Log de questões indisponível para este registro antigo.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}