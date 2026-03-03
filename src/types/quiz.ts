export type Question = {
  id: string;
  quiz_id: string;             // ID do teste ao qual esta pergunta pertence
  enunciado: string;           // O texto da pergunta
  opcoes: string[];            // Array de strings com as alternativas
  correta: number;             // O índice (0, 1, 2...) da resposta certa
  nivel: "basico" | "intermediario" | "avancado";
  created_at?: string;
  ativa?: boolean;             // Para marcar se a questão está ativa ou não
};

// Nova interface para detalhar cada resposta individualmente
export interface RespostaDetalhada {
  enunciado: string;
  alternativa_escolhida: string;
  alternativa_correta: string;
  correto: boolean;
}

export type Result = {
  id?: string;
  quiz_id: string | null;      // Vincula o resultado ao teste específico
  user_name: string;           // Nome do candidato
  acertos: number;             // Quantidade de questões acertadas
  total: number;               // Total de questões do teste
  percentual: number;          // Cálculo (acertos / total) * 100
  tempo_gasto: number;         // Tempo em segundos que o candidato levou
  respostas_detalhadas?: RespostaDetalhada[]; // <-- CAMPO ADICIONADO PARA AUDITORIA
  created_at?: string;
  // Relacionamento opcional para trazer o nome do quiz na Dashboard
  quizzes?: {
    nome: string;
  };
};

export type Quiz = {
  id: string;
  nome: string;                // Nome do teste (Ex: Excel Avançado)
  slug: string;                // Link amigável (Ex: excel-avancado)
  tempo_total: number;         // Configuração de tempo individual do teste
  created_at?: string;
};

// Interface auxiliar para as estatísticas da Dashboard
export interface DashboardStats {
  totalTests: number;
  averageScore: number;
  averageTime: number;
}