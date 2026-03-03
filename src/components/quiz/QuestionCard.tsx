import { Question } from "@/types/quiz";
interface QuestionCardProps {
  question: any;
  onAnswer: (index: number) => void;
  selectedAnswer: number | null; // Novo: saber qual o user clicou
  isCorrect: boolean | null;    // Novo: saber se o que ele clicou está certo
}

export const QuestionCard = ({ question, onAnswer, selectedAnswer, isCorrect }: QuestionCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-8 leading-snug">
        {question.enunciado}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {question.opcoes.map((opcao: string, idx: number) => {
          // Lógica de cores dinâmica
          let buttonClass = "border-gray-100 hover:border-secondary hover:bg-orange-50";
          
          if (selectedAnswer === idx) {
            buttonClass = isCorrect 
              ? "border-green-500 bg-green-50 shadow-inner" 
              : "border-red-500 bg-red-50 shadow-inner";
          }

          return (
            <button
              key={idx}
              disabled={selectedAnswer !== null} // Impede múltiplos cliques
              onClick={() => onAnswer(idx)}
              className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-center group ${buttonClass}`}
            >
              <span className={`flex-shrink-0 w-10 h-10 rounded-lg text-center font-bold leading-10 mr-4 transition-colors ${
                selectedAnswer === idx 
                ? (isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white")
                : "bg-gray-100 group-hover:bg-secondary group-hover:text-white"
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-gray-700 font-medium">{opcao}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};