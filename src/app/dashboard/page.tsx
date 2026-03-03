"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Result } from "@/types/quiz";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTeste, setFiltroTeste] = useState("todos");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("results")
        .select(`*, quizzes ( nome )`)
        .order("created_at", { ascending: false });

      if (data) setResults(data as any);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  // --- ESTATÍSTICAS AGRUPADAS ---
  const statsPorQuiz = useMemo(() => {
    const agrupado = results.reduce((acc: any, curr: any) => {
      const nome = curr.quizzes?.nome || "Geral";
      if (!acc[nome]) acc[nome] = { total: 0, soma: 0, nome };
      acc[nome].total += 1;
      acc[nome].soma += Number(curr.percentual);
      return acc;
    }, {});
    return Object.values(agrupado);
  }, [results]);

  // --- FILTRO UNIFICADO ---
  const resultadosFiltrados = useMemo(() => {
    return results.filter(res => {
      const bateNome = res.user_name.toLowerCase().includes(busca.toLowerCase());
      const bateTeste = filtroTeste === "todos" || res.quizzes?.nome === filtroTeste;
      return bateNome && bateTeste;
    });
  }, [results, busca, filtroTeste]);

  // --- FUNÇÃO DE EXPORTAÇÃO RESTAURADA ---
  const exportarRelatorio = () => {
    if (resultadosFiltrados.length === 0) return;
    const headers = ["Candidato", "Teste", "Score", "Data"];
    const rows = resultadosFiltrados.map(res => [
      res.user_name,
      res.quizzes?.nome || "Geral",
      `${res.percentual}%`,
      new Date(res.created_at!).toLocaleDateString('pt-BR')
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_dashboard.csv`;
    link.click();
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-[#025E65] font-black animate-pulse italic uppercase tracking-tighter">
      Sincronizando Dados Logísticos...
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#025E65] italic tracking-tighter uppercase leading-none">Painel de Gestão</h1>
            <p className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.3em] mt-1">Vinicius • Logística & Excel PRO</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={exportarRelatorio} className="py-2 text-[10px]">📥 Exportar</Button>
            <Button variant="secondary" onClick={() => router.push("/dashboard/testes")} className="py-2 text-[10px]">📂 Gerenciar Testes</Button>
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="py-2 text-[10px]">Sair</Button>
          </div>
        </header>

        {/* FILTROS COMPACTOS E FUNCIONAIS */}
        <section className="flex flex-col md:flex-row gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="🔍 PESQUISAR CANDIDATO..." 
              className="w-full p-3 bg-gray-50 rounded-xl font-bold text-[11px] uppercase outline-none focus:border-[#025E65] border-2 border-transparent transition-all"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="relative md:w-72">
            <select 
              className="w-full p-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase outline-none cursor-pointer appearance-none text-[#025E65] border-2 border-transparent"
              value={filtroTeste}
              onChange={(e) => setFiltroTeste(e.target.value)}
            >
              <option value="todos">FILTRAR: TODOS OS TESTES</option>
              {statsPorQuiz.map((s: any) => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
            </select>
            {filtroTeste !== "todos" && (
              <button onClick={() => setFiltroTeste("todos")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500 uppercase">✖</button>
            )}
          </div>
        </section>

        {/* CARDS COM ROLAGEM E PADDING PARA NÃO CORTAR */}
        <section className="mb-10 relative">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Performance por Unidade</h3>
          </div>
          {/* O padding-x (px-4) e padding-bottom (pb-4) impedem que o card "morra" na borda ou esconda a sombra */}
          <div className="flex gap-6 overflow-x-auto px-2 pb-6 snap-x no-scrollbar">
            {statsPorQuiz.map((item: any) => {
              const ativo = filtroTeste === item.nome;
              return (
                <div 
                  key={item.nome} 
                  onClick={() => setFiltroTeste(ativo ? "todos" : item.nome)}
                  className={`min-w-[240px] p-6 rounded-[32px] shadow-sm border-2 transition-all cursor-pointer snap-start flex flex-col justify-between h-36 ${
                    ativo ? 'bg-white border-[#F37B21] scale-105 z-10' : 'bg-white border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <h4 className="text-[#025E65] font-black uppercase italic truncate text-[13px] leading-tight">{item.nome}</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-gray-700 italic">{(item.soma / item.total).toFixed(0)}%</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#F37B21]">{item.total}</span>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Candidatos</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TABELA VERTICAL COM STICKY HEADER */}
        <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
            <h2 className="font-black text-[#025E65] uppercase italic text-xs">Resultados Recentes</h2>
            <span className="text-[10px] font-black text-gray-400 uppercase bg-white px-3 py-1 rounded-full border border-gray-100">
              {resultadosFiltrados.length} Registros
            </span>
          </div>

          <div className="overflow-y-auto max-h-[450px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white z-20 shadow-sm">
                <tr className="text-gray-400 text-[9px] uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="p-6">Candidato</th>
                  <th className="p-6">Teste</th>
                  <th className="p-6 text-center">Desempenho</th>
                  <th className="p-6 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resultadosFiltrados.map((res: any) => (
                  <tr 
                    key={res.id} 
                    onClick={() => router.push(`/dashboard/resultado/${res.id}`)}
                    className="hover:bg-gray-50 transition-all group cursor-pointer"
                  >
                    <td className="p-6 font-black text-gray-700 group-hover:text-[#F37B21] uppercase text-xs">{res.user_name}</td>
                    <td className="p-6">
                      <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                        {res.quizzes?.nome}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black ${
                        Number(res.percentual) >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {Number(res.percentual).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-6 text-right text-gray-400 text-[10px] font-bold">
                      {new Date(res.created_at!).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {resultadosFiltrados.length === 0 && (
              <div className="p-24 text-center text-gray-300 font-black uppercase italic text-[11px] tracking-widest">
                Nenhum registro encontrado.
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}