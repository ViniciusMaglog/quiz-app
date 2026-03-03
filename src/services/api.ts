import { supabase } from "@/lib/supabase";
import { Question, QuizResult } from "@/types/quiz";

export const QuizService = {
  // Busca 10 questões aleatórias de nível básico
  async getRandomQuestions(limit = 10): Promise<Question[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("nivel", "basico");

    if (error) throw error;
    
    // Sorteio aleatório no front-end para este volume de dados
    return data.sort(() => Math.random() - 0.5).slice(0, limit);
  },

  async saveResult(result: QuizResult) {
    const { data, error } = await supabase.from("results").insert([result]);
    if (error) throw error;
    return data;
  }
};