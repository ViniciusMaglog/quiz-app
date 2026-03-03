import { supabase } from "@/lib/supabase";
import { Question, Result } from "@/types/quiz";

export const QuizService = {
  /**
   * Busca perguntas vinculadas a um Quiz específico
   */
  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    if (!quizId) return [];

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("ativa", true);

    if (error) {
      console.error("Erro ao buscar perguntas do quiz:", error);
      return [];
    }

    return (data || []).sort(() => Math.random() - 0.5) as Question[];
  },

  /**
   * Salva o resultado do candidato
   */
  async saveResult(result: Result): Promise<void> {
    const { error } = await supabase
      .from("results")
      .insert([result]);

    if (error) {
      console.error("Erro ao salvar resultado:", error);
      throw error;
    }
  },

  /**
   * EXCLUIR UM TESTE (O método que estava faltando)
   */
  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir teste:", error);
      throw error;
    }
  },

  /**
   * Registra estatísticas de erro/acerto
   */
  async logQuestionStat(questionId: string, enunciado: string, wasCorrect: boolean): Promise<void> {
    try {
      const { data } = await supabase
        .from("question_stats")
        .select("id, total_respostas, total_erros")
        .eq("question_id", questionId)
        .maybeSingle();

      if (data) {
        await supabase
          .from("question_stats")
          .update({
            total_respostas: data.total_respostas + 1,
            total_erros: wasCorrect ? data.total_erros : data.total_erros + 1,
            updated_at: new Date()
          })
          .eq("id", data.id);
      } else {
        await supabase
          .from("question_stats")
          .insert([{
            question_id: questionId,
            enunciado: enunciado,
            total_respostas: 1,
            total_erros: wasCorrect ? 0 : 1
          }]);
      }
    } catch (err) {
      console.error("Erro ao logar estatística:", err);
    }
  },

  async resetQuestionStats(): Promise<void> {
    const { error } = await supabase
      .from("question_stats")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); 

    if (error) {
      console.error("Erro ao resetar estatísticas:", error);
      throw error;
    }
  }
};