"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function NovoTestePage() {
  const [nome, setNome] = useState("");
  const [tempo, setTempo] = useState(60);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Função para transformar "Teste de Excel" em "teste-de-excel"
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD') // Remove acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/[\s_-]+/g, '-') // Substitui espaços por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens sobrando no início/fim
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = generateSlug(nome);

    // 1. VALIDADOR: Verifica se já existe um teste com este nome ou slug
    const { data: existing } = await supabase
      .from("quizzes")
      .select("id")
      .or(`nome.eq."${nome}",slug.eq."${slug}"`)
      .maybeSingle();

    if (existing) {
      alert("⚠️ Já existe um teste com este nome ou o link gerado já está em uso. Escolha um nome diferente.");
      setLoading(false);
      return;
    }

    // 2. INSERÇÃO
    const { data, error } = await supabase
      .from("quizzes")
      .insert([{ 
        nome, 
        slug, 
        tempo_total: tempo 
      }])
      .select()
      .single();

    if (error) {
      alert("Erro ao criar teste: " + error.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/perguntas?quiz_id=${data.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-xl mx-auto">
        <header className="mb-10">
          <Button variant="ghost" onClick={() => router.push("/dashboard/testes")}>← Voltar</Button>
          <h1 className="text-3xl font-black text-[#025E65] italic uppercase mt-4 tracking-tighter">Novo Teste Logístico</h1>
        </header>

        <form onSubmit={handleCreate} className="bg-white p-10 rounded-[40px] shadow-xl space-y-8 border-t-8 border-[#F37B21]">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nome do Teste</label>
            <input 
              type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#025E65] outline-none font-bold text-gray-700"
              placeholder="Ex: Processo Seletivo Analista I"
            />
            {nome && (
              <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase italic">
                Link gerado: <span className="text-[#F37B21]">/fazer-teste/{generateSlug(nome)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Duração (Segundos)</label>
            <input 
              type="number" required value={tempo} onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#025E65] outline-none font-bold text-gray-700"
            />
          </div>

          <Button variant="secondary" type="submit" className="w-full py-5 text-sm" disabled={loading}>
            {loading ? "CONFIGURANDO..." : "CRIAR E DEFINIR PERGUNTAS"}
          </Button>
        </form>
      </div>
    </main>
  );
}