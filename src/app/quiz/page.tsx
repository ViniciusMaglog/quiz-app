"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizService } from "@/services/quizService";
import { Question } from "@/types/quiz";
import { Timer } from "@/components/ui/Timer";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { supabase } from "@/lib/supabase";

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60); 
  const [totalQuizTime, setTotalQuizTime] = useState(60); 
  const [loading, setLoading] = useState(true);
  const [candidatoNome, setCandidatoNome] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  
  // NOVO ESTADO: Guarda as respostas escolhidas para o relatório
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const router = useRouter();

  // Função para finalizar o Quiz e salvar os dados
  const finishQuiz = useCallback(async (finalScore: number, nome: string, currentAnswers: number[]) => {
    if (isFinishing) return;
    setIsFinishing(true);

    const percent = Number(((finalScore / questions.length) * 100).toFixed(0));
    const tempoGasto = totalQuizTime - timer;

    // MONTA O MAPA DETALHADO PARA A AUDITORIA
    const mapaRespostas = questions.map((q, index) => {
      const respIndex = currentAnswers[index];
      return {
        enunciado: q.enunciado,
        alternativa_escolhida: respIndex !== undefined ? q.opcoes[respIndex] : "Não respondida",
        alternativa_correta: q.opcoes[q.correta],
        correto: respIndex === q.correta
      };
    });

    try {
      const storedQuizId = localStorage.getItem("active_quiz_id") || "";
      
      // 1. Salva o resultado no Supabase com as RESPOSTAS DETALHADAS
      await QuizService.saveResult({
        quiz_id: storedQuizId,
        user_name: nome,
        acertos: finalScore,
        total: questions.length,
        percentual: percent,
        tempo_gasto: tempoGasto,
        respostas_detalhadas: mapaRespostas // <-- CAMPO ESSENCIAL PARA O RELATÓRIO
      });

      // 2. Notifica o Gestor via Discord
      await fetch("/api/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          score: finalScore,
          total: questions.length,
          percentage: percent,
          quizName: localStorage.getItem("active_quiz_name")
        })
      });

      alert(`Teste finalizado com sucesso, ${nome}! Seus resultados foram enviados para análise.`);
      router.push("/");
    } catch (error) {
      console.error("Erro ao processar fim do quiz:", error);
      router.push("/");
    }
  }, [questions, timer, totalQuizTime, router, isFinishing]);

  // Inicialização
  useEffect(() => {
    const nomeSalvo = localStorage.getItem("candidato_nome");
    if (!nomeSalvo) {
      router.push("/identificacao");
      return;
    }
    setCandidatoNome(nomeSalvo);

    const initQuiz = async () => {
      try {
        const storedQuizId = localStorage.getItem("active_quiz_id");
        const storedTimer = localStorage.getItem("active_quiz_timer");

        if (!storedQuizId) {
          router.push("/");
          return;
        }

        const tempoFinal = Number(storedTimer) || 60;
        setTimer(tempoFinal);
        setTotalQuizTime(tempoFinal);

        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("quiz_id", storedQuizId)
          .eq("ativa", true);

        if (error || !data || data.length === 0) {
          alert("Este teste ainda não possui perguntas cadastradas.");
          router.push("/");
          return;
        }

        setQuestions(data);
        // Inicializa o array de respostas com valores vazios
        setUserAnswers(new Array(data.length).fill(null));
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [router]);

  // Lógica do Cronômetro
  useEffect(() => {
    if (timer > 0 && !loading && !isFinishing) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !isFinishing && !loading) {
      finishQuiz(score, candidatoNome, userAnswers);
    }
  }, [timer, loading, isFinishing, score, candidatoNome, finishQuiz, userAnswers]);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || isFinishing) return;

    const currentQuestion = questions[currentIdx];
    const correct = idx === currentQuestion.correta;

    // Atualiza o mapa de respostas local
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = idx;
    setUserAnswers(newAnswers);

    // Registra estatística
    QuizService.logQuestionStat(currentQuestion.id, currentQuestion.enunciado, correct);

    setSelectedAnswer(idx);
    setIsCorrect(correct);

    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        finishQuiz(newScore, candidatoNome, newAnswers);
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
        <div className="w-12 h-12 border-4 border-[#025E65] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#025E65] font-black uppercase tracking-tighter italic">Sincronizando Módulos...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border-b-4 border-[#F37B21]">
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-1">
              Candidato: <span className="text-[#F37B21]">{candidatoNome}</span>
            </p>
            <p className="text-[#025E65] text-2xl font-black italic uppercase tracking-tighter">
              Questão {currentIdx + 1} <span className="text-gray-200 font-normal not-italic">/ {questions.length}</span>
            </p>
          </div>

          <Timer seconds={timer} totalSeconds={totalQuizTime} />
        </header>

        {questions[currentIdx] && (
          <QuestionCard
            question={questions[currentIdx]}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
          />
        )}

        <footer className="mt-12 text-center border-t border-gray-200 pt-6">
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em]">
            Logística & Excel PRO • Processo Seletivo 2026
          </p>
        </footer>
      </div>
    </main>
  );
}