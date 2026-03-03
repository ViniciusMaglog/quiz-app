import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, score, total, percentage, quizName } = body;

    // Definição de cor baseada na nota (Verde para >= 70%, Vermelho para < 70%)
    const color = percentage >= 70 ? 3066993 : 15158332;

    const discordPayload = {
      embeds: [
        {
          title: "🚀 NOVO TESTE FINALIZADO!",
          color: color,
          fields: [
            {
              name: "👤 Candidato",
              value: `**${name.toUpperCase()}**`,
              inline: true,
            },
            {
              name: "📝 Avaliação",
              value: `**${quizName || "Geral"}**`,
              inline: true,
            },
            {
              name: "📊 Desempenho",
              value: `**${percentage}%** (${score}/${total} acertos)`,
              inline: false,
            },
          ],
          footer: {
            text: `Logística & Excel PRO • ${new Date().toLocaleDateString('pt-BR')}`,
          },
        },
      ],
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) throw new Error("Erro ao enviar para o Discord");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API do Discord:", error);
    return NextResponse.json({ error: "Falha ao enviar notificação" }, { status: 500 });
  }
}